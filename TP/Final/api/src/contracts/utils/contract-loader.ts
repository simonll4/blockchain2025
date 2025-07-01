import { Injectable } from '@nestjs/common';
import { Signer, Provider } from 'ethers';
import {
  CFPFactory__factory,
  CFP__factory,
  ENSRegistry__factory,
  PublicResolver__factory,
  ReverseRegistrar__factory,
} from '../types';
import { CFPFactory } from '../types/CFPFactory';
import { CFP } from '../types/CFP';
import { ENSRegistry } from '../types/ENSRegistry';
import { PublicResolver } from '../types/PublicResolver';
import { ReverseRegistrar } from '../types/ReverseRegistrar';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ContractLoader {
  constructor(private readonly configService: ConfigService) {}

  loadFactoryContract(signer: Signer): CFPFactory {
    const address = this.configService.getFactoryContractAddress();
    return CFPFactory__factory.connect(address, signer);
  }

  loadCfpContract(address: string, signer: Signer): CFP {
    return CFP__factory.connect(address, signer);
  }

  loadENSRegistry(provider: Provider): ENSRegistry {
    const address = this.configService.getEnsRegistryAddress();
    return ENSRegistry__factory.connect(address, provider);
  }

  loadPublicResolver(provider: Provider): PublicResolver {
    const address = this.configService.getPublicResolverAddress();
    return PublicResolver__factory.connect(address, provider);
  }

  loadReverseRegistrar(provider: Provider): ReverseRegistrar {
    const address = this.configService.getReverseRegistrarAddress();
    return ReverseRegistrar__factory.connect(address, provider);
  }
}
