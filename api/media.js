import apiHandler from "./[...path].js";

// Route nested media requests through a stable function endpoint on Vercel.
export default function mediaApiHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = (url.searchParams.get("route") || "").split("/").filter(Boolean).join("/");
  if (!route) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ error: "Şəkil tapılmadı." }));
  }

  const query = new URLSearchParams(url.searchParams);
  query.delete("route");
  req.url = `/api/media/${route}${query.size ? `?${query}` : ""}`;
  return apiHandler(req, res);
}
