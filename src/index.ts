import type { Core } from "@strapi/strapi";

// Log inner errors inside AggregateError — makes Render startup failures readable
process.on("uncaughtException", (err: Error) => {
  const inner = (err as Error & { errors?: unknown[] }).errors;
  if (Array.isArray(inner) && inner.length > 0) {
    console.error("[startup] AggregateError – inner errors:");
    inner.forEach((e) => {
      const error = e as NodeJS.ErrnoException;
      console.error(`  [${error.constructor?.name ?? "Error"}] ${error.message ?? String(e)}${error.code ? ` (code=${error.code})` : ""}`);
    });
  }
  // Let Strapi's own shutdown handler take over after logging
});

// Env-var readiness snapshot — runs at module load, before DB connection attempt
console.log(
  "[startup] env check —",
  "DATABASE_CLIENT=" + (process.env.DATABASE_CLIENT ?? "unset"),
  "| DATABASE_URL=" + (process.env.DATABASE_URL ? "[SET]" : "[MISSING]"),
  "| APP_KEYS=" + (process.env.APP_KEYS ? "[SET]" : "[MISSING]"),
  "| ADMIN_JWT_SECRET=" + (process.env.ADMIN_JWT_SECRET ? "[SET]" : "[MISSING]"),
  "| NODE_ENV=" + (process.env.NODE_ENV ?? "unset")
);

let rebuildTimer: NodeJS.Timeout | null = null;

function shouldSkipModel(model?: string): boolean {
  if (!model) return true;
  return (
    model.startsWith("admin::") ||
    model.startsWith("plugin::") ||
    model.startsWith("strapi::") ||
    model.startsWith("api::users-permissions")
  );
}

async function dispatchNetlifyRebuild(strapi: Core.Strapi) {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

  if (!hookUrl) {
    strapi.log.debug("[netlify-dispatch] Skipped (NETLIFY_BUILD_HOOK_URL not set).");
    return;
  }

  const response = await fetch(hookUrl, { method: "POST" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Netlify build hook failed (${response.status}): ${text || response.statusText}`);
  }

  strapi.log.info("[netlify-dispatch] Triggered Netlify frontend rebuild.");
}

async function dispatchGitHubRebuild(strapi: Core.Strapi, reason: string) {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const eventType = process.env.GITHUB_ACTIONS_EVENT_TYPE || "strapi-content-updated";
  const token = process.env.GITHUB_ACTIONS_DISPATCH_TOKEN;
  const branch = process.env.GITHUB_REPO_BRANCH || "main";

  if (!owner || !repo || !token) {
    strapi.log.debug(
      "[github-dispatch] Skipped (missing GITHUB_REPO_OWNER, GITHUB_REPO_NAME, or GITHUB_ACTIONS_DISPATCH_TOKEN)."
    );
    return;
  }

  const endpoint = `https://api.github.com/repos/${owner}/${repo}/dispatches`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "the-vlog-backend-dispatch",
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: {
        source: "strapi",
        reason,
        branch,
        timestamp: new Date().toISOString(),
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub dispatch failed (${response.status}): ${text || response.statusText}`);
  }

  strapi.log.info(`[github-dispatch] Triggered GitHub Actions rebuild (${eventType}).`);
}

async function dispatchFrontendRebuild(strapi: Core.Strapi, reason: string) {
  await Promise.allSettled([
    dispatchNetlifyRebuild(strapi).catch((err) =>
      strapi.log.error("[netlify-dispatch] Failed to trigger rebuild", err)
    ),
    dispatchGitHubRebuild(strapi, reason).catch((err) =>
      strapi.log.error("[github-dispatch] Failed to trigger rebuild", err)
    ),
  ]);
}

function scheduleFrontendRebuild(strapi: Core.Strapi, reason: string) {
  const debounceMs = Number(process.env.REBUILD_DEBOUNCE_MS || process.env.GITHUB_REBUILD_DEBOUNCE_MS || "15000");

  if (rebuildTimer) {
    clearTimeout(rebuildTimer);
  }

  rebuildTimer = setTimeout(async () => {
    rebuildTimer = null;
    await dispatchFrontendRebuild(strapi, reason);
  }, debounceMs);
}

export default {
  register(/*{ strapi }: { strapi: Core.Strapi }*/) {},
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      afterCreate(event) {
        if (shouldSkipModel(event.model?.uid)) return;
        scheduleFrontendRebuild(strapi, `afterCreate:${event.model?.uid || "unknown"}`);
      },
      afterUpdate(event) {
        if (shouldSkipModel(event.model?.uid)) return;
        scheduleFrontendRebuild(strapi, `afterUpdate:${event.model?.uid || "unknown"}`);
      },
      afterDelete(event) {
        if (shouldSkipModel(event.model?.uid)) return;
        scheduleFrontendRebuild(strapi, `afterDelete:${event.model?.uid || "unknown"}`);
      },
    });

    strapi.log.info("[github-dispatch] CMS change hooks registered");
  },
};
