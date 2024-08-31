import { Module } from '@nestjs/common';
import appConfig from '@config/app.config';
import { ConfigModule } from '@nestjs/config';
import swaggerConfig from '@config/swagger.config';
import s3Config from '@config/s3.config';
import S3Module from '@providers/s3/s3.module';
import { FileUploadModule } from '@modules/file-upload/fileUpload.module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { SafeEnvVar } from '@helpers/safeEnvVar';


@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggerConfig, s3Config],
    }),
    DynamooseModule.forRoot({
      aws: {
        accessKeyId: SafeEnvVar('S3_ACCESS_KEY_ID'),
        secretAccessKey: SafeEnvVar('S3_SECRET_ACCESS_KEY'),
        region: SafeEnvVar('S3_REGION'),
      },
    }),
    S3Module,
    FileUploadModule,
  ],
  providers: [],
})
export class AppModule {
}
