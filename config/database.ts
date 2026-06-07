import path from "path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", env("DATABASE_URL", "") ? "postgres" : "sqlite");
  const configuredFilename = env("DATABASE_FILENAME", ".tmp/data.db");
  const appRoot = __dirname.includes(`${path.sep}dist${path.sep}config`)
    ? path.resolve(__dirname, "..", "..")
    : path.resolve(__dirname, "..");
  const sqliteFilename = path.isAbsolute(configuredFilename)
    ? configuredFilename
    : path.resolve(appRoot, configuredFilename);
  const sslEnabled = env.bool("DATABASE_SSL", false);
  const sslConfig = sslEnabled
    ? {
        rejectUnauthorized: !env.bool("DATABASE_SSL_SELF", true),
      }
    : false;

  const rawDbUrl = env("DATABASE_URL", "");
  if (client === "postgres" && rawDbUrl) {
    try {
      const parsed = new URL(rawDbUrl);
      if (!parsed.hostname) {
        throw new Error(
          `[database] DATABASE_URL has no hostname ("${rawDbUrl.slice(0, 40)}..."). ` +
          "Set the correct Internal Connection String from the Render PostgreSQL dashboard."
        );
      }
    } catch (err) {
      if ((err as Error).message.startsWith("[database]")) throw err;
      throw new Error(`[database] DATABASE_URL is not a valid URL: ${(err as Error).message}`);
    }
  }

  const connections = {
    sqlite: {
      connection: {
        filename: sqliteFilename,
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: rawDbUrl
        ? {
            connectionString: rawDbUrl,
            ssl: sslConfig,
          }
        : {
            host: env("DATABASE_HOST", "127.0.0.1"),
            port: env.int("DATABASE_PORT", 5432),
            database: env("DATABASE_NAME", "strapi"),
            user: env("DATABASE_USERNAME", "strapi"),
            password: env("DATABASE_PASSWORD", "strapi"),
            ssl: sslConfig,
          },
      schema: env("DATABASE_SCHEMA", "public"),
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
