
const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;

  const message =
    statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
};

export { errorHandler };
