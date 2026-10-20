import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ensureSchema, getPool } from "../lib/database.js";

const COOKIE_NAME = "pf_admin_session";
const SESSION_HOURS = 8;
const MAX_IMAGE_BYTES = 2_500_000;
const imageFieldByResource = { products: "photo", brands: "logo" };
const validResources = new Set(["products", "brands", "categories"]);

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function fail(status, message) {
  throw new HttpError(status, message);
}

async function readJson(req) {
  if (req.body !== undefined) {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
    let value;
    try { value = typeof raw === "string" ? JSON.parse(raw || "{}") : raw; }
    catch { fail(400, "JSON formatı yanlışdır."); }
    if (Buffer.byteLength(JSON.stringify(value ?? {}), "utf8") > 4_000_000) {
      fail(413, "Sorğu çox böyükdür. Şəkli kiçildib yenidən yoxlayın.");
    }
    return value ?? {};
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4_000_000) fail(413, "Sorğu çox böyükdür. Şəkli kiçildib yenidən yoxlayın.");
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { fail(400, "JSON formatı yanlışdır."); }
}

function secureEqual(left, right) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new HttpError(503, "SESSION_SECRET ən azı 32 simvol olmalıdır.");
  }
  const a = createHmac("sha256", secret).update(String(left)).digest();
  const b = createHmac("sha256", secret).update(String(right)).digest();
  return timingSafeEqual(a, b);
}

function originIsSame(req) {
  const origin = req.headers.origin;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim().toLowerCase();
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

function requireSameOrigin(req) {
  if (!originIsSame(req)) fail(403, "Bu sorğu eyni saytdan göndərilməlidir.");
}

function cookieOptions(maxAge) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

function createSessionCookie() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString("base64url");
  const signature = createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");
  return `${COOKIE_NAME}=${payload}.${signature}; ${cookieOptions(SESSION_HOURS * 60 * 60)}`;
}

function sessionToken(req) {
  const cookies = String(req.headers.cookie || "").split(";");
  const entry = cookies.map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return entry ? entry.slice(COOKIE_NAME.length + 1) : "";
}

function isAdmin(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return false;
  const token = sessionToken(req);
  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  try {
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(session.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req) {
  if (!isAdmin(req)) fail(401, "Admin girişi tələb olunur.");
}

function decodeImage(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") fail(400, "Şəkil formatı yanlışdır.");
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    fail(413, "Şəkil 2.5 MB-dan kiçik olmalıdır.");
  }
  return { buffer, contentType: match[1].toLowerCase() };
}

function validateRecord(resource, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) fail(400, "Məlumat formatı yanlışdır.");
  if (resource === "products") {
    if (typeof data.name !== "string" || data.name.trim().length < 1 || data.name.length > 240) fail(400, "Məhsul adı tələb olunur.");
    if (data.description != null && String(data.description).length > 12000) fail(400, "Məhsul açıqlaması çox uzundur.");
    if (data.price != null && data.price !== "" && (!Number.isFinite(Number(data.price)) || Number(data.price) < 0)) fail(400, "Qiymət düzgün deyil.");
    if (data.slug != null && (typeof data.slug !== "string" || data.slug.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug))) fail(400, "Məhsul URL-i yalnız kiçik latın hərfləri, rəqəmlər və defislərdən ibarət olmalıdır.");
    if (data.metaTitle != null && String(data.metaTitle).length > 120) fail(400, "Meta başlıq çox uzundur.");
    if (data.metaDescription != null && String(data.metaDescription).length > 320) fail(400, "Meta təsvir çox uzundur.");
  } else {
    if (typeof data.name !== "string" || data.name.trim().length < 1 || data.name.length > 240) fail(400, resource === "brands" ? "Brend adı tələb olunur." : "Kateqoriya adı tələb olunur.");
  }
  return data;
}

function imageUrl(resource, id, updatedAt) {
  return `/api/media/${resource}/${encodeURIComponent(id)}?v=${updatedAt}`;
}

function serializeRecord(row) {
  const data = { ...(row.data || {}) };
  const field = imageFieldByResource[row.resource];
  if (field) data[field] = (row.has_image || row.image) ? imageUrl(row.resource, row.id, row.updated_at) : null;
  if (data.createdAt == null) data.createdAt = Number(row.created_at);
  return { id: row.id, ...data };
}

async function listRecords(resource, admin) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT resource, id, data, (image IS NOT NULL) AS has_image, created_at, updated_at FROM catalog_items WHERE resource = $1 ORDER BY created_at DESC",
    [resource],
  );
  return result.rows
    .filter((row) => admin || resource !== "products" || row.data.draft !== true)
    .filter((row) => admin || resource !== "brands" || row.data.active !== false)
    .map(serializeRecord);
}

async function getRecord(resource, id, admin, includeImage = false) {
  const imageColumns = includeImage ? "image, image_content_type" : "(image IS NOT NULL) AS has_image";
  const result = await getPool().query(
    `SELECT resource, id, data, ${imageColumns}, created_at, updated_at FROM catalog_items WHERE resource = $1 AND id = $2`,
    [resource, id],
  );
  const row = result.rows[0];
  if (!row || (!admin && resource === "products" && row.data.draft === true) || (!admin && resource === "brands" && row.data.active === false)) return null;
  return row;
}

async function saveRecord(resource, body, id = null) {
  const pool = getPool();
  const field = imageFieldByResource[resource];
  const now = Date.now();
  const input = { ...body };
  const imageValue = field ? input[field] : undefined;
  if (field) delete input[field];

  if (!id) {
    const recordId = randomUUID();
    const record = validateRecord(resource, input);
    if (resource === "products" && record.slug) {
      const duplicate = await pool.query("SELECT id FROM catalog_items WHERE resource = 'products' AND data->>'slug' = $1 LIMIT 1", [record.slug]);
      if (duplicate.rowCount) fail(409, "Bu məhsul URL-i artıq istifadə olunur.");
    }
    const image = field ? decodeImage(imageValue) : null;
    if (field && imageValue && !image) fail(400, "Şəkil URL-i serverə yüklənə bilmədi.");
    const createdAt = Number(record.createdAt) || now;
    await pool.query(
      `INSERT INTO catalog_items (resource, id, data, image, image_content_type, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)`,
      [resource, recordId, JSON.stringify(record), image?.buffer || null, image?.contentType || null, createdAt, now],
    );
    return recordId;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const selected = await client.query(
      "SELECT data, image, image_content_type, created_at FROM catalog_items WHERE resource = $1 AND id = $2 FOR UPDATE",
      [resource, id],
    );
    if (!selected.rows[0]) fail(404, "Qeyd tapılmadı.");
    const previous = selected.rows[0];
    const nextData = { ...previous.data, ...input };
    let nextImage = previous.image;
    let nextContentType = previous.image_content_type;
    if (field && Object.prototype.hasOwnProperty.call(body, field)) {
      if (imageValue == null || imageValue === "") {
        nextImage = null;
        nextContentType = null;
      } else if (typeof imageValue === "string" && imageValue.startsWith("/api/media/")) {
        // The current image URL means the form is saving other fields only.
      } else {
        const image = decodeImage(imageValue);
        if (!image) fail(400, "Şəkil URL-i serverə yüklənə bilmədi.");
        nextImage = image.buffer;
        nextContentType = image.contentType;
      }
    }
    validateRecord(resource, nextData);
    if (resource === "products" && nextData.slug) {
      const duplicate = await client.query("SELECT id FROM catalog_items WHERE resource = 'products' AND id <> $1 AND data->>'slug' = $2 LIMIT 1", [id, nextData.slug]);
      if (duplicate.rowCount) fail(409, "Bu məhsul URL-i artıq istifadə olunur.");
    }
    const createdAt = Number(nextData.createdAt) || Number(previous.created_at) || now;
    await client.query(
      `UPDATE catalog_items SET data = $3::jsonb, image = $4, image_content_type = $5, created_at = $6, updated_at = $7
       WHERE resource = $1 AND id = $2`,
      [resource, id, JSON.stringify(nextData), nextImage, nextContentType, createdAt, now],
    );
    await client.query("COMMIT");
    return id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteRecord(resource, id) {
  if (resource === "products") {
    await getPool().query("DELETE FROM product_reviews WHERE product_id = $1", [id]);
  }
  const result = await getPool().query("DELETE FROM catalog_items WHERE resource = $1 AND id = $2", [resource, id]);
  if (!result.rowCount) fail(404, "Qeyd tapılmadı.");
}

async function listProductReviews(productId) {
  const normalizedId = String(productId || "").trim();
  if (!normalizedId || normalizedId.length > 120) fail(400, "Məhsul seçilməyib.");

  const product = await getPool().query(
    "SELECT id FROM catalog_items WHERE resource = 'products' AND id = $1 AND COALESCE(data->>'draft', 'false') <> 'true'",
    [normalizedId],
  );
  if (!product.rowCount) fail(404, "Məhsul tapılmadı.");

  const result = await getPool().query(
    `SELECT id, customer_name AS name, rating, comment, created_at AS "createdAt"
     FROM product_reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [normalizedId],
  );
  const items = result.rows.map((row) => ({ ...row, rating: Number(row.rating), createdAt: Number(row.createdAt) }));
  const average = items.length
    ? Math.round(items.reduce((sum, review) => sum + review.rating, 0) / items.length * 10) / 10
    : 0;
  return { items, total: items.length, average };
}

async function createProductReview(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) fail(400, "Rəy məlumatları düzgün deyil.");
  if (String(body.website || "").trim()) fail(400, "Rəyi göndərmək mümkün olmadı.");

  const productId = String(body.productId || "").trim();
  const name = String(body.name || "").trim();
  const comment = String(body.comment || "").trim();
  const rating = Number(body.rating);
  if (!productId || productId.length > 120) fail(400, "Məhsul seçilməyib.");
  if (name.length < 2 || name.length > 80) fail(400, "Ad 2–80 simvol arasında olmalıdır.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) fail(400, "1-dən 5-ə qədər qiymət seçin.");
  if (comment.length < 10 || comment.length > 1200) fail(400, "Rəy 10–1200 simvol arasında olmalıdır.");

  const product = await getPool().query(
    "SELECT id FROM catalog_items WHERE resource = 'products' AND id = $1 AND COALESCE(data->>'draft', 'false') <> 'true'",
    [productId],
  );
  if (!product.rowCount) fail(404, "Məhsul tapılmadı.");

  const id = randomUUID();
  const createdAt = Date.now();
  await getPool().query(
    `INSERT INTO product_reviews (id, product_id, customer_name, rating, comment, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, productId, name, rating, comment, createdAt],
  );
  return { id, productId, name, rating, comment, createdAt };
}

async function getSettings() {
  const result = await getPool().query("SELECT data FROM site_settings WHERE key = 'site'");
  return result.rows[0]?.data ?? null;
}

async function putSettings(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) fail(400, "Ayarların formatı yanlışdır.");
  if (body.themeColor && !/^#[0-9a-fA-F]{6}$/.test(body.themeColor)) fail(400, "Sayt rəngi düzgün deyil.");
  await getPool().query(
    `INSERT INTO site_settings (key, data, updated_at) VALUES ('site', $1::jsonb, $2)
     ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
    [JSON.stringify(body), Date.now()],
  );
}

async function trackClick(body) {
  const id = randomUUID();
  await getPool().query(
    "INSERT INTO whatsapp_clicks (id, product_id, product_name, created_at) VALUES ($1, $2, $3, $4)",
    [id, body.productId ? String(body.productId).slice(0, 120) : null, String(body.productName || "").slice(0, 240), Date.now()],
  );
  return id;
}

async function listClicks() {
  const pool = getPool();
  const [countResult, result] = await Promise.all([
    pool.query("SELECT count(*)::int AS total FROM whatsapp_clicks"),
    pool.query(
      `SELECT id, product_id AS "productId", product_name AS "productName", created_at AS "createdAt" FROM whatsapp_clicks ORDER BY created_at DESC LIMIT 500`,
    ),
  ]);
  return {
    total: Number(countResult.rows[0].total),
    items: result.rows.map((row) => ({ ...row, createdAt: Number(row.createdAt) })),
  };
}

function requestIpHash(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  return createHmac("sha256", process.env.SESSION_SECRET).update(forwarded).digest("hex");
}

async function checkLoginThrottle(req) {
  const pool = getPool();
  const ipHash = requestIpHash(req);
  const cutoff = Date.now() - 15 * 60 * 1000;
  await pool.query("DELETE FROM admin_login_attempts WHERE attempted_at < $1", [cutoff - 60 * 60 * 1000]);
  const result = await pool.query(
    "SELECT count(*)::int AS attempts FROM admin_login_attempts WHERE ip_hash = $1 AND attempted_at >= $2",
    [ipHash, cutoff],
  );
  if (result.rows[0].attempts >= 10) fail(429, "Çox sayda uğursuz cəhd oldu. 15 dəqiqə sonra yenidən yoxlayın.");
  return ipHash;
}
async function mediaResponse(req, res, resource, id) {
  if (!imageFieldByResource[resource]) fail(404, "Şəkil tapılmadı.");
  const row = await getRecord(resource, id, isAdmin(req), true);
  if (!row?.image) fail(404, "Şəkil tapılmadı.");
  res.statusCode = 200;
  res.setHeader("Content-Type", row.image_content_type || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(row.image);
}

async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const parts = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
  if (parts[0] !== "api") return sendJson(res, 404, { error: "Route tapılmadı." });
  const adminRoute = parts[1] === "admin";
  const route = adminRoute ? parts.slice(2) : parts.slice(1);
  const resource = route[0];
  const id = route[1];

  if (adminRoute && resource === "login" && req.method === "POST") {
    requireSameOrigin(req);
    const body = await readJson(req);
    if (!process.env.ADMIN_PASSWORD) fail(503, "ADMIN_PASSWORD server mühitində təyin edilməyib.");
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) fail(503, "SESSION_SECRET ən azı 32 simvol olmalıdır.");
    await ensureSchema();
    const resolvedIpHash = await checkLoginThrottle(req);
    if (!secureEqual(body.password || "", process.env.ADMIN_PASSWORD)) {
      await getPool().query("INSERT INTO admin_login_attempts (ip_hash, attempted_at) VALUES ($1, $2)", [resolvedIpHash, Date.now()]);
      fail(401, "Şifrə yanlışdır.");
    }
    await getPool().query("DELETE FROM admin_login_attempts WHERE ip_hash = $1", [resolvedIpHash]);
    res.setHeader("Set-Cookie", createSessionCookie());
    return sendJson(res, 200, { authenticated: true });
  }

  if (adminRoute && resource === "logout" && req.method === "POST") {
    requireSameOrigin(req);
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieOptions(0)}`);
    return sendJson(res, 200, { authenticated: false });
  }

  if (adminRoute && resource === "session" && req.method === "GET") {
    return sendJson(res, 200, { authenticated: isAdmin(req) });
  }

  if (!adminRoute && resource === "media" && id && route[2] && req.method === "GET") {
    await ensureSchema();
    return mediaResponse(req, res, id, route[2]);
  }

  if (adminRoute) requireAdmin(req);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) requireSameOrigin(req);
  await ensureSchema();

  if (resource === "settings" && (!id || id === "site")) {
    if (req.method === "GET") return sendJson(res, 200, await getSettings());
    if (adminRoute && req.method === "PUT") {
      await putSettings(await readJson(req));
      return sendJson(res, 200, { saved: true });
    }
    return fail(405, "Method not allowed.");
  }

  if (resource === "whatsapp-clicks" && !adminRoute && req.method === "POST") {
    const body = await readJson(req);
    const clickId = await trackClick(body);
    return sendJson(res, 201, { id: clickId });
  }

  if (resource === "whatsapp-clicks" && adminRoute && req.method === "GET") {
    return sendJson(res, 200, await listClicks());
  }

  if (resource === "reviews" && !adminRoute) {
    if (req.method === "GET") {
      return sendJson(res, 200, await listProductReviews(url.searchParams.get("productId")));
    }
    if (req.method === "POST") {
      return sendJson(res, 201, await createProductReview(await readJson(req)));
    }
    res.setHeader("Allow", "GET, POST");
    return fail(405, "Method not allowed.");
  }

  if (!validResources.has(resource)) return sendJson(res, 404, { error: "Route tapılmadı." });
  if (resource === "categories" && !adminRoute && id) return sendJson(res, 404, { error: "Qeyd tapılmadı." });

  if (!id && req.method === "GET") {
    return sendJson(res, 200, await listRecords(resource, adminRoute));
  }
  if (!id && adminRoute && req.method === "POST") {
    const recordId = await saveRecord(resource, await readJson(req));
    return sendJson(res, 201, { id: recordId });
  }
  if (id && req.method === "GET") {
    const row = await getRecord(resource, id, adminRoute);
    return row ? sendJson(res, 200, serializeRecord(row)) : sendJson(res, 404, { error: "Qeyd tapılmadı." });
  }
  if (id && adminRoute && req.method === "PATCH") {
    const recordId = await saveRecord(resource, await readJson(req), id);
    return sendJson(res, 200, { id: recordId });
  }
  if (id && adminRoute && req.method === "DELETE") {
    await deleteRecord(resource, id);
    return sendJson(res, 200, { deleted: true });
  }
  return sendJson(res, 405, { error: "Method not allowed." });
}

export default async function apiHandler(req, res) {
  try {
    await handler(req, res);
  } catch (error) {
    const status = Number(error.statusCode) || 500;
    if (status >= 500) console.error("Pet Friend API error:", error);
    if (!res.headersSent) sendJson(res, status, { error: status >= 500 && status !== 503 ? "Server xətası." : error.message || "Server xətası." });
    else res.end();
  }
}
