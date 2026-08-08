import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(d1?: D1Database) {
  if (d1) {
    return drizzleD1(d1, { schema });
  }
  
  // Try to access Cloudflare global context or process env if available
  const globalD1 = (globalThis as unknown as { process?: { env?: { DB?: D1Database } } })?.process?.env?.DB;
  if (globalD1) {
    return drizzleD1(globalD1, { schema });
  }

  throw new Error("Cloudflare D1 binding (DB) is not available.");
}

export { schema };
