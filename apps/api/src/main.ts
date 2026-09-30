import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  });

  app.use(helmet());

  await app.listen(process.env.PORT ?? 3001);

  console.log(`Server is running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
