import { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import request from 'supertest';
import { App } from 'supertest/types';

import { NotFoundFilter } from './not-found.filter';

describe('NotFoundFilter', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: APP_FILTER, useClass: NotFoundFilter }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns a fixed body for an unknown route', () => {
    return request(app.getHttpServer()).get('/.env').expect(404).expect({ statusCode: 404 });
  });
});
