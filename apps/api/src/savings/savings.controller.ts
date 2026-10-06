import { Body, Controller, Post } from '@nestjs/common';
import { parseEmailRequest } from './parse-email-request';
import { SavingsEmailService } from './savings-email.service';
import { Throttle } from '@nestjs/throttler';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('savings')
export class SavingsController {
  constructor(private readonly emailService: SavingsEmailService) { }

  @Post('email')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  send(@Body() body: unknown) {
    return this.emailService.send(parseEmailRequest(body));
  }
}
