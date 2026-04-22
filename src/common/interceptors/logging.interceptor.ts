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
    const { method, url } = request;
    const now = Date.now();

    // Log request start
    this.logger.log(`→ [${method}] ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;

          // Selalu ambil langsung dari request.user untuk mendapatkan data terbaru
          const user = request.user;
          const userIdentifier = user?.email || user?.id || 'anonymous';

          this.logger.log(
            `← [${method}] ${url} - ${responseTime}ms - User: ${userIdentifier}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const user = request.user;
          const userIdentifier = user?.email || user?.id || 'anonymous';

          this.logger.error(
            `← [${method}] ${url} - ${responseTime}ms - User: ${userIdentifier} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
