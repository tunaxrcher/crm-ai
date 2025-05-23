import { NextRequest, NextResponse } from 'next/server'

import 'server-only'

import { ApiError } from './errors/custom'

type ApiHandler<T = any> = (
  req: NextRequest,
  context: T
) => Promise<NextResponse> | NextResponse

type ErrorResponse = {
  message: string
  details?: unknown
}

interface ErrorHandlerOptions {
  logError?: boolean
  includeErrorDetails?: boolean
}

const defaultOptions: ErrorHandlerOptions = {
  logError: true,
  // includeErrorDetails: process.env.NODE_ENV !== "production",
  includeErrorDetails: false,
}

export function withErrorHandling<T = any>(
  handler: ApiHandler<T>,
  options: ErrorHandlerOptions = defaultOptions
): ApiHandler<T> {
  return async function (req: NextRequest, context: T) {
    try {
      return await handler(req, context)
    } catch (error) {
      if (options.logError) {
        console.error('[API Error]', error, error instanceof ApiError)
      }

      const errorResponse: ErrorResponse = {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      }

      // จัดการกับ custom ApiError
      const statusCode = error instanceof ApiError ? error.statusCode : 500

      // จัดการกับ ValidationError ที่มี details
      if (error instanceof Error && 'details' in error) {
        errorResponse.details = (error as any).details
      } else if (options.includeErrorDetails && error instanceof Error) {
        errorResponse.details = {
          name: error.name,
          stack: error.stack,
        }
      }

      return NextResponse.json(errorResponse, { status: statusCode })
    }
  }
}
