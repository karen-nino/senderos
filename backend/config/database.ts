interface StrapiEnv {
  (key: string, defaultValue?: unknown): string | number | boolean | undefined;
  int: (key: string, defaultValue?: number) => number;
}

export default ({ env }: { env: StrapiEnv }) => {
  const connectionString = env('DATABASE_URL');

  if (!connectionString || typeof connectionString !== 'string') {
    throw new Error(
      'DATABASE_URL is required. Set DATABASE_URL in your environment (e.g. Neon connection string).'
    );
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      pool: {
        min: 0,
        max: 10,
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
