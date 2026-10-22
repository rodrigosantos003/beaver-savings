import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthGuard } from '@thallesp/nestjs-better-auth';

import { parseEmailRequest } from './parse-email-request';
import { SavingsEmailService } from './savings-email.service';

@Controller('savings')
@UseGuards(AuthGuard)
export class SavingsController {
  constructor(private readonly emailService: SavingsEmailService) {}

  @Post('email')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  send(@Body() body: unknown) {
    return this.emailService.send(parseEmailRequest(body));
  }
}
