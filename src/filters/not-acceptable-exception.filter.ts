import {
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotAcceptableException,
} from '@nestjs/common';
import { NOT_ACCEPTABLE } from '@constants/errors.constants';

@Catch(NotAcceptableException)
export class NotAcceptableExceptionFilter implements ExceptionFilter {
  catch(exception: NotAcceptableException, host: any) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.NOT_ACCEPTABLE;

    const exceptionResponse = {
      success: false,
      error: {
        code: parseInt(NOT_ACCEPTABLE.split(':')[0], 10),
        message: NOT_ACCEPTABLE.split(':')[1].trim(),
        details: exception.getResponse(),
      },
    };

    return res.status(status).json(exceptionResponse);
  }
}
