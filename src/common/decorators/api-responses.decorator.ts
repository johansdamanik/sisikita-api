import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/** 400 Bad Request */
export const ApiBadRequestResponse = () =>
  ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request tidak valid — validasi gagal atau input salah.',
    schema: {
      example: {
        statusCode: 400,
        message: ['field tidak boleh kosong'],
        error: 'Bad Request',
      },
    },
  });

/** 401 Unauthorized */
export const ApiUnauthorizedResponse = () =>
  ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token tidak valid atau sudah expired.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token tidak valid',
        error: 'Unauthorized',
      },
    },
  });

/** 403 Forbidden */
export const ApiForbiddenResponse = () =>
  ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Tidak memiliki hak akses.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Akses hanya untuk admin',
        error: 'Forbidden',
      },
    },
  });

/** 404 Not Found */
export const ApiNotFoundResponse = () =>
  ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Data tidak ditemukan.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Data tidak ditemukan',
        error: 'Not Found',
      },
    },
  });

/** 500 Internal Server Error */
export const ApiServerErrorResponse = () =>
  ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Terjadi kesalahan pada server.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  });

/** Bundled: 400 + 401 + 500 (untuk endpoint yang butuh auth) */
export const ApiAuthResponses = () =>
  applyDecorators(
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse(),
    ApiServerErrorResponse(),
  );

/** Bundled: 400 + 500 (untuk endpoint public) */
export const ApiPublicResponses = () =>
  applyDecorators(ApiBadRequestResponse(), ApiServerErrorResponse());
