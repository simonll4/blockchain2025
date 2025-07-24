import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface AppConfig {
  ganache_url: string;
  mnemonic: string;
  account_index: number;
  hd_path_template: string;
}

@Injectable()
export class ConfigValidationService {
  private readonly configPath = path.join(__dirname, 'config.json');
  private readonly contractsConfigPath = path.join(
    __dirname,
    'contractsConfig.json',
  );
  private readonly requiredFields = [
    'ganache_url',
    'mnemonic',
    'account_index',
    'hd_path_template',
  ];

  validateConfigFiles() {
    // Verifica existencia de config.json
    if (!fs.existsSync(this.configPath)) {
      throw new InternalServerErrorException(
        `Archivo faltante: ${this.configPath}`,
      );
    }
    // Verifica existencia de contractsConfig.json
    if (!fs.existsSync(this.contractsConfigPath)) {
      throw new InternalServerErrorException(
        `Archivo faltante: ${this.contractsConfigPath}`,
      );
    }
    // Verifica campos requeridos en config.json y sus tipos
    const config = JSON.parse(
      fs.readFileSync(this.configPath, 'utf-8'),
    ) as AppConfig;
    for (const field of this.requiredFields) {
      if (!(field in config)) {
        throw new InternalServerErrorException(
          `Falta el campo '${field}' en config.json`,
        );
      }
    }
    if (
      typeof config.ganache_url !== 'string' ||
      config.ganache_url.trim() === ''
    ) {
      throw new InternalServerErrorException(
        'ganache_url debe ser un string no vacío',
      );
    }
    if (typeof config.mnemonic !== 'string' || config.mnemonic.trim() === '') {
      throw new InternalServerErrorException(
        'mnemonic debe ser un string no vacío',
      );
    }
    if (typeof config.account_index !== 'number') {
      throw new InternalServerErrorException('account_index debe ser number');
    }
    if (
      typeof config.hd_path_template !== 'string' ||
      config.hd_path_template.trim() === ''
    ) {
      throw new InternalServerErrorException(
        'hd_path_template debe ser un string no vacío',
      );
    }
  }
}
