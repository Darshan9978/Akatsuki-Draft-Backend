// A small custom error class.
// When we throw `new AppError("message", 404)`, the error handler
// (src/middleware/errorHandler.js) sends a clean JSON reply with that status.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // "expected" error, safe to show the message to the client
  }
}

module.exports = AppError;
