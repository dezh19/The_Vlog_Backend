function resolvePublicUrl(env: (key: string, fallback?: string) => string): string {
  const candidates = [
    env("RENDER_EXTERNAL_HOSTNAME", "") && `https://${env("RENDER_EXTERNAL_HOSTNAME", "")}`,
    env("PUBLIC_URL", ""),
    `http://${env("HOST", "localhost")}:${env("PORT", "1337")}`,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      new URL(candidate);
      return candidate;
    } catch {
      // try next
    }
  }

  return "http://localhost:1337";
}

export default ({ env }) => {
  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    url: resolvePublicUrl(env),
    proxy: env.bool("IS_PROXIED", true),
    app: {
      keys: env.array("APP_KEYS"),
    },
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
  };
};
