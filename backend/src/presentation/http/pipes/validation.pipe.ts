import { ValidationPipe } from '@nestjs/common';

export const AppValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: true,
  });
