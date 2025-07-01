import { Injectable } from '@nestjs/common';
import config from './config.json';
import contractsConfig from './contractsConfig.json';

type ContractsConfig = {
  ensRegistry: string;
  fifsRegistrar: string;
  usuariosRegistrar: string;
  llamadosRegistrar: string;
  reverseRegistrar: string;
  publicResolver: string;
  cfpFactory: string;
};

type config = {
  ganache_url: string;
  mnemonic: string;
  account_index: number;
  hd_path_template: string;
};

@Injectable()
export class ConfigService {
  private readonly config: config = config;
  private readonly contracts: ContractsConfig = contractsConfig.contracts;

  get<T = unknown>(key: string): T {
    return this.config[key] as T;
  }

  getGanacheUrl(): string {
    return this.get<string>('ganache_url');
  }

  getMnemonic(): string {
    return this.get<string>('mnemonic');
  }

  getAccountIndex(): number {
    return this.get<number>('account_index');
  }

  getHDPath(index: number): string {
    return this.get<string>('hd_path_template').replace(
      '{index}',
      index.toString(),
    );
  }

  getFactoryContractAddress(): string {
    return this.contracts.cfpFactory;
  }

  getEnsRegistryAddress(): string {
    return this.contracts.ensRegistry;
  }

  getPublicResolverAddress(): string {
    return this.contracts.publicResolver;
  }

  getReverseRegistrarAddress(): string {
    return this.contracts.reverseRegistrar;
  }
}
