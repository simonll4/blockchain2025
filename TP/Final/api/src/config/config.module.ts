import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigValidationService } from './config-validation.service';

@Module({
  providers: [ConfigService, ConfigValidationService],
  exports: [ConfigService],
})
export class ConfigModule {
  constructor(
    private readonly configValidationService: ConfigValidationService,
  ) {
    this.configValidationService.validateConfigFiles();
  }
}
