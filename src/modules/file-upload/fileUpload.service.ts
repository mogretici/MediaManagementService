import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '@providers/s3/s3.service';
import { FileUploadRepository } from '@modules/file-upload/fileUpload.repository';

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
    const uploadedFiles = [];
    const savedFileRecords = [];

    try {
      for (const file of files) {
        const uploaded = await this.s3Service.uploadFile(file);
        uploadedFiles.push(uploaded);
        const savedRecord = await this.fileUploadRepository.createFile(file, uploaded);
        savedFileRecords.push(savedRecord);
      }
      return savedFileRecords;
    } catch (e) {
      await Promise.all(
        uploadedFiles.map(async (uploadedFile) => {
          await this.s3Service.findAndDeleteFile(uploadedFile.id); // delete the file from S3
        }),
      );
      await Promise.all(
        savedFileRecords.map(async (record) => {
          await this.fileUploadRepository.deleteFile(record.id); // delete the record from the database
        }),
      );
      const failedFiles = files.filter((file) => !savedFileRecords.find((uploadedFile) => uploadedFile.filename === file.originalname));
      const failedFilesNames = failedFiles.map((file) => file.originalname);
      throw new BadRequestException(`Files not uploaded! Please check files sizes and types. Failed to upload files: ${failedFilesNames}`);
    }
  }


  async getFile(id: string) {
    const file = await this.fileUploadRepository.getFile(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const url = await this.s3Service.createPresignedUrl(id, file.filename, file.type);
    return { ...file, url };
  }

  async getAllFiles() {
    const files = await this.fileUploadRepository.getAllFiles();
    return Promise.all(
      files.map(async (file) => {
        const url = await this.s3Service.createPresignedUrl(file.id, file.filename, file.type);
        return { ...file, url };
      }),
    );
  }

  async deleteFile(id: string) {
    await this.s3Service.findAndDeleteFile(id);
    await this.fileUploadRepository.deleteFile(id);
    return `Successfully deleted file ID: ${id}`;
  }


}
