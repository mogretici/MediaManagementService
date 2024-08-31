import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { S3Repository } from '@providers/s3/s3.repository';

export interface UploadFileResponse extends PutObjectCommandOutput {
  id: string;
}

/**
 * Service for interacting with the AWS S3 bucket.
 */
@Injectable()
export class S3Service {

  constructor(
    private readonly s3Repository: S3Repository,
  ) {
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

    if (file.size > 10000000) { // 10MB
      throw new NotAcceptableException('File size must be less than 10MB. Your files size: ' + (file.size / 1000000).toFixed(2) + 'MB');
      // throw new BadRequestException('File size must be less than 10MB. Your files size: ' + (file.size / 1000000).toFixed(2) + 'MB');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Invalid file type. Allowed types are: image/jpeg, image/png, image/gif, image/webp, video/mp4, application/pdf');
    }
    // Upload file to S3 bucket and return the response.
    try {
      return await this.s3Repository.uploadFile(file);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAndDeleteFile(id: string) {
    try {
      await this.s3Repository.deleteFile(`${id}`);
    } catch (e) {
      throw new NotFoundException(e.message);
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
    return await this.s3Repository.createPresignedUrl(fullPath, fileName, contentType, extension);
  }
}
