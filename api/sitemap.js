import { ensureSchema, getPool } from "../lib/database.js";

const SITE_ORIGIN = "https://petfriend.az";

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);
}

export default async function sitemap(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end("Method not allowed");
  }

  try {
    await ensureSchema();
    const [result, brandResult] = await Promise.all([
      getPool().query(
      "SELECT id, data, updated_at FROM catalog_items WHERE resource = 'products' AND COALESCE(data->>'draft', 'false') <> 'true' ORDER BY created_at DESC",
      ),
      getPool().query(
        "SELECT data, updated_at FROM catalog_items WHERE resource = 'brands' AND COALESCE(data->>'active', 'true') <> 'false' ORDER BY created_at DESC",
      ),
    ]);
    const productUrls = result.rows.map((row) => {
      const slug = row.data?.slug;
      const path = typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
        ? `/mehsul/${encodeURIComponent(slug)}`
        : `/mehsul?id=${encodeURIComponent(row.id)}`;
      const modified = new Date(Number(row.updated_at));
      const lastmod = Number.isNaN(modified.getTime()) ? "" : `<lastmod>${modified.toISOString().slice(0, 10)}</lastmod>`;
      return `<url><loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>${lastmod}</url>`;
    });
    const brandUrls = brandResult.rows.flatMap((row) => {
      const slug = row.data?.slug;
      if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return [];
      const modified = new Date(Number(row.updated_at));
      const lastmod = Number.isNaN(modified.getTime()) ? "" : `<lastmod>${modified.toISOString().slice(0, 10)}</lastmod>`;
      return [`<url><loc>${escapeXml(`${SITE_ORIGIN}/brend/${encodeURIComponent(slug)}`)}</loc>${lastmod}</url>`];
    });
    const urls = [`<url><loc>${SITE_ORIGIN}/</loc></url>`, ...productUrls, ...brandUrls].join("");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    return res.end("Sitemap is temporarily unavailable.");
  }
}
