import { importCodeforcesProblem } from "./lib/codeforces.js";

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "anonymous";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const data = await importCodeforcesProblem(req.query.problem, getClientKey(req));
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Failed to import Codeforces problem.",
    });
  }
}
