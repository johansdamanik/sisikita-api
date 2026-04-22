import { ApiResponseDto } from '../dto/api-response.dto.js';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  Injectable,
  HttpStatus,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';

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

    const httpCode = this.reflector.get<number>(
      '__httpCode__',
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        let defaultMessage = 'Operation successful';
        let defaultStatusCode = httpCode || response.statusCode;

        switch (request.method) {
          case 'POST':
            defaultMessage = 'Resource created successfully';
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

        if (data === null || data === undefined) {
          return {
            statusCode: defaultStatusCode,
            message: defaultMessage,
          };
        }

        if (typeof data !== 'object') {
          return {
            statusCode: defaultStatusCode,
            message: defaultMessage,
            data,
          };
        }

        const {
          statusCode: dataStatusCode,
          message: dataMessage,
          ...restData
        } = data;

        const finalStatusCode = dataStatusCode ?? defaultStatusCode;
        const finalMessage = dataMessage ?? defaultMessage;

        const result: any = {
          statusCode: finalStatusCode,
          message: finalMessage,
        };

        if (data === null || data === undefined) {
          return result;
        }

        if (typeof data !== 'object') {
          result.data = data;
          return result;
        }

        if (data.data && data.pagination) {
          result.data = data;
        } else if (
          restData &&
          Object.keys(restData as Record<string, any>).length > 0
        ) {
          if (
            Object.keys(restData as Record<string, any>).length === 1 &&
            'data' in (restData as Record<string, any>)
          ) {
            result.data = restData.data;
          } else {
            result.data = restData;
          }
        } else {
          result.data = data;
        }

        return result;
      }),
    );
  }
}
