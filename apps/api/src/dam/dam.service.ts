import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Types } from 'mongoose';

import { CreateDamEntryDto } from './dam.dto';
import { DamEntryDocument, DamRepository } from './dam.repository';

export type DamEntryResponse = {
  id: string;
  amount: number;
  createdAt: string;
};

export type DamResponse = {
  entries: DamEntryResponse[];
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function toObjectId(value: string, field: string): Types.ObjectId {
  if (!/^[a-f\d]{24}$/i.test(value ?? '')) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return new Types.ObjectId(value);
}

function toResponse(doc: DamEntryDocument): DamEntryResponse {
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    createdAt: doc.createdAt.toISOString(),
  };
}

@Injectable()
export class DamService {
  constructor(private readonly repo: DamRepository) {}

  async list(userId: string): Promise<DamResponse> {
    const docs = await this.repo.findByUserId(toObjectId(userId, 'userId'));
    return {
      entries: docs.map(toResponse),
      total: round2(docs.reduce((sum, d) => sum + d.amount, 0)),
    };
  }

  async create(userId: string, dto: CreateDamEntryDto): Promise<DamEntryResponse> {
    const doc = await this.repo.create({
      userId: toObjectId(userId, 'userId'),
      amount: round2(dto.amount),
    });
    return toResponse(doc);
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repo.deleteByIdAndUserId(
      toObjectId(id, 'id'),
      toObjectId(userId, 'userId'),
    );
    if (!deleted) throw new NotFoundException('Dam entry not found');
  }
}
