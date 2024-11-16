import type { ErrorResponse } from "./types";

// Define specific error types for better error handling
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  PARSING = 'PARSING_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN_ERROR'
}

export const ErrorCodes = {
  [ErrorType.NETWORK]: 500,
  [ErrorType.PARSING]: 501,
  [ErrorType.VALIDATION]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.UNKNOWN]: 500,
} as const;

export class DuckDuckGoError extends Error {
  public readonly type: ErrorType;
  public readonly timestamp: number;

  constructor(
    public readonly code: number,
    message: string,
    public readonly details?: unknown,
    type?: ErrorType
  ) {
    super(message);
    this.name = 'DuckDuckGoError';
    this.type = type || ErrorType.UNKNOWN;
    this.timestamp = Date.now();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, DuckDuckGoError.prototype);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      type: this.type,
      timestamp: this.timestamp,
    };
  }
}

export function createErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof DuckDuckGoError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return new DuckDuckGoError(
      ErrorCodes[ErrorType.UNKNOWN],
      error.message,
      error,
      ErrorType.UNKNOWN
    ).toJSON();
  }

  return new DuckDuckGoError(
    ErrorCodes[ErrorType.UNKNOWN],
    'An unknown error occurred',
    error,
    ErrorType.UNKNOWN
  ).toJSON();
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'code' in response &&
    'message' in response &&
    'type' in response
  );
} 