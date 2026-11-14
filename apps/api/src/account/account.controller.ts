import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import { AccountService } from './account.service.js';

@Controller('account')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('export')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  export(@Session() session: UserSession) {
    return this.account.exportData(session.user.id);
  }
}
