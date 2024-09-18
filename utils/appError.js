class APPError extends Error {
  constructor(message, statuCode) {
    super(message);
    this.statuCode = statuCode;
    this.status = `${statuCode}`.startsWith('4') ? 'fail' : 'error';

    // For Operational error - by user
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = APPError;
