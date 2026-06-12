export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, details?: any, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace (excluding constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", details?: any) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource Not Found") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", details?: any) {
    super(message, 400, details);
  }
}
