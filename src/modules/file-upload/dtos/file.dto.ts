import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileDto {
  @ApiProperty({
    description: 'File ID (This is the name of the file in the S3 bucket)',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Expose()
  id: string | null;

  @ApiProperty({
    description: 'Timestamp date',
    required: false,
    type: Date,
  })
  @IsOptional()
  @Expose()
  timestamp: Date | null;

  @ApiProperty({
    description: 'File name',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Expose()
  filename: string | null;

  @ApiProperty({
    description: 'File type',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Expose()
  type: string | null;

  @ApiProperty({
    description: 'File size',
    required: false,
    example: 42242,
    type: 'number',
  })
  @IsOptional()
  @Expose()
  size: number | null;

  @ApiProperty({
    description: 'File url',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Expose()
  url: string | null;
}
