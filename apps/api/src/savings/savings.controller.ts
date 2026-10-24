import { Body, Controller, Post } from '@nestjs/common';
import { CircuitOpenError, Fallback, Resilience, Signal } from '@nestjs/resilience';
import { Throttle } from '@nestjs/throttler';

import { parseEmailRequest } from './parse-email-request.js';
import { SavingsEmailService } from './savings-email.service.js';

@Controller('savings')
export class SavingsController {
  constructor(private readonly emailService: SavingsEmailService) {}

  @Post('email')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Resilience('carrier')
  @Fallback('flatSend', { handleIf: (error) => error instanceof CircuitOpenError })
  send(@Body() body: unknown, @Signal() signal: AbortSignal) {
    return this.emailService.send(parseEmailRequest(body), signal);
  }

  flatSend() {
    return this.emailService.flatSend();
  }
}
