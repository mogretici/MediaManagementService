import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { getSerializeType } from '@decorators/serialize.decorator';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const serializeType = getSerializeType(context.getHandler());

    return next.handle().pipe(
      map((value) => {
        if (!serializeType || typeof value !== 'object' || value === null) {
          return value;
        }

        function serialize(data: any) {
          return plainToInstance(serializeType, data, {
            excludeExtraneousValues: true,
          });
        }

        if (Array.isArray(value)) {
          return value.map(serialize);
        } else if (value.meta) {
          return {
            ...value,
            data: serialize(value.data),
          };
        }

        return serialize(value);
      }),
    );
  }
}