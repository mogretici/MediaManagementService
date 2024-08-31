import { FileDto } from '@modules/file-upload/dtos/file.dto';
import { OmitType } from '@nestjs/swagger';

export class GetFilesDto extends OmitType(FileDto, [
  'timestamp',
  'size',
]) {
}