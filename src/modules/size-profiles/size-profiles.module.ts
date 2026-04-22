import { Module } from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service.js';
import { SizeProfilesController } from './controllers/v1/size-profiles.controller.js';

@Module({
  controllers: [SizeProfilesController],
  providers: [SizeProfilesService],
  exports: [SizeProfilesService],
})
export class SizeProfilesModule {}
