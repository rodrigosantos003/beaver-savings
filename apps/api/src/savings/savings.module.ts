import { Module } from '@nestjs/common';

import { SavingsEmailService } from './savings-email.service.js';
import { SavingsController } from './savings.controller.js';

@Module({
  controllers: [SavingsController],
  providers: [SavingsEmailService],
})
export class SavingsModule {}
