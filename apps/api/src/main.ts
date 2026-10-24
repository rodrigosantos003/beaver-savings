import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import 'dotenv/config';

import { AppModule } from './app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(await AppModule.register(), {
    bodyParser: false,
  });

  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useSecurityHeaders({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`Server is running on port ${port}`);
}
bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error(
    'Failed to start server',
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
