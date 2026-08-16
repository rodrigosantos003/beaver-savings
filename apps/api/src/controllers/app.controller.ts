import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from '../services/app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async health() {
    const result = await this.appService.health();

    if (result.status === 'error') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
}
