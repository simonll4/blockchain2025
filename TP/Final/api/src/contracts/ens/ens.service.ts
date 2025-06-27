import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '../../config/config.service';
import { ContractLoader } from '../utils/contract-loader';

@Injectable()
export class ENSService {
  private readonly provider: ethers.JsonRpcProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly loader: ContractLoader,
  ) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.getGanacheUrl(),
    );
  }

  async resolveNameOrAddress(address: string): Promise<string> {
    try {
      const reverse = this.loader.loadReverseRegistrar(this.provider);
      const resolver = this.loader.loadPublicResolver(this.provider);

      const node = await reverse.node(address);
      const name = await resolver.name(node);
      console.log(name);

      return name || address;
    } catch (error) {
      console.error('[ENSService] Error resolving address:', error);
      return address;
    }
  }
}
