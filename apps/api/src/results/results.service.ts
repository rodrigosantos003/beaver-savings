// results/results.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CreateResultDto } from './results.dto'
import { ResultsRepository } from './results.repository';

@Injectable()
export class ResultsService {
    constructor(private readonly repo: ResultsRepository) { }

    async findById(id: string) {
        const result = await this.repo.findById(id);
        if (!result) throw new NotFoundException(`Result ${id} not found`);
        return result;
    }

    findByUserId(userId: string) {
        return this.repo.findByUserId(userId);
    }

    create({ userId, ...rest }: CreateResultDto) {
        return this.repo.create({ ...rest, userId: new ObjectId(userId) });
    }

    async delete(id: string) {
        const deleted = await this.repo.deleteById(id);
        if (!deleted) throw new NotFoundException(`Result ${id} not found`);
    }
}