import { Module } from '@nestjs/common';
import { DamController } from './dam.controller';
import { DamRepository } from './dam.repository';
import { DamService } from './dam.service';

@Module({
    controllers: [DamController],
    providers: [DamRepository, DamService],
    exports: [DamService],
})
export class DamModule { }