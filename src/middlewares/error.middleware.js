export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue || {})[0];

    message = field
      ? `${field} already exists`
      : "Duplicate value";
  }

  // Invalid JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // Expired JWT
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Invalid JSON request body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    statusCode = 400;
    message = "Invalid JSON body";
  }

  // Unexpected server errors
  if (statusCode === 500) {
    console.error(err);
    message = "Internal server error";
  }

  res.status(statusCode).json({
    message,
  });
};