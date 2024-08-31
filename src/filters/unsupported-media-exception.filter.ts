import {
  Catch,
  ExceptionFilter,
  HttpStatus, UnsupportedMediaTypeException,
} from '@nestjs/common';
import { UNSUPPORTED_MEDIA_TYPE } from '@constants/errors.constants';

@Catch(UnsupportedMediaTypeException)
export class UnsupportedMediaExceptionFilter implements ExceptionFilter {
  catch(exception: UnsupportedMediaTypeException, host: any) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.UNSUPPORTED_MEDIA_TYPE;

    const exceptionResponse = {
      success: false,
      error: {
        code: parseInt(UNSUPPORTED_MEDIA_TYPE.split(':')[0], 10),
        message: UNSUPPORTED_MEDIA_TYPE.split(':')[1].trim(),
        details: exception.getResponse(),
      },
    };

    return res.status(status).json(exceptionResponse);
  }
}
