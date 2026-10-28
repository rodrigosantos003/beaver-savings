import { Module } from '@nestjs/common';

import type { Connection } from 'mongoose';

import { DATABASE_CONNECTION } from '../../lib/database.js';
import { CalculatorController } from './calculator.controller.js';
import {
  CALCULATOR_SNAPSHOT_MODEL,
  CalculatorRepository,
  CalculatorSnapshotSchema,
} from './calculator.repository.js';
import { CalculatorService } from './calculator.service.js';

@Module({
  controllers: [CalculatorController],
  providers: [
    {
      provide: CALCULATOR_SNAPSHOT_MODEL,
      inject: [DATABASE_CONNECTION],
      useFactory: (connection: Connection) =>
        connection.model('CalculatorSnapshot', CalculatorSnapshotSchema),
    },
    CalculatorRepository,
    CalculatorService,
  ],
  exports: [CalculatorService],
})
export class CalculatorModule {}
