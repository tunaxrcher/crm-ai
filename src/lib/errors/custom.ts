export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string = 'Validation failed',
    public details?: any
  ) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401)
    this.name = 'AuthorizationError'
  }
}

export class DuplicateDataError extends ApiError {
  constructor(message: string) {
    super(message, 409)
    this.name = 'DuplicateDataError'
  }
}

export class ConfigSetupError extends ApiError {
  constructor(message: string) {
    super(message, 504)
    this.name = 'ConfigSetupError'
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}
