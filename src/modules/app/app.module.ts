import { Module } from '@nestjs/common';
import appConfig from '@config/app.config';
import { ConfigModule } from '@nestjs/config';
import swaggerConfig from '@config/swagger.config';
import s3Config from '@config/s3.config';
import S3Module from '@providers/s3/s3.module';
import { FileUploadModule } from '@modules/file-upload/file-upload.module';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggerConfig, s3Config],
    }),
    S3Module,
    FileUploadModule
  ],
  providers: [
  ],
})
export class AppModule {}
