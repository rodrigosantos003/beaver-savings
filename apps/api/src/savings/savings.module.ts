import { Module } from '@nestjs/common';
import { SavingsController } from './savings.controller';
import { SavingsEmailService } from './savings-email.service';

@Module({
  controllers: [SavingsController],
  providers: [SavingsEmailService],
})
export class SavingsModule {}
