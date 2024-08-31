import { Module } from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { FileUploadController } from './fileUpload.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { FileSchema } from '@modules/file-upload/schemas/file.schema';
import { FileUploadRepository } from '@modules/file-upload/fileUpload.repository';

@Module({
  imports: [
    DynamooseModule.forFeature([{
      name: 'File',
      schema: FileSchema,
      options: {
        tableName: 'uploaded-files',
      },
    }]),
    
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository],
})
export class FileUploadModule {
}
