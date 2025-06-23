import { Injectable } from '@nestjs/common';
import { Signer } from 'ethers';
import * as fs from 'fs';

import { ConfigService } from '../../config/config.service';
import { CFPFactory } from '../types/CFPFactory';
import { CFP } from '../types/CFP';
import { CFPFactory__factory, CFP__factory } from '../types/factories';

@Injectable()
export class ContractLoader {
  constructor(private readonly configService: ConfigService) {}

  private loadAddressFromJson(path: string): string {
    const json = JSON.parse(fs.readFileSync(path, 'utf-8')) as {
      networks?: Record<string, { address: string }>;
    };
    const networkId = this.configService.getNetworkId();
    const address = json.networks?.[networkId]?.address;
    if (!address) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }
    return address;
  }

  loadFactoryContract(signer: Signer): CFPFactory {
    const abiPath = this.configService.getFactoryContractPath();
    const address = this.loadAddressFromJson(abiPath);
    return CFPFactory__factory.connect(address, signer);
  }

  loadCfpContract(address: string, signer: Signer): CFP {
    return CFP__factory.connect(address, signer);
  }
}
