import { Module } from '@nestjs/common';

import { Connection } from 'mongoose';

import { DamController } from './dam.controller.js';
import { DAM_ENTRY_MODEL, DamEntrySchema, DamRepository } from './dam.repository.js';
import { DamService } from './dam.service.js';

@Module({
  controllers: [DamController],
  providers: [
    {
      provide: DAM_ENTRY_MODEL,
      inject: [Connection],
      useFactory: (connection: Connection) => connection.model('DamEntry', DamEntrySchema),
    },
    DamRepository,
    DamService,
  ],
  exports: [DamService],
})
export class DamModule {}
