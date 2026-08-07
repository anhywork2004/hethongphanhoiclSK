import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB?: D1Database;
    UPLOADS?: R2Bucket;
    AUTH_SECRET?: string;
    JWT_SECRET?: string;
  }
}

export {};
