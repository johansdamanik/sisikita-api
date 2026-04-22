import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class GlobalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      // Coba jalankan autentikasi JWT (ini akan mengisi request.user jika token valid)
      const canActivate = await super.canActivate(context);
      if (canActivate) {
        return true;
      }
    } catch (err) {
      // Jika rute publik, biarkan lewat meskipun token salah atau tidak ada
      if (isPublic) {
        return true;
      }
      // Jika rute privat, lempar error asli
      throw err;
    }

    return true;
  }

  handleRequest<TUser = AuthenticatedUser>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token tidak valid');
    }
    return user;
  }
}
