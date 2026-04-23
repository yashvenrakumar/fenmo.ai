function extractIdempotencyKey(req, _res, next) {
  const headerKey = req.headers["idempotency-key"];
  const bodyKey = req.validated?.body?.idempotencyKey;

  const idempotencyKey = typeof headerKey === "string" ? headerKey : bodyKey;
  req.idempotencyKey = idempotencyKey ? String(idempotencyKey).trim() : null;

  next();
}

module.exports = {
  extractIdempotencyKey,
};
