import { SetMetadata } from '@nestjs/common';

export const IS_SERVICE_ACCESS_KEY = 'isServiceAccess';
export const ServiceAccess = () => SetMetadata(IS_SERVICE_ACCESS_KEY, true);
