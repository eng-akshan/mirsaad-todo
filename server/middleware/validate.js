export function validate(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    // Express 5 exposes req.query through a getter, so it cannot be replaced.
    // Keep validated query data on a dedicated request property instead.
    if (target === 'query') req.validatedQuery = result.data;
    else req[target] = result.data;
    return next();
  };
}
