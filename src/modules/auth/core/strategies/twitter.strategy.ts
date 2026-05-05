import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter-oauth2';

export interface TwitterProfile {
  id: string;
  displayName: string;
  username: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(configService: ConfigService) {
    const appUrl =
      configService.get<string>('APP_URL') ||
      `http://localhost:${configService.get<number>('APP_PORT')}`;
    const prefix = configService.get<string>('API_PREFIX') || 'api';

    super({
      clientID: configService.get<string>('TWITTER_CLIENT_ID')!,
      clientSecret: configService.get<string>('TWITTER_CLIENT_SECRET')!,
      callbackURL: `${appUrl}/${prefix}/v1/auth/twitter/callback`,
      clientType: 'confidential',
      scope: ['tweet.read', 'users.read'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: TwitterProfile,
    done: (error: any, user?: any) => void,
  ) {
    const { id, displayName, username, emails, photos } = profile;

    const user = {
      provider: 'twitter',
      providerId: id,
      email: emails?.[0]?.value ?? null,
      name: displayName ?? username,
      avatarUrl: photos?.[0]?.value ?? null,
    };

    done(null, user);
  }
}
