import { Module } from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service.js';
import { SizeProfilesController } from './size-profiles.controller.js';

@Module({
  controllers: [SizeProfilesController],
  providers: [SizeProfilesService],
  exports: [SizeProfilesService],
})
export class SizeProfilesModule {}
