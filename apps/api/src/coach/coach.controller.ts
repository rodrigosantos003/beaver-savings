import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import { AskCoachDto, CoachInsightsQueryDto } from './coach.dto.js';
import { CoachService } from './coach.service.js';

/** Each request is a paid LLM call, so the limit is much tighter than the global default. */
const COACH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('coach')
export class CoachController {
  constructor(private readonly coach: CoachService) {}

  @Get('insights')
  @Throttle(COACH_THROTTLE)
  insights(@Session() session: UserSession, @Query() query: CoachInsightsQueryDto) {
    return this.coach.insights(session.user, query.locale ?? 'pt');
  }

  @Post('ask')
  @HttpCode(200)
  @Throttle(COACH_THROTTLE)
  ask(@Session() session: UserSession, @Body() dto: AskCoachDto) {
    return this.coach.ask(session.user, dto.question, dto.locale ?? 'pt');
  }
}
