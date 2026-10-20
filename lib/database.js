import pg from "pg";

const { Pool } = pg;
let pool;
let schemaPromise;

const schemaSql = `
  CREATE TABLE IF NOT EXISTS catalog_items (
    resource text NOT NULL CHECK (resource IN ('products', 'brands', 'categories')),
    id text NOT NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    image bytea,
    image_content_type text,
    created_at bigint NOT NULL,
    updated_at bigint NOT NULL,
    PRIMARY KEY (resource, id)
  );
  CREATE INDEX IF NOT EXISTS catalog_items_recent_idx
    ON catalog_items (resource, created_at DESC);

  CREATE TABLE IF NOT EXISTS site_settings (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at bigint NOT NULL
  );

  CREATE TABLE IF NOT EXISTS whatsapp_clicks (
    id text PRIMARY KEY,
    product_id text,
    product_name text NOT NULL DEFAULT '',
    created_at bigint NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_clicks_recent_idx
    ON whatsapp_clicks (created_at DESC);

  CREATE TABLE IF NOT EXISTS admin_login_attempts (
    ip_hash text NOT NULL,
    attempted_at bigint NOT NULL
  );
  CREATE INDEX IF NOT EXISTS admin_login_attempts_recent_idx
    ON admin_login_attempts (ip_hash, attempted_at DESC);
`;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL is not configured.");
    error.statusCode = 503;
    throw error;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: process.env.VERCEL ? 4 : 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = getPool().query(schemaSql).catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}