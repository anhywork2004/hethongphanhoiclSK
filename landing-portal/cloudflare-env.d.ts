import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare global {
  type D1Database = import("@cloudflare/workers-types").D1Database;
  type R2Bucket = import("@cloudflare/workers-types").R2Bucket;

  interface CloudflareEnv {
    DB: D1Database;
    UPLOADS: R2Bucket;
    AUTH_SECRET?: string;
    JWT_SECRET?: string;
    ZALO_OA_ACCESS_TOKEN?: string;
    ZALO_OA_ID?: string;
  }

  type LayoutProps = {
    children: React.ReactNode;
  };
}

export {};
