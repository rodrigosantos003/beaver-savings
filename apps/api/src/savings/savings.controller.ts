import { Body, Controller, Post } from '@nestjs/common';
import { parseEmailRequest } from './parse-email-request';
import { SavingsEmailService } from './savings-email.service';

@Controller('savings')
export class SavingsController {
  constructor(private readonly emailService: SavingsEmailService) {}

  @Post('email')
  send(@Body() body: unknown) {
    return this.emailService.send(parseEmailRequest(body));
  }
}
