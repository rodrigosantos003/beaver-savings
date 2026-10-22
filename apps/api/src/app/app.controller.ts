import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipThrottle()
  live() {
    return { status: 'ok' };
  }

  @Get('health')
  @SkipThrottle()
  async health() {
    const result = await this.appService.health();

    if (result.status === 'error') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
}
