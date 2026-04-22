import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto.js';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get the status code from @HttpCode decorator metadata
    const httpCode = this.reflector.get<number>(
      '__httpCode__',
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        // Default success message based on HTTP method
        let defaultMessage = 'Operation successful';
        let defaultStatusCode = httpCode || response.statusCode;

        switch (request.method) {
          case 'POST':
            defaultMessage = 'Resource created successfully';
            // If no explicit @HttpCode, default to 201
            if (!httpCode && response.statusCode === HttpStatus.OK) {
              defaultStatusCode = HttpStatus.CREATED;
            }
            break;
          case 'PUT':
          case 'PATCH':
            defaultMessage = 'Resource updated successfully';
            break;
          case 'DELETE':
            defaultMessage = 'Resource deleted successfully';
            break;
          case 'GET':
            defaultMessage = 'Data retrieved successfully';
            break;
        }

        // If data is null or undefined, return without data property
        if (data === null || data === undefined) {
          return {
            statusCode: defaultStatusCode,
            message: defaultMessage,
          };
        }

        // If data is not an object (primitive), wrap it in data
        if (typeof data !== 'object') {
          return {
            statusCode: defaultStatusCode,
            message: defaultMessage,
            data,
          };
        }

        // Extract statusCode and message from data if present
        const {
          statusCode: dataStatusCode,
          message: dataMessage,
          ...restData
        } = data;

        // Determine final statusCode and message
        const finalStatusCode = dataStatusCode ?? defaultStatusCode;
        const finalMessage = dataMessage ?? defaultMessage;

        // Check if there's any data other than statusCode and message
        const hasOtherData = Object.keys(restData).length > 0;

        // Build response
        const result: any = {
          statusCode: finalStatusCode,
          message: finalMessage,
        };

        // Only include data if there's something to show
        if (hasOtherData) {
          // Special case: if restData only has 'data' key, extract it directly to avoid nesting
          if (Object.keys(restData).length === 1 && 'data' in restData) {
            result.data = restData.data;
          } else {
            result.data = restData;
          }
        }

        return result;
      }),
    );
  }
}
