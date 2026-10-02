// results/results.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../lib/parse-object-id.pipe';
import { CreateResultDto } from './results.dto';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController {
    constructor(private readonly results: ResultsService) { }

    @Post()
    create(@Body() dto: CreateResultDto) {
        return this.results.create(dto);
    }

    // GET /results?userId=<id>
    @Get()
    findByUser(@Query('userId', ParseObjectIdPipe) userId: string) {
        return this.results.findByUserId(userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseObjectIdPipe) id: string) {
        return this.results.findById(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseObjectIdPipe) id: string) {
        return this.results.delete(id);
    }
}