import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { DamService } from './dam.service';
import { CreateDamEntryDto } from './dam.dto';

/**
 * NOTE: userId comes from the query string here to mirror the existing
 * results endpoints. Anyone can pass any userId this way, so once you have
 * a session guard, replace `@Query('userId')` with the authenticated
 * user's id (e.g. a custom @CurrentUserId() decorator).
 */
@Controller('dam')
export class DamController {
    constructor(private readonly dam: DamService) { }

    @Get()
    list(@Query('userId') userId: string) {
        return this.dam.list(userId);
    }

    @Post()
    create(@Query('userId') userId: string, @Body() dto: CreateDamEntryDto) {
        return this.dam.create(userId, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Query('userId') userId: string, @Param('id') id: string) {
        return this.dam.remove(userId, id);
    }
}