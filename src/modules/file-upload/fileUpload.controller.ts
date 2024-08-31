import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UploadBodyDto } from '@modules/file-upload/dtos/uploadBody.dto';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {
  }

  @ApiProperty({
    description: 'Upload files',
    type: UploadBodyDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @Post()
  createFile(
    @Body() data: UploadBodyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.fileUploadService.createFile(files);
  }

  @ApiProperty({
    description: 'Get file',
  })
  @Get(':id')
  getFile(@Param('id') id: string) {
    return this.fileUploadService.getFile(id);
  }


  @ApiProperty({
    description: 'Delete file',
  })
  @Delete(':id')
  deleteFile(@Param('id') id: string) {
    return this.fileUploadService.deleteFile(id);
  }

}