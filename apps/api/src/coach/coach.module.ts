import { Module } from '@nestjs/common';

import { CalculatorModule } from '../calculator/calculator.module.js';
import { DamModule } from '../dam/dam.module.js';
import { CoachController } from './coach.controller.js';
import { CoachService } from './coach.service.js';

@Module({
  imports: [CalculatorModule, DamModule],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
