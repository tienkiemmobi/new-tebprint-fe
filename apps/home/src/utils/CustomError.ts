class CustomError extends Error {
  constructor(message: string = 'Unknown Error Occurred') {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export { CustomError };
