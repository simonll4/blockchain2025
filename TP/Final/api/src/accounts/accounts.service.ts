import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { isAddress, getAddress, verifyMessage, getBytes } from 'ethers';
import { CFPFactoryService } from '../contracts/services/business.service';
import { CFPFactory } from '../contracts/types/CFPFactory';
import { MESSAGES } from 'src/common/messages';
import { ENSService } from 'src/contracts/services/ens.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly contractsService: CFPFactoryService,
    private readonly ensService: ENSService,
  ) {}

  /**
   * Verifica si una dirección está autorizada en el contrato CFPFactory.
   * @param address Dirección a verificar.
   * @returns true si la dirección está autorizada, false en caso contrario.
   * @throws BadRequestException si la dirección es inválida.
   */
  async isAuthorized(address: string): Promise<boolean> {
    if (!isAddress(address)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_ADDRESS });
    }
    const factory: CFPFactory = this.contractsService.getFactory();
    try {
      return await factory.isAuthorized(address);
    } catch (error) {
      console.error('Error in isAuthorized:', error);
      throw error;
    }
  }

  /**
   * Registra una dirección en el contrato CFPFactory.
   * @param address Dirección a registrar.
   * @param signature Firma de la dirección.
   * @throws BadRequestException si la dirección o la firma son inválidas.
   * @throws ForbiddenException si la dirección ya está autorizada.
   * @throws UnauthorizedException si hay un error de autorización o RPC.
   */
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

  /**
   * Obtiene todas las direcciones de creadores autorizados.
   * @returns Una lista de direcciones de creadores.
   * @throws InternalServerErrorException si hay un error de conexión o RPC.
   */
  async getAllCreators(): Promise<string[]> {
    const factory = this.contractsService.getFactory();

    try {
      const count = await factory.creatorsCount();
      const creators: Promise<string>[] = [];

      for (let i = 0; i < count; i++) {
        const promise = factory
          .creators(i)
          .then((addr) => this.ensService.resolveAddress(addr));
        creators.push(promise);
      }

      return Promise.all(creators);
    } catch (error) {
      console.error('Error in getAllCreators:', error);
      throw new InternalServerErrorException(
        'RPC connection error or contract interaction failed',
      );
    }
  }

  /**
   * Obtiene todas las direcciones pendientes de autorización.
   * @returns Una lista de direcciones pendientes.
   * @throws InternalServerErrorException si hay un error de conexión o RPC.
   */
  async getPendings(): Promise<string[]> {
    const factory: CFPFactory = this.contractsService.getFactory();

    try {
      const count = await factory.pendingCount();
      const pending: Promise<string>[] = [];

      for (let i = 0; i < count; i++) {
        const promise = factory
          .getPending(i)
          .then((addr) => this.ensService.resolveAddress(addr));
        pending.push(promise);
      }

      return Promise.all(pending);
    } catch (error) {
      console.error('Error in getPendings:', error);
      throw new InternalServerErrorException(
        'RPC connection error or contract interaction failed',
      );
    }
  }
}
