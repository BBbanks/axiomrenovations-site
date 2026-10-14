// Integration readiness probe. Never expose credentials or internal configuration values.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  return res.status(200).json({
    provider: "thumbtack",
    integration: "disabled",
    oauth: "not_configured",
    leadSync: "disabled",
    webhook: "not_configured"
  });
};
