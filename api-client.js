const collectionRoutes = {
  products: "products",
  brands: "brands",
  categories: "categories",
  settings: "settings",
  whatsappClicks: "whatsapp-clicks",
};

async function request(path, options = {}, allowNotFound = false) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  if (allowNotFound && response.status === 404) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Sorğu alınmadı (${response.status}).`);
  return payload;
}

export function createApiAdapter(admin = false) {
  const db = { admin };
  const root = admin ? "/api/admin" : "/api";

  function collection(_db, name) {
    return { kind: "collection", name, admin };
  }

  function doc(_db, name, id) {
    return { kind: "document", name, id, admin };
  }

  function endpoint(reference) {
    const route = collectionRoutes[reference.name];
    if (!route) throw new Error(`Naməlum məlumat bölməsi: ${reference.name}`);
    const base = `${root}/${route}`;
    if (reference.kind === "document" && reference.name !== "settings") {
      return `${base}/${encodeURIComponent(reference.id)}`;
    }
    return base;
  }

  function snapshot(value) {
    if (value == null) return { id: undefined, exists: () => false, data: () => undefined };
    const { id, ...data } = value;
    return { id, exists: () => true, data: () => data };
  }

  async function getDocs(reference) {
    const result = await request(endpoint(reference));
    const rows = Array.isArray(result) ? result : (result.items || []);
    return {
      docs: rows.map((row) => snapshot(row)),
      size: Array.isArray(result) ? rows.length : Number(result.total ?? rows.length),
      empty: rows.length === 0,
    };
  }

  async function getDoc(reference) {
    const value = await request(endpoint(reference), {}, true);
    return snapshot(value);
  }

  async function addDoc(reference, data) {
    return request(endpoint(reference), { method: "POST", body: JSON.stringify(data) });
  }

  async function updateDoc(reference, data) {
    return request(endpoint(reference), { method: "PATCH", body: JSON.stringify(data) });
  }

  async function deleteDoc(reference) {
    return request(endpoint(reference), { method: "DELETE" });
  }

  async function setDoc(reference, data) {
    return request(endpoint(reference), { method: "PUT", body: JSON.stringify(data) });
  }

  function query(reference) {
    return reference;
  }

  function orderBy() {
    return null;
  }

  return { db, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy };
}