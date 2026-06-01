exports.notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};