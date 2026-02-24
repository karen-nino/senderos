interface StrapiEnv {
  (key: string, defaultValue?: unknown): string | number | boolean | undefined;
  int: (key: string, defaultValue?: number) => number;
}

export default ({ env }: { env: StrapiEnv }) => {
  // Empty fallback so Docker build succeeds; Fly provides DATABASE_URL only at runtime.
  const connectionString = String(env('DATABASE_URL', ''));
  const useSsl = connectionString.length > 0;

  return {
    connection: {
      client: 'postgres',
      connection: {
        connectionString,
        ...(useSsl && {
          ssl: { rejectUnauthorized: false },
        }),
      },
      pool: {
        min: 0,
        max: 10,
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
