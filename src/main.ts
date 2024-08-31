import basicAuth from 'express-basic-auth';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@modules/app/app.module';
import { AllExceptionsFilter } from '@filters/all-exception.filter';
import { ValidationExceptionFilter } from '@filters/validation-exception.filter';
import validationExceptionFactory from '@filters/validation-exception-factory';
import { BadRequestExceptionFilter } from '@filters/bad-request-exception.filter';
import { ThrottlerExceptionsFilter } from '@filters/throttler-exception.filter';
import { TransformInterceptor } from '@interceptors/transform.interceptor';
import { AccessExceptionFilter } from '@filters/access-exception.filter';
import { NotFoundExceptionFilter } from '@filters/not-found-exception.filter';
import * as dynamoose from 'dynamoose';
import { SafeEnvVar } from '@helpers/safeEnvVar';
import { UnsupportedMediaExceptionFilter } from '@filters/unsupported-media-exception.filter';
import { NotAcceptableExceptionFilter } from '@filters/not-acceptable-exception.filter';

async function bootstrap(): Promise<{ port: number }> {
  /**
   * Create NestJS application
   */
  const app: INestApplication = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });

  const dynamoDb = new dynamoose.aws.ddb.DynamoDB({
    region: SafeEnvVar('S3_REGION'),
    credentials: {
      accessKeyId: SafeEnvVar('S3_ACCESS_KEY_ID'),
      secretAccessKey: SafeEnvVar('S3_SECRET_ACCESS_KEY'),
    },
  });
  dynamoose.aws.ddb.set(dynamoDb);

  const configService: ConfigService<any, boolean> = app.get(ConfigService);
  const appConfig = configService.get('app');
  const swaggerConfig = configService.get('swagger');

  {
    /**
     * loggerLevel: 'error' | 'warn' | 'log' | 'verbose' | 'debug' | 'silly';
     * https://docs.nestjs.com/techniques/logger#log-levels
     */
    const options = appConfig.loggerLevel;
    app.useLogger(options);
  }

  {
    /**
     * ValidationPipe options
     * https://docs.nestjs.com/pipes#validation-pipe
     */
    const options = {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    };

    app.useGlobalPipes(
      new ValidationPipe({
        ...options,
        exceptionFactory: validationExceptionFactory,
      }),
    );
  }

  {
    /**
     * Setup Swagger API documentation
     * https://docs.nestjs.com/openapi/introduction
     */
    app.use(
      ['/swagger'],
      basicAuth({
        challenge: true,
        users: {
          admin: swaggerConfig.password,
        },
      }),
    );

    const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .setTitle('MediaManagementService')
      .setVersion('1.0')
      // .addBearerAuth({ in: 'header', type: 'http' })
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('swagger', app, document, {
      customSiteTitle: 'Swagger API Documentation',
      swaggerOptions: {
        filter: true,
        showExtensions: true,
        showRequestDuration: true,
        displayRequestDuration: true,
        showCommonExtensions: true,
        persistAuthorization: true,
        tryItOutEnabled: true,
        queryConfigEnabled: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai',
        },
        tagsSorter: 'alpha',
      },
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  app.useGlobalInterceptors(new TransformInterceptor());

  {
    /**
     * Enable global filters
     * https://docs.nestjs.com/exception-filters
     */
    const { httpAdapter } = app.get(HttpAdapterHost);

    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new AccessExceptionFilter(httpAdapter),
      new NotFoundExceptionFilter(),
      new BadRequestExceptionFilter(),
      new ValidationExceptionFilter(),
      new ThrottlerExceptionsFilter(),
      new UnsupportedMediaExceptionFilter(),
      new NotAcceptableExceptionFilter(),
    );
  }

  await app.listen(appConfig.port);
  const url = await app.getUrl();
  Logger.log(`Running in ${url}`, 'Bootstrap');
  return appConfig;
}

bootstrap().then((appConfig) => {
  Logger.log(`Server running on port ${appConfig.port}`, 'Bootstrap');
});
