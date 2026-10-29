// Fail-closed OAuth placeholder. No tokens or authorization codes are logged or returned.
// Do not enable before provider-specific OAuth state, token exchange and secure storage
// have been implemented and reviewed.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  return res.status(503).json({
    error: "integration_not_configured",
    message: "Thumbtack OAuth has not been activated."
  });
};
