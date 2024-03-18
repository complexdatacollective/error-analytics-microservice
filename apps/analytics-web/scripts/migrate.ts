import dotenv from 'dotenv';
dotenv.config();

import { migrate } from 'drizzle-orm/vercel-postgres/migrator';
import { db } from '~/db/db';

export async function runMigration() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running migration:', error);
  }
}

await runMigration();
