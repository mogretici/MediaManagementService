import { ApiProperty } from '@nestjs/swagger';

export class UploadBodyDto {
  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  files: string[];
}