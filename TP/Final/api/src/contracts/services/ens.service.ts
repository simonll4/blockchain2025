import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

import { ConfigService } from '../../config/config.service';
import { ContractLoader } from '../utils/contract-loader';
import { PublicResolver, ReverseRegistrar } from '../types';

@Injectable()
export class ENSService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private reverse: ReverseRegistrar;
  private resolver: PublicResolver;

  constructor(
    private readonly configService: ConfigService,
    private readonly loader: ContractLoader,
  ) {}

  onModuleInit() {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.getGanacheUrl(),
    );
    this.reverse = this.loader.loadReverseRegistrar(this.provider);
    this.resolver = this.loader.loadPublicResolver(this.provider);
  }

  async resolveAddress(address: string): Promise<string> {
    try {
      const node = await this.reverse.node(address);
      const name = await this.resolver.name(node);
      console.log(name);

      return name || address;
    } catch (error) {
      console.error('[ENSService] Error resolving address:', error);
      return address;
    }
  }

  async getNameAndDescription(
    address: string,
  ): Promise<{ name: string; description?: string }> {
    try {
      // Obtener el node del reverse
      const reverseNode = await this.reverse.node(address);

      // Resolver el nombre ENS asociado a ese node
      const name = await this.resolver.name(reverseNode);

      // Resolver la descripción del nombre ENS si existe
      const forwardNode = ethers.namehash(name);
      let description: string | undefined;

      try {
        description = await this.resolver.text(forwardNode, 'description');
      } catch {
        description = undefined;
      }

      return { name, description };
    } catch (error) {
      console.error('[ENSService] Error getting name and description:', error);
      return { name: address };
    }
  }
}
