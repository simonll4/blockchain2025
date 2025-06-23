import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('check-health')
export class HealthController {
  @Get()
  @HttpCode(200)
  checkHealth(): string {
    return '';
  }
}
