import { BadGatewayException } from '@nestjs/common';
import { Resend } from 'resend';

const API_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.RESEND_FROM || '';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({
  to,
  subject,
  text,
}: SendEmailParams): Promise<void> {
  const resend = new Resend(API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, text });

  if (error) {
    throw new BadGatewayException(error.message);
  }
}
