export default ({ env }) => {
  // Construct PUBLIC_URL with fallback for Render builds
  let publicUrl = env("PUBLIC_URL", "");
  
  // If no PUBLIC_URL set but running on Render, use placeholder during build
  if (!publicUrl && env("RENDER")) {
    publicUrl = "http://localhost:1337";
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
