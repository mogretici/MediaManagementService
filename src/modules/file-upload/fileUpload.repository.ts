import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { File, FileKey } from '@modules/file-upload/interfaces/file.interface';
import { UploadFileResponse } from '@providers/s3/s3.service';

@Injectable()
export class FileUploadRepository {
  constructor(
    @InjectModel('File')

    private fileModel: Model<File, FileKey>,
  ) {
  }

  async createFile(
    file: Express.Multer.File,
    uploaded: UploadFileResponse,
  ) {
    try {
      return await this.fileModel.create(
        {
          id: uploaded.id,
          filename: file.originalname,
          timestamp: new Date().toISOString(),
          type: file.mimetype,
          size: file.size,
          url: '',
        },
      );
    } catch (error) {
      throw new Error(`File not created: ${error.message}`);
    }
  }

  async deleteFile(id: string) {
    try {
      await this.fileModel.delete({ id });
    } catch (error) {
      throw new NotFoundException(`File not found: ${error.message}`);
    }
  }

  async getFile(id: string) {
    try {
      return await this.fileModel.get({ id });
    } catch (error) {
      throw new NotFoundException(`File not found: ${error.message}`);
    }
  }
}
