import { createHash, timingSafeEqual } from 'node:crypto';

import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { RetentionService } from './retention.service.js';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Vercel Cron calls the path with `Authorization: Bearer $CRON_SECRET`. */
function isAuthorizedCron(authorization: string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authorization) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  return timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`));
}

@Controller('maintenance')
export class RetentionController {
  constructor(private readonly retention: RetentionService) {}

  @Get('inactive-accounts')
  @AllowAnonymous()
  @SkipThrottle()
  run(@Headers('authorization') authorization?: string) {
    if (!isAuthorizedCron(authorization)) {
      throw new UnauthorizedException();
    }
    return this.retention.run();
  }
}
