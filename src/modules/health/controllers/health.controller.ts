import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator.js';

@ApiTags('Health')
@Controller({
  version: VERSION_NEUTRAL,
})
export class HealthController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Check health status' })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ping')
  @ApiOperation({ summary: 'Ping the API' })
  ping() {
    return 'pong';
  }
}
