import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadsService } from '../../uploads.service.js';
import {
  ApiBadRequestResponse,
  ApiAuthResponses,
} from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiOperation({
    summary: 'Upload gambar ke ImageKit',
    description:
      'Menerima file JPG, PNG, atau WEBP maksimal 5MB. Gunakan form-data dengan field `file`.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File gambar (JPG, PNG, WEBP, maks 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gambar berhasil diupload.',
    schema: {
      example: {
        url: 'https://ik.imagekit.io/yourId/sisikita/1714000000000_photo.jpg',
        fileId: 'abc123xyz',
        thumbnailUrl:
          'https://ik.imagekit.io/yourId/sisikita/1714000000000_photo_thumb.jpg',
      },
    },
  })
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException(
              'Hanya file gambar yang diizinkan! (JPG, PNG, WEBP)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File gambar tidak ditemukan');
    }
    return this.uploadsService.uploadImage(file);
  }
}
