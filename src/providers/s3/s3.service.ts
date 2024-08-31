import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as process from 'process';
import { GenerateUUID } from '@helpers/generateUUID';
import { ConfigService } from '@nestjs/config';

export interface UploadFileResponse extends PutObjectCommandOutput {
  id: string;
}

/**
 * Service for interacting with the AWS S3 bucket.
 */
@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  client!: S3Client;

  config;

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

  /**
   * Uploads a file to the AWS S3 bucket. The file is uploaded to the given companyId with a generated unique id.
   * @param file - The file to upload.
   * @returns UploadFileResponse - The response from the AWS S3 bucket.
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadFileResponse> {
    if (!file) {
      console.log('AWS SDK Service: No file provided.');
    }

    // Generate a unique id for the file.
    const id = GenerateUUID();

    // Upload file to S3 bucket and return the response.
    return {
      ...(await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get('s3.bucketName'),
          Key: `${id}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      )),
      id: `${id}`,
    };
  }

  async findAndDeleteFile(id: string) {
    try {
      const file = await this.getFile(`${id}`);
      // Remove file from S3 bucket.
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${id}`,
      };

      const data = await this.s3Client.send(
        new DeleteObjectCommand(deleteParams),
      );
      console.log('Successfully deleted file.', data);
    } catch (e) {
      throw new BadRequestException(e);
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

  /**
   * Creates a presigned url for the given fullPath. The url expires after the given amount of seconds.
   * This operation happens on the backend, so it's not billed.
   * @param fullPath - The fullPath to create a presigned url for.
   * @param fileName
   * @param contentType
   * @returns string - presigned url string.
   */
  async createPresignedUrl(
    fullPath: string,
    fileName?: string,
    contentType?: string,
  ) {
    const extension = fileName?.split('.').pop();
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
