import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ethers } from 'ethers';
import PQueue from 'p-queue';
import { ConfigService } from '../config/config.service';
import { ContractLoader } from './utils/contract-loader';
import { CFPFactory } from './types/CFPFactory';
import { CFP } from './types';

@Injectable()
export class ContractsService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Signer;
  private factoryContract: CFPFactory;

  // Cola de transacciones para asegurar ejecución secuencial (válido en una sola instancia del servicio)
  private txQueue: PQueue;
  // Control local del nonce para evitar colisiones (válido mientras la instancia es única)
  private currentNonce: number | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly loader: ContractLoader,
  ) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.getGanacheUrl(),
    );
    this.signer = this.createSigner();
    this.factoryContract = this.loader.loadFactoryContract(this.signer);
    this.txQueue = new PQueue({ concurrency: 1 });
  }

  private createSigner(): ethers.Signer {
    const mnemonic = this.configService.getMnemonic();
    const index = this.configService.getAccountIndex();
    const hdPath = this.configService.getHDPath(index);
    const wallet = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic),
      hdPath,
    );
    return wallet.connect(this.provider);
  }

  getSigner(): ethers.Signer {
    return this.signer;
  }

  getFactory(): CFPFactory {
    return this.factoryContract;
  }

  getCfp(address: string): CFP {
    return this.loader.loadCfpContract(address, this.signer);
  }

  async sendTransaction(
    txRequest: ethers.TransactionRequest,
  ): Promise<ethers.TransactionReceipt> {
    const task = async (): Promise<ethers.TransactionReceipt> => {
      const signer = this.signer;
      const address = await signer.getAddress();

      if (this.currentNonce === null) {
        this.currentNonce = await this.provider.getTransactionCount(
          address,
          'pending',
        );
      }
      const nonce = this.currentNonce;
      this.currentNonce += 1;

      const gasLimit = await this.provider.estimateGas({
        ...txRequest,
        from: address,
      });

      const tx: ethers.TransactionRequest = {
        ...txRequest,
        from: address,
        nonce,
        gasLimit,
      };

      const txResponse = await signer.sendTransaction(tx);
      const receipt = await txResponse.wait();

      if (!receipt) {
        throw new InternalServerErrorException('Transaction not mined');
      }

      return receipt;
    };

    const receipt = await this.txQueue.add(() => task());

    if (!receipt) {
      throw new InternalServerErrorException(
        'Transaction has no receipt, maybe it timed out.',
      );
    }
    return receipt;
  }
}
