import { AppModule } from './app.module';
import { AppValidationPipe } from './presentation/http/pipes/validation.pipe';
import { DomainExceptionFilter } from './presentation/http/filters/domain-exception.filter';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(AppValidationPipe());

  app.useGlobalFilters(new DomainExceptionFilter());

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(Number(process.env.PORT ?? 3001));
}
bootstrap();
