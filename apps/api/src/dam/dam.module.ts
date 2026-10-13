import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DamController } from './dam.controller';
import { DamEntry, DamEntrySchema, DamRepository } from './dam.repository';
import { DamService } from './dam.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DamEntry.name, schema: DamEntrySchema },
    ]),
  ],
  controllers: [DamController],
  providers: [DamRepository, DamService],
  exports: [DamService],
})
export class DamModule {}
