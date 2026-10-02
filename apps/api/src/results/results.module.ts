// results/results.module.ts
import { Module } from '@nestjs/common';
import { ResultsRepository } from './results.repository';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
    controllers: [ResultsController],
    providers: [ResultsRepository, ResultsService],
    exports: [ResultsService],
})
export class ResultsModule { }