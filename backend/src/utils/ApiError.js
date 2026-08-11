/**
 * Operational error carrying an HTTP status code. Thrown from controllers
 * and translated into a JSON response by the global error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
