import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { InvalidDateRangeError } from 'src/domain/errors/invalid-date-range.error';
import { Response } from 'express';

@Catch(InvalidDateRangeError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidDateRangeError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: 400,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
