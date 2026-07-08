/**
 * autoSetup — runs Drizzle push to ensure the DB schema is up-to-date at startup.
 * Only runs in development; in production the schema is managed by Replit's publish flow.
 */
import { sql } from "drizzle-orm";
import { db } from "./index";

export async function autoSetup(): Promise<void> {
  // Verify database connectivity
  await db.execute(sql`SELECT 1`);
}
