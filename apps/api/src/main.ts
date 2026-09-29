import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  });
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Server is running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
