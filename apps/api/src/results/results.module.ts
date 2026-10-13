// results/results.module.ts
import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import {
  RESULT_MODEL,
  ResultSchema,
  ResultsRepository,
} from './results.repository';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  controllers: [ResultsController],
  providers: [
    {
      provide: RESULT_MODEL,
      inject: [Connection],
      useFactory: (connection: Connection) =>
        connection.model('Result', ResultSchema),
    },
    ResultsRepository,
    ResultsService,
  ],
  exports: [ResultsService],
})
export class ResultsModule { }