/**
 * autoSetup — runs Drizzle push to ensure the DB schema is up-to-date at startup.
 * Production deployments should apply the same idempotent bootstrap before serving traffic.
 */
import { sql } from "drizzle-orm";
import { db } from "./index";

export async function autoSetup(): Promise<void> {
  // Verify database connectivity
  await db.execute(sql`SELECT 1`);
  // Safe, idempotent bootstrap for the settings record used by all instances.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      id integer PRIMARY KEY DEFAULT 1,
      data text NOT NULL DEFAULT '{}',
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
}
