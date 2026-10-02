import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
    transform(value: string) {
        // ObjectId.isValid() accepts any 12-char string, so check the hex format explicitly
        if (!/^[a-f\d]{24}$/i.test(value)) {
            throw new BadRequestException(`"${value}" is not a valid id`);
        }
        return value;
    }
}