import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ethers, BigNumberish } from 'ethers';

import { CFPFactory } from '../contracts/types/CFPFactory';
import { CFP } from '../contracts/types/CFP';
import { ContractsService } from '../contracts/contracts.service';
import { Call } from './interfaces/call.interface';
import { MESSAGES } from 'src/common/messages';
import { CreateCallDto } from './dto/create-call.dto';
import { ENSService } from 'src/contracts/ens/ens.service';

@Injectable()
export class CallsService {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly ensService: ENSService,
  ) {}

  async getCall(callId: string): Promise<Call> {
    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException(MESSAGES.INVALID_CALLID);
    }

    const factory = this.contractsService.getFactory();
    const call = await factory.calls(callId);

    if (call.creator === ethers.ZeroAddress) {
      throw new NotFoundException(MESSAGES.CALLID_NOT_FOUND);
    }

    // Obtener nombre del creador
    const creator = await this.ensService.resolveNameOrAddress(call.creator);

    // Obtener nombre y descripción del CFP (llamado)
    const cfpAddress = call.cfp;
    const { name: cfp, description } =
      await this.ensService.getNameAndDescription(cfpAddress);

    let closingTime: string | null = null;
    try {
      const cfpContract = this.contractsService.getCfp(cfpAddress);
      const ct = await cfpContract.closingTime();
      closingTime = new Date(Number(ct) * 1000).toISOString();
    } catch {
      closingTime = null;
    }

    return {
      callId,
      creator,
      cfp,
      description: description || '', // si no tiene descripción, devolver string vacío
      closingTime,
    };
  }

  // async getCall(callId: string): Promise<Call> {
  //   if (!ethers.isHexString(callId, 32)) {
  //     throw new BadRequestException(MESSAGES.INVALID_CALLID);
  //   }

  //   const factory = this.contractsService.getFactory();
  //   const call = await factory.calls(callId);

  //   if (call.creator === ethers.ZeroAddress) {
  //     throw new NotFoundException(MESSAGES.CALLID_NOT_FOUND);
  //   }

  //   const creator = await this.ensService.resolveNameOrAddress(call.creator);
  //   const cfpAddress = call.cfp;
  //   const cfp = await this.ensService.resolveNameOrAddress(cfpAddress);

  //   let closingTime: string | null = null;
  //   try {
  //     const cfpContract = this.contractsService.getCfp(cfpAddress);
  //     const ct = await cfpContract.closingTime();
  //     closingTime = new Date(Number(ct) * 1000).toISOString();
  //   } catch {
  //     closingTime = null;
  //   }

  //   return { callId, creator, cfp, closingTime };
  // }

  async getAllCalls(): Promise<Call[]> {
    try {
      const factory = this.contractsService.getFactory();
      const callIds = await factory.allCallIds();

      const calls: (Call | null)[] = await Promise.all(
        callIds.map(async (callId) => {
          const call = await factory.calls(callId);

          // Validar si existe (como en getCall)
          if (call.creator === ethers.ZeroAddress) {
            return null;
          }

          const creator = await this.ensService.resolveNameOrAddress(
            call.creator,
          );
          const cfpAddress = call.cfp;

          // Obtener nombre ENS y descripción del CFP (igual que getCall)
          const { name: cfp, description } =
            await this.ensService.getNameAndDescription(cfpAddress);

          let closingTime: string | null = null;
          try {
            const cfpContract = this.contractsService.getCfp(cfpAddress);
            const ct = await cfpContract.closingTime();
            closingTime = new Date(Number(ct) * 1000).toISOString();
          } catch {
            closingTime = null;
          }

          return {
            callId,
            creator,
            cfp,
            description: description || '',
            closingTime,
          };
        }),
      );

      // Filtrar los nulos si hubo llamados inválidos (como los del ZeroAddress)
      return calls.filter(Boolean) as Call[];
    } catch (error) {
      console.error('Error in getAllCalls:', error);
      throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
    }
  }

  // async getAllCalls(): Promise<Call[]> {
  //   try {
  //     const factory = this.contractsService.getFactory();
  //     const callIds = await factory.allCallIds();

  //     const calls: Call[] = await Promise.all(
  //       callIds.map(async (callId) => {
  //         const call = await factory.calls(callId);

  //         const creator = await this.ensService.resolveNameOrAddress(
  //           call.creator,
  //         );
  //         const cfpAddress = call.cfp;
  //         const cfp = await this.ensService.resolveNameOrAddress(cfpAddress);

  //         let closingTime: string | null = null;
  //         try {
  //           const cfpContract = this.contractsService.getCfp(cfpAddress);
  //           const ct = await cfpContract.closingTime();
  //           closingTime = new Date(Number(ct) * 1000).toISOString();
  //         } catch {
  //           closingTime = null;
  //         }

  //         return { callId, creator, cfp, closingTime };
  //       }),
  //     );

  //     return calls;
  //   } catch (error) {
  //     console.error('Error in getAllCalls:', error);
  //     throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
  //   }
  // }

  async getClosingTime(callId: string): Promise<{ closingTime: string }> {
    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException(MESSAGES.INVALID_CALLID);
    }

    const factory: CFPFactory = this.contractsService.getFactory();
    const call = await factory.calls(callId);
    const creator: string = call.creator;
    const cfpAddress: string = call.cfp;

    if (creator === ethers.ZeroAddress) {
      throw new NotFoundException(MESSAGES.CALLID_NOT_FOUND);
    }

    try {
      const cfpContract: CFP = this.contractsService.getCfp(cfpAddress);
      const ct: BigNumberish = await cfpContract.closingTime();
      return { closingTime: new Date(Number(ct) * 1000).toISOString() };
    } catch (err) {
      console.error('Error in getClosingTime:', err);
      throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
    }
  }

  async createCall(
    dto: CreateCallDto,
  ): Promise<{ message: string; transactionHash: string }> {
    const { callId, closingTime, signature } = dto;

    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException(MESSAGES.INVALID_CALLID);
    }

    const ISO_8601_REGEX =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

    if (!ISO_8601_REGEX.test(closingTime)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_TIME_FORMAT });
    }

    const parsedMs = Date.parse(closingTime);
    if (isNaN(parsedMs)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_TIME_FORMAT });
    }

    const timestamp = Math.floor(parsedMs / 1000);
    if (timestamp <= Math.floor(Date.now() / 1000)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_CLOSING_TIME });
    }

    const factory = this.contractsService.getFactory();
    const signerAddress = this.recoverSigner(
      factory.target as string,
      callId,
      signature,
    );

    const isAuthorized = await factory.isAuthorized(signerAddress);
    if (!isAuthorized) {
      throw new ForbiddenException({ message: MESSAGES.UNAUTHORIZED });
    }

    const existingCall = await factory.calls(callId);
    if (existingCall.creator !== ethers.ZeroAddress) {
      throw new ForbiddenException({ message: MESSAGES.ALREADY_CREATED });
      //throw new Error(MESSAGES.ALREADY_CREATED);
    }

    const txRequest = await factory.createFor.populateTransaction(
      callId,
      timestamp,
      signerAddress,
    );

    const receipt = await this.contractsService.sendTransaction(txRequest);

    return {
      message: MESSAGES.OK,
      transactionHash: receipt.hash,
    };
  }

  private recoverSigner(
    factoryAddress: string,
    callId: string,
    signature: string,
  ): string {
    try {
      // Validar formato mínimo (opcional)
      if (
        !signature ||
        !signature.startsWith('0x') ||
        signature.length !== 132
      ) {
        throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
      }

      const factoryBytes = ethers.getBytes(factoryAddress); // 20 bytes
      const callIdBytes = ethers.getBytes(callId); // 32 bytes
      if (factoryBytes.length !== 20 || callIdBytes.length !== 32) {
        throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
      }

      const messageBytes = new Uint8Array([...factoryBytes, ...callIdBytes]);

      // Ethers hace encode_defunct internamente
      const recovered = ethers.verifyMessage(messageBytes, signature);
      return ethers.getAddress(recovered);
    } catch (err) {
      console.error('Error al verificar firma:', err);
      throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
    }
  }
}
