export default ({ env }) => {
  // Construct PUBLIC_URL with fallback for Render builds
  let publicUrl = env("PUBLIC_URL", "");
  
  // During Render build/deploy, construct URL from RENDER_EXTERNAL_HOSTNAME
  if (!publicUrl) {
    if (env("RENDER_EXTERNAL_HOSTNAME")) {
      publicUrl = `https://${env("RENDER_EXTERNAL_HOSTNAME")}`;
    } else {
      // Fallback for local build environment
      publicUrl = "http://localhost:1337";
    }
  }
  
  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    url: publicUrl,
    proxy: env.bool("IS_PROXIED", true),
    app: {
      keys: env.array("APP_KEYS"),
    },
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
  };
};
