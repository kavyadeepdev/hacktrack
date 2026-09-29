import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazy Neon client. Throws a helpful error when `DATABASE_URL` is missing
 * so the localStorage MVP keeps working in dev until Neon is configured.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. See docs/neon.md — run `neon connection-string` then export it."
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}
