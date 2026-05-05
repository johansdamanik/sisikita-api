import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    const appUrl =
      configService.get<string>('APP_URL') ||
      `http://localhost:${configService.get<number>('APP_PORT')}`;
    const prefix = configService.get<string>('API_PREFIX') || 'api';

    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID')!,
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET')!,
      callbackURL: `${appUrl}/${prefix}/v1/auth/facebook/callback`,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const { id, displayName, emails, photos } = profile;

    const user = {
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value ?? null,
      name: displayName,
      avatarUrl: photos?.[0]?.value ?? null,
    };

    done(null, user);
  }
}
