/**
 * Error Handling Middleware
 * 
 * Comprehensive error handling with logging, user-friendly messages,
 * and proper HTTP status codes for the pharmacy management system.
 */

import type { Context } from "npm:hono";
import { AuditService } from '../services/audit.service.ts';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class ErrorHandler {
  /**
   * Create a standardized error response
   */
  static createErrorResponse(
    c: Context,
    error: AppError | Error,
    statusCode: number = 500,
    userMessage?: string
  ) {
    const isDevelopment = Deno.env.get('NODE_ENV') !== 'production';
    
    // Log the error
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: c.req.url,
      method: c.req.method,
      timestamp: new Date().toISOString()
    });

    // Create user-friendly response
    const response = {
      error: true,
      message: userMessage || this.getUserFriendlyMessage(error, statusCode),
      timestamp: new Date().toISOString(),
      path: c.req.url,
      method: c.req.method,
      ...(isDevelopment && {
        details: {
          originalMessage: error.message,
          stack: error.stack,
          code: (error as AppError).code
        }
      })
    };

    return c.json(response, statusCode);
  }

  /**
   * Generate user-friendly error messages
   */
  private static getUserFriendlyMessage(error: Error | AppError, statusCode: number): string {
    const appError = error as AppError;

    // Handle specific error codes
    if (appError.code) {
      switch (appError.code) {
        case 'VALIDATION_ERROR':
          return 'The provided data is invalid. Please check your input and try again.';
        case 'UNAUTHORIZED':
          return 'You are not authorized to perform this action.';
        case 'FORBIDDEN':
          return 'Access denied. You do not have permission to access this resource.';
        case 'NOT_FOUND':
          return 'The requested resource could not be found.';
        case 'DUPLICATE_ENTRY':
          return 'This record already exists. Please check for duplicates.';
        case 'INSUFFICIENT_STOCK':
          return 'Insufficient stock available for this operation.';
        case 'EXPIRED_MEDICINE':
          return 'Cannot process expired medications.';
        case 'INVALID_PRESCRIPTION':
          return 'The prescription is invalid or incomplete.';
        case 'PAYMENT_FAILED':
          return 'Payment processing failed. Please try again.';
        case 'DATABASE_ERROR':
          return 'A database error occurred. Please try again later.';
        default:
          break;
      }
    }

    // Handle by status code
    switch (statusCode) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please sign in to continue.';
      case 403:
        return 'Access forbidden. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict detected. The resource already exists or is in use.';
      case 422:
        return 'The provided data could not be processed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait before trying again.';
      case 500:
        return 'An internal server error occurred. Our team has been notified.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service maintenance in progress. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Validation error handler
   */
  static validationError(c: Context, field: string, message: string) {
    return this.createErrorResponse(
      c,
      { name: 'ValidationError', message: `${field}: ${message}`, code: 'VALIDATION_ERROR' } as AppError,
      400,
      `Validation failed for ${field}: ${message}`
    );
  }

  /**
   * Authentication error handler
   */
  static authenticationError(c: Context, message: string = 'Authentication required') {
    return this.createErrorResponse(
      c,
      { name: 'AuthenticationError', message, code: 'UNAUTHORIZED' } as AppError,
      401,
      'Please sign in to access this resource.'
    );
  }

  /**
   * Authorization error handler
   */
  static authorizationError(c: Context, requiredRole?: string) {
    const message = requiredRole 
      ? `${requiredRole} role required for this action`
      : 'Insufficient permissions';
    
    return this.createErrorResponse(
      c,
      { name: 'AuthorizationError', message, code: 'FORBIDDEN' } as AppError,
      403,
      'You do not have permission to perform this action.'
    );
  }

  /**
   * Not found error handler
   */
  static notFoundError(c: Context, resource: string = 'Resource') {
    return this.createErrorResponse(
      c,
      { name: 'NotFoundError', message: `${resource} not found`, code: 'NOT_FOUND' } as AppError,
      404,
      `The requested ${resource.toLowerCase()} could not be found.`
    );
  }

  /**
   * Conflict error handler (for duplicates, etc.)
   */
  static conflictError(c: Context, message: string) {
    return this.createErrorResponse(
      c,
      { name: 'ConflictError', message, code: 'DUPLICATE_ENTRY' } as AppError,
      409,
      message
    );
  }

  /**
   * Business logic error handler
   */
  static businessLogicError(c: Context, code: string, message: string, userMessage?: string) {
    return this.createErrorResponse(
      c,
      { name: 'BusinessLogicError', message, code } as AppError,
      422,
      userMessage || message
    );
  }

  /**
   * Database error handler
   */
  static databaseError(c: Context, originalError: Error) {
    // Log database errors for investigation
    console.error('Database Error:', {
      message: originalError.message,
      stack: originalError.stack,
      timestamp: new Date().toISOString()
    });

    return this.createErrorResponse(
      c,
      { name: 'DatabaseError', message: originalError.message, code: 'DATABASE_ERROR' } as AppError,
      500,
      'A database error occurred. Please try again later.'
    );
  }

  /**
   * Rate limiting error handler
   */
  static rateLimitError(c: Context, retryAfter?: number) {
    const response = this.createErrorResponse(
      c,
      { name: 'RateLimitError', message: 'Rate limit exceeded', code: 'RATE_LIMIT' } as AppError,
      429,
      'Too many requests. Please wait before trying again.'
    );

    if (retryAfter) {
      c.header('Retry-After', retryAfter.toString());
    }

    return response;
  }
}

/**
 * Global error handling middleware
 */
export function errorHandlerMiddleware() {
  return async (c: Context, next: Function) => {
    try {
      await next();
    } catch (error) {
      // Log error for audit trail
      try {
        const user = c.get('user');
        if (user) {
          await AuditService.logActivity(
            'system_maintenance',
            `Error occurred: ${error.message}`,
            'system',
            'error_handler',
            user.id,
            user.user_metadata?.name || user.email,
            {
              errorType: error.name,
              errorMessage: error.message,
              url: c.req.url,
              method: c.req.method
            }
          );
        }
      } catch (auditError) {
        console.error('Failed to log error to audit:', auditError);
      }

      // Handle different types of errors
      if (error.name === 'ValidationError') {
        return ErrorHandler.validationError(c, 'input', error.message);
      }

      if (error.name === 'UnauthorizedError' || error.message.includes('Unauthorized')) {
        return ErrorHandler.authenticationError(c, error.message);
      }

      if (error.name === 'ForbiddenError' || error.message.includes('Forbidden')) {
        return ErrorHandler.authorizationError(c);
      }

      if (error.name === 'NotFoundError' || error.message.includes('not found')) {
        return ErrorHandler.notFoundError(c);
      }

      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return ErrorHandler.conflictError(c, error.message);
      }

      // Handle database/storage errors
      if (error.message.includes('database') || error.message.includes('storage')) {
        return ErrorHandler.databaseError(c, error);
      }

      // Default to internal server error
      return ErrorHandler.createErrorResponse(c, error, 500);
    }
  };
}

/**
 * Async wrapper for route handlers to catch errors
 */
export function asyncHandler(fn: Function) {
  return (c: Context) => {
    return Promise.resolve(fn(c)).catch((error) => {
      throw error; // Let the middleware handle it
    });
  };
}

/**
 * Custom error classes for specific business logic
 */
export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class BusinessLogicError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number = 422) {
    super(message);
    this.name = 'BusinessLogicError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class InsufficientStockError extends BusinessLogicError {
  constructor(medicineName: string, requested: number, available: number) {
    super(
      'INSUFFICIENT_STOCK',
      `Insufficient stock for ${medicineName}. Requested: ${requested}, Available: ${available}`,
      422
    );
  }
}

export class ExpiredMedicineError extends BusinessLogicError {
  constructor(medicineName: string, expiryDate: string) {
    super(
      'EXPIRED_MEDICINE',
      `Medicine ${medicineName} has expired on ${expiryDate}`,
      422
    );
  }
}

export class PaymentProcessingError extends BusinessLogicError {
  constructor(message: string) {
    super('PAYMENT_FAILED', message, 422);
  }
}