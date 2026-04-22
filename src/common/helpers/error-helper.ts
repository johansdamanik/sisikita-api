import { Prisma } from '@prisma/client';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.message;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  ) {
    return (error as any).message;
  }

  return 'Unexpected error occurred';
}
