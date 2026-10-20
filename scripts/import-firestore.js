import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { ensureSchema, getPool } from "../lib/database.js";

function normalize(value) {
  if (value && typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}

function unpackImage(value) {
  if (typeof value !== "string") return { image: null, contentType: null };
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) return { image: null, contentType: null };
  return { image: Buffer.from(match[2], "base64"), contentType: match[1].toLowerCase() };
}

function firestoreClient() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const app = initializeApp({ credential: cert(serviceAccount) });
    return getFirestore(app);
  }
  const app = initializeApp({ credential: applicationDefault() });
  return getFirestore(app);
}

const firestore = firestoreClient();
const pool = getPool();
await ensureSchema();

async function importCollection(name, resource = name) {
  const snapshot = await firestore.collection(name).get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const record = normalize(doc.data());
    let image = null;
    let contentType = null;
    const imageField = resource === "products" ? "photo" : resource === "brands" ? "logo" : null;
    if (imageField) {
      const unpacked = unpackImage(record[imageField]);
      image = unpacked.image;
      contentType = unpacked.contentType;
      delete record[imageField];
    }
    const createdAt = Number(record.createdAt) || Date.now();
    await pool.query(
      `INSERT INTO catalog_items (resource, id, data, image, image_content_type, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $6)
       ON CONFLICT (resource, id) DO UPDATE SET
         data = EXCLUDED.data,
         image = EXCLUDED.image,
         image_content_type = EXCLUDED.image_content_type,
         created_at = EXCLUDED.created_at,
         updated_at = EXCLUDED.updated_at`,
      [resource, doc.id, JSON.stringify(record), image, contentType, createdAt],
    );
    count += 1;
  }
  console.log(`${name}: ${count} sənəd köçürüldü`);
}

await importCollection("products");
await importCollection("brands");
await importCollection("categories");

const settingsDoc = await firestore.collection("settings").doc("site").get();
if (settingsDoc.exists) {
  await pool.query(
    `INSERT INTO site_settings (key, data, updated_at) VALUES ('site', $1::jsonb, $2)
     ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
    [JSON.stringify(normalize(settingsDoc.data())), Date.now()],
  );
  console.log("settings/site: köçürüldü");
}

const clicks = await firestore.collection("whatsappClicks").get();
for (const doc of clicks.docs) {
  const click = normalize(doc.data());
  await pool.query(
    `INSERT INTO whatsapp_clicks (id, product_id, product_name, created_at)
     VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
    [doc.id || randomUUID(), click.productId || null, String(click.productName || ""), Number(click.createdAt) || Date.now()],
  );
}
console.log(`whatsappClicks: ${clicks.size} sənəd yoxlanıldı`);
await pool.end();