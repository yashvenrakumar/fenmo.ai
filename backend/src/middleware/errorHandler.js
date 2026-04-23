function notFoundHandler(_req, _res, next) {
  next({
    status: 404,
    message: "Resource not found.",
  });
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const message = error.message || "Internal server error.";

  if (status >= 500) {
    // Keep logs concise but visible for debugging server issues.
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(status).json({
    error: {
      message,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
