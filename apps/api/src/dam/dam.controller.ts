import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@thallesp/nestjs-better-auth';

import { CreateDamEntryDto } from './dam.dto.js';
import { DamService } from './dam.service.js';

@Controller('dam')
@UseGuards(AuthGuard)
export class DamController {
  constructor(private readonly dam: DamService) {}

  @Get()
  list(@Query('userId') userId: string) {
    return this.dam.list(userId);
  }

  @Post()
  create(@Query('userId') userId: string, @Body() dto: CreateDamEntryDto) {
    return this.dam.create(userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Query('userId') userId: string, @Param('id') id: string) {
    return this.dam.remove(userId, id);
  }
}
