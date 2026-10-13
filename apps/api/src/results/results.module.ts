// results/results.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema, ResultsRepository } from './results.repository';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
  ],
  controllers: [ResultsController],
  providers: [ResultsRepository, ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
