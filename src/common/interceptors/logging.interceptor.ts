import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  Logger,
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    const userId = user?.userId || 'anonymous';

    this.logger.log(
      `→ [${method}] ${url} - User: ${userId} ${
        Object.keys((body as Record<string, any>) || {}).length > 0
          ? `- Body: ${JSON.stringify(body)}`
          : ''
      }`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `← [${method}] ${url} - ${responseTime}ms - User: ${userId}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `← [${method}] ${url} - ${responseTime}ms - User: ${userId} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
