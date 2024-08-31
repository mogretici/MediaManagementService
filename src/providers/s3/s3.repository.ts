import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GenerateUUID } from '@helpers/generateUUID';

@Injectable()
export class S3Repository {
  private readonly s3Client: S3Client;

  client!: S3Client;
  config: { accessKeyId: any; };

  constructor(private configService: ConfigService) {
    this.config = this.configService.get('s3');

    if (!this.config.accessKeyId) {
      throw new Error('S3 accessKeyId is not defined');
    }
    this.s3Client = new S3Client({
      region: this.configService.get('s3.region'),
      credentials: {
        accessKeyId: this.configService.get('s3.accessKeyId'),
        secretAccessKey: this.configService.get('s3.secretAccessKey'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const id = GenerateUUID();
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('s3.bucketName'),
        Key: `${id}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      return {
        ...(await this.s3Client.send(command)),
        id,
      };
    } catch (e) {
      throw new Error('Error uploading file');
    }
  }

  async getFile(path: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.configService.get('s3.bucketName'),
        Key: path,
      });
      return await this.s3Client.send(command);
    } catch (e) {
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(id: string) {
    try {
      // Check if file exists
      await this.getFile(id);
      //delete file
      const command = new DeleteObjectCommand({
        Bucket: this.configService.get('s3.bucketName'),
        Key: id,
      });
      return await this.s3Client.send(command);
    } catch (e) {
      throw new NotFoundException('File not found');
    }
  }

  async createPresignedUrl(
    fullPath: string,
    fileName?: string,
    contentType?: string,
    extension?: string,
  ) {

    const command = new GetObjectCommand({
      Bucket: this.configService.get('s3.bucketName'),
      Key: fullPath,
      ResponseContentType: contentType || 'application/octet-stream',
      ResponseContentDisposition: `filename="${fileName}.${extension}"`,
    });
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: parseInt(this.configService.get('s3.signExpires') || '300'),
    });
  }
}