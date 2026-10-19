import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Resend } from 'resend';
import request from 'supertest';
import { App } from 'supertest/types';

import { SavingsEmailService } from './savings-email.service';
import { SavingsController } from './savings.controller';

jest.mock('resend');

type SentEmail = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

let sendEmail: jest.Mock<Promise<{ data: { id: string }; error: null }>, [SentEmail]>;

const validBody = {
  to: 'ana@example.com',
  locale: 'pt',
  baseSalary: 2000,
  holidaySubsidy: 2000,
  christmasSubsidy: 2000,
  holidayMonth: 6,
  christmasMonth: 12,
  extras: 0,
  includeSubsidies: false,
  includeExtras: false,
  subsidiesInTwelfths: false,
  irsRatePercent: 10,
  ssRatePercent: 11,
  monthlyExpenses: 500,
  savingsMethod: 'percent',
  savingsPercent: 15,
  savingsAmount: 0,
};

describe('SavingsController', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    sendEmail = jest
      .fn<Promise<{ data: { id: string }; error: null }>, [SentEmail]>()
      .mockResolvedValue({ data: { id: 'email_1' }, error: null });
    jest.mocked(Resend).mockImplementation(
      () =>
        ({
          emails: { send: sendEmail },
        }) as unknown as Resend,
    );
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SavingsController],
      providers: [SavingsEmailService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects an invalid email address', () => {
    return request(app.getHttpServer())
      .post('/savings/email')
      .send({ ...validBody, to: 'not-an-email' })
      .expect(400);
  });

  it('reports when Resend is not configured', () => {
    return request(app.getHttpServer())
      .post('/savings/email')
      .send(validBody)
      .expect(503)
      .expect((response) => {
        expect(messageOf(response.body)).toBe(
          'O email não está configurado. Define RESEND_API_KEY e RESEND_FROM.',
        );
      });
  });

  it('recalculates the plan and sends it through Resend', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.RESEND_FROM = 'Beaver Savings <savings@example.com>';

    await request(app.getHttpServer())
      .post('/savings/email')
      .send(validBody)
      .expect(201)
      .expect({ sent: true });

    const payload = sendEmail.mock.calls[0][0];
    expect(payload.from).toBe('Beaver Savings <savings@example.com>');
    expect(payload.to).toBe('ana@example.com');
    expect(payload.subject).toBe('O teu plano Beaver Savings');
    expect(payload.text).toContain('240,30');
  });
});

function messageOf(body: unknown): string {
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return '';
  }

  return typeof body.message === 'string' ? body.message : '';
}
