import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '@providers/s3/s3.service';
import { FileUploadRepository } from '@modules/file-upload/fileUpload.repository';
import { ApiOkResponse } from '@nestjs/swagger';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly s3Service: S3Service,
    private fileUploadRepository: FileUploadRepository,
  ) {
  }

  async createFile(
    files: Express.Multer.File[],
  ) {
    if (!files || !files.length) {
      throw new BadRequestException('No files uploaded');
    }
    return Promise.all(
      files.map(async (file) => {
        const uploaded = await this.s3Service.uploadFile(file);
        return await this.fileUploadRepository.createFile(file, uploaded);
      }),
    );
  }

  async deleteFile(id: string) {
    const deleted = await this.s3Service.findAndDeleteFile(id);
    await this.fileUploadRepository.deleteFile(id);
    return `Successfully deleted file ID: ${id}`;
  }

  async getFile(id: string) {
    const file = await this.fileUploadRepository.getFile(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const url = await this.s3Service.createPresignedUrl(id, file.filename, file.type);
    return { ...file, url };
  }

}
