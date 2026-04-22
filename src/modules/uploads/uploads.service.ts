import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class UploadsService {
  private imagekit: ImageKit;
  private readonly logger = new Logger(UploadsService.name);

  constructor(private configService: ConfigService) {
    const publicKey =
      this.configService.get<string>('IMAGEKIT_PUBLIC_KEY') ||
      'dummy_public_key';
    const privateKey =
      this.configService.get<string>('IMAGEKIT_PRIVATE_KEY') ||
      'dummy_private_key';
    const urlEndpoint =
      this.configService.get<string>('IMAGEKIT_URL_ENDPOINT') ||
      'https://ik.imagekit.io/dummy_endpoint';

    this.imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = '/sisikita',
  ): Promise<{ url: string; fileId: string; thumbnailUrl: string }> {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    try {
      const response = await this.imagekit.upload({
        file: file.buffer, // file buffer
        fileName: `${Date.now()}_${file.originalname}`,
        folder: folder,
        useUniqueFileName: true,
      });

      return {
        url: response.url,
        fileId: response.fileId,
        thumbnailUrl: response.thumbnailUrl,
      };
    } catch (error: any) {
      this.logger.error('Failed to upload image', error);
      throw new BadRequestException(
        error?.message || 'Gagal mengunggah gambar',
      );
    }
  }
}
