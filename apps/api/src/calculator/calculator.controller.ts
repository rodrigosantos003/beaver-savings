import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';

import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import { SaveCalculatorInputDto } from './calculator.dto.js';
import { CalculatorService } from './calculator.service.js';

@Controller('snapshots')
export class CalculatorController {
  constructor(private readonly calculator: CalculatorService) {}

  @Post()
  @HttpCode(204)
  save(@Session() session: UserSession, @Body() dto: SaveCalculatorInputDto) {
    return this.calculator.save(session.user.id, dto);
  }

  @Get('latest')
  latest(@Session() session: UserSession) {
    return this.calculator.getLatest(session.user.id);
  }

  @Get('habits')
  habits(@Session() session: UserSession) {
    return this.calculator.getHabits(session.user.id);
  }

  @Delete()
  @HttpCode(204)
  clear(@Session() session: UserSession) {
    return this.calculator.clear(session.user.id);
  }
}
