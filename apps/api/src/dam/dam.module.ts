import { Module } from '@nestjs/common';

import type { Connection } from 'mongoose';

import { DATABASE_CONNECTION } from '../../lib/database.js';
import { DamController } from './dam.controller.js';
import { DAM_ENTRY_MODEL, DamEntrySchema, DamRepository } from './dam.repository.js';
import { DamService } from './dam.service.js';

@Module({
  controllers: [DamController],
  providers: [
    {
      provide: DAM_ENTRY_MODEL,
      inject: [DATABASE_CONNECTION],
      useFactory: (connection: Connection) => connection.model('DamEntry', DamEntrySchema),
    },
    DamRepository,
    DamService,
  ],
  exports: [DamService],
})
export class DamModule {}
