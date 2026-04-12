import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Guard that restricts access to ADMIN users only.
 * Must be used AFTER JwtAuthGuard (user must be authenticated first).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Tidak terautentikasi');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Akses hanya untuk admin');
    }

    return true;
  }
}
