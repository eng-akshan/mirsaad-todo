import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Client generation during an image build does not need a live database or a secret.
// Runtime commands always receive the real DATABASE_URL from Coolify.
const buildSafeDatabaseUrl = process.env.DATABASE_URL
  ?? 'postgresql://build:build@127.0.0.1:5432/postgres?schema=mirsaad_todo';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: buildSafeDatabaseUrl,
  },
});
