export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
  _handleError(res) {
    return res.status(this.statusCode).json({ error: this.message });
  }
}
