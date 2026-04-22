import { Module } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { PostsController } from './controllers/v1/posts.controller.js';

import { MatchesModule } from '../matches/matches.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [MatchesModule, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
