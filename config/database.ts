import path from "path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", env("DATABASE_URL") ? "postgres" : "sqlite");
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

  const connections = {
    sqlite: {
      connection: {
        filename: sqliteFilename,
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: env("DATABASE_URL")
        ? {
            connectionString: env("DATABASE_URL"),
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
