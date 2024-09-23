class APPError extends Error {
  constructor(message, statusCode) {
    // super(message) did not update the message property on the created error, therefore doing it manually below
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // For Operational error - by user
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = APPError;
