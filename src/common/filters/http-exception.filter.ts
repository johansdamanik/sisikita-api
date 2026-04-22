import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global HTTP Exception Filter.
 * Standardizes all error responses to a consistent format:
 * {
 *   statusCode: number,
 *   message: string,
 *   errors?: Array<{ field: string; message: string }>
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let errors: Array<{ field: string; message: string }> | undefined;

    // Handle standard NestJS HttpException
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;

        // Handle class-validator validation errors (array of messages)
        if (Array.isArray(resp.message)) {
          message = 'Validasi gagal';
          errors = resp.message.map((msg: string) => {
            // Try to extract field name from validation message
            const parts = msg.split(' ');
            const field = parts[0] || 'unknown';
            return { field: field.toLowerCase(), message: msg };
          });
        }
      }
    }
    // Handle Prisma known errors
    else if (this.isPrismaError(exception)) {
      const prismaError = exception as any;

      switch (prismaError.code) {
        case 'P2002': {
          // Unique constraint violation
          statusCode = HttpStatus.CONFLICT;
          const target = prismaError.meta?.target;
          const fields = Array.isArray(target)
            ? target.join(', ')
            : target || 'field';
          message = `Data dengan ${fields} ini sudah ada`;
          errors = [{ field: fields, message: `${fields} sudah digunakan` }];
          break;
        }
        case 'P2025': {
          // Record not found
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Data tidak ditemukan';
          break;
        }
        case 'P2003': {
          // Foreign key constraint
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Referensi data tidak valid';
          break;
        }
        default: {
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Terjadi kesalahan pada database';
          break;
        }
      }
    }
    // Unknown errors
    else {
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Fallback for errors if not set
    if (!errors) {
      if (statusCode === HttpStatus.UNAUTHORIZED) {
        errors = [{ field: 'auth', message: message || 'Token tidak valid atau sudah expired' }];
      } else {
        errors = [];
      }
    }

    response.status(statusCode).json({
      statusCode,
      message,
      errors,
    });
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      exception !== null &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }
}
