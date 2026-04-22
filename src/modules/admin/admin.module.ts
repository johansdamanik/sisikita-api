import { AdminController } from './controllers/v1/admin.controller.js';
import { AdminService } from './admin.service.js';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
