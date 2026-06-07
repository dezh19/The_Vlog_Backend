export default () => ({
  serializers: {
    err(err: Error & { errors?: unknown[] }) {
      const base: Record<string, unknown> = {
        type: err.constructor?.name ?? "Error",
        message: err.message,
        stack: err.stack,
      };

      if (Array.isArray(err.errors) && err.errors.length > 0) {
        base.errors = err.errors.map((e) => {
          const error = e as NodeJS.ErrnoException;
          return {
            type: error.constructor?.name ?? "Error",
            message: error.message,
            code: error.code,
          };
        });
      }

      return base;
    },
  },
});
