import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isAddress, getAddress, verifyMessage, getBytes } from 'ethers';
import { ContractsService } from '../contracts/contracts.service';
import { CFPFactory } from '../contracts/types/CFPFactory'; // ✅ nuevo
import { MESSAGES } from 'src/common/messages';
import { ENSService } from 'src/contracts/ens/ens.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly ensService: ENSService,
  ) {}

  async isAuthorized(address: string): Promise<boolean> {
    if (!isAddress(address)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_ADDRESS });
    }

    const factory: CFPFactory = this.contractsService.getFactory(); // ✅ tipado fuerte
    try {
      return await factory.isAuthorized(address);
    } catch (error) {
      console.error('Error in isAuthorized:', error);
      throw error;
    }
  }

  async register(address: string, signature: string): Promise<void> {
    if (!isAddress(address)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_ADDRESS });
    }

    // Validar firma Ethereum (65 bytes)
    if (
      typeof signature !== 'string' ||
      !/^0x[0-9a-fA-F]{130}$/.test(signature)
    ) {
      throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
    }

    const factory = this.contractsService.getFactory();
    const contractAddress = await factory.getAddress();
    const rawMessage = getBytes(contractAddress);

    // Verificar firma
    let recoveredSigner: string;
    try {
      recoveredSigner = getAddress(verifyMessage(rawMessage, signature));
    } catch {
      throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
    }

    if (recoveredSigner !== address) {
      throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
    }

    // Verificar si ya está autorizado
    const alreadyAuthorized = await factory.isAuthorized(address);
    if (alreadyAuthorized) {
      throw new ForbiddenException({ message: MESSAGES.ALREADY_AUTHORIZED });
    }

    // Generar transacción y enviarla
    try {
      const txRequest = await factory.authorize.populateTransaction(address);
      await this.contractsService.sendTransaction(txRequest);
    } catch (error) {
      console.error('Error in register:', error);
      throw new BadRequestException({ message: MESSAGES.INTERNAL_ERROR });
    }
  }

  async getAllCreators(): Promise<string[]> {
    const factory = this.contractsService.getFactory();
    const count = await factory.creatorsCount();

    const creators: Promise<string>[] = [];

    for (let i = 0; i < count; i++) {
      const promise = factory
        .creators(i)
        .then((addr) => this.ensService.resolveNameOrAddress(addr));
      creators.push(promise);
    }

    return Promise.all(creators);
  }

  async getPendings(): Promise<string[]> {
    const factory: CFPFactory = this.contractsService.getFactory();

    try {
      const count = await factory.pendingCount();
      const pending: Promise<string>[] = [];

      for (let i = 0; i < count; i++) {
        const promise = factory
          .getPending(i)
          .then((addr) => this.ensService.resolveNameOrAddress(addr));
        pending.push(promise);
      }

      return Promise.all(pending);
    } catch (error) {
      console.error('Error in getPendings:', error);
      throw new UnauthorizedException('Unauthorized access or RPC error');
    }
  }
}
