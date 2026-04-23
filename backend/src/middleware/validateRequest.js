function validate(schema, selector = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[selector]);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(" ");
      next({
        status: 400,
        message,
      });
      return;
    }

    req.validated = req.validated || {};
    req.validated[selector] = result.data;
    next();
  };
}

module.exports = validate;
