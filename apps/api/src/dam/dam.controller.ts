import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';

import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import { CreateDamEntryDto } from './dam.dto.js';
import { DamService } from './dam.service.js';

@Controller('dam')
export class DamController {
  constructor(private readonly dam: DamService) {}

  @Get()
  list(@Session() session: UserSession) {
    return this.dam.list(session.user.id);
  }

  @Post()
  create(@Session() session: UserSession, @Body() dto: CreateDamEntryDto) {
    return this.dam.create(session.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.dam.remove(session.user.id, id);
  }
}
