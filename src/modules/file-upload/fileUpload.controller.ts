import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UploadBodyDto } from '@modules/file-upload/dtos/uploadBody.dto';
import { FileDto } from '@modules/file-upload/dtos/file.dto';
import { GetFilesDto } from '@modules/file-upload/dtos/getFiles.dto';
import Serialize from '@decorators/serialize.decorator';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {
  }

  @ApiProperty({
    description: 'Upload files',
    type: UploadBodyDto,
  })
  @ApiOperation({
    summary: 'Upload One or Multiple Files',
    description: 'You can upload multiple files at the same time, subject to the following rules.' +
      '\n\n **Max File Size:** 10MB' +
      '\n\n **Allowed Types:** \n\n - \'image/jpeg\' \n -  \'image/png\' \n -  \'image/gif\' \n -  \'image/webp\' \n -  \'video/mp4\' \n -  \'application/pdf\' ',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @Post()
  @ApiOkResponse({
    type: FileDto,
  })
  createFile(
    @Body() data: UploadBodyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.fileUploadService.createFile(files);
  }

  @ApiProperty({
    description: 'Get file',
  })
  @ApiOperation({
    summary: 'Get One File',
    description: 'You can obtain all the information about the file whose id you specified.',
  })
  @Get(':id')
  @ApiOkResponse({
    type: FileDto,
  })
  getFile(@Param('id') id: string) {
    return this.fileUploadService.getFile(id);
  }

  @ApiProperty({
    description: 'Get all files',
  })
  @ApiOperation({
    summary: 'Get All Files',
    description: `Returns a list of all uploaded files with the following properties: 
    \n\n - id
    \n\n - filename 
    \n\n - type
    \n\n - url
    \n\n You can find more details about any file in **GET /file-upload/{id}** endpoint.`,
  })
  @Serialize(GetFilesDto)
  @Get()
  @ApiOkResponse({
    type: [GetFilesDto],
  })
  getAllFiles() {
    return this.fileUploadService.getAllFiles();
  }


  @ApiProperty({
    description: 'Delete file',
  })
  @ApiOperation({
    summary: 'Delete One File',
    description: 'You can delete the file whose id you specified.',
  })
  @Delete(':id')
  deleteFile(@Param('id') id: string) {
    return this.fileUploadService.deleteFile(id);
  }

}