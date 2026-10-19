import { Module } from '@nestjs/common';

import { SavingsEmailService } from './savings-email.service';
import { SavingsController } from './savings.controller';

@Module({
  controllers: [SavingsController],
  providers: [SavingsEmailService],
})
export class SavingsModule {}
