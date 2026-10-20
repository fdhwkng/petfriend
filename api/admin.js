import apiHandler from "./[...path].js";

// Vercel's file routing does not consistently send nested admin paths through
// the top-level catch-all. Route them through this stable function endpoint.
export default function adminApiHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = (url.searchParams.get("route") || "").split("/").filter(Boolean).join("/");
  if (!route) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ error: "Route tapılmadı." }));
  }

  const query = new URLSearchParams(url.searchParams);
  query.delete("route");
  req.url = `/api/admin/${route}${query.size ? `?${query}` : ""}`;
  return apiHandler(req, res);
}
