import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/index.js';

@UseGuards(JwtAuthGuard)
@Controller('api/matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.matchesService.findMatchesForUser(user.id);
  }

  @Get(':postId')
  async findByPost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
  ) {
    return this.matchesService.findMatchesForPostById(postId, user.id);
  }
}
