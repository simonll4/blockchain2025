import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ethers, BigNumberish } from 'ethers';

import { CFPFactory } from '../contracts/types/CFPFactory';
import { CFP } from '../contracts/types/CFP';
import { ContractsService } from '../contracts/contracts.service';
import { Call } from './interfaces/call.interface';
import { MESSAGES } from 'src/common/messages';

@Injectable()
export class CallsService {
  constructor(private readonly contractsService: ContractsService) {}

  async getCall(callId: string): Promise<Call> {
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

    let closingTime: string | null = null;
    try {
      const cfpContract: CFP = this.contractsService.getCfp(cfpAddress);
      const ct: BigNumberish = await cfpContract.closingTime();
      closingTime = new Date(Number(ct) * 1000).toISOString();
    } catch {
      closingTime = null;
    }

    return { callId, creator, cfpAddress, closingTime };
  }

  async getAllCalls(): Promise<Call[]> {
    try {
      const factory: CFPFactory = this.contractsService.getFactory();
      const callIds: string[] = await factory.allCallIds();

      const calls: Call[] = [];

      for (const callId of callIds) {
        const call = await factory.calls(callId);
        const creator: string = call.creator;
        const cfpAddress: string = call.cfp;

        let closingTime: string | null = null;
        try {
          const cfpContract: CFP = this.contractsService.getCfp(cfpAddress);
          const ct: BigNumberish = await cfpContract.closingTime();
          closingTime = new Date(Number(ct) * 1000).toISOString();
        } catch {
          closingTime = null;
        }

        calls.push({ callId, creator, cfpAddress, closingTime });
      }

      return calls;
    } catch (error) {
      console.error('Error in getAllCalls:', error);
      throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
    }
  }

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
}

// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ethers, BigNumberish } from 'ethers';

// import { FactoryContract } from '../contracts/interfaces/cfp-factory.interface';
// import { CFPContract } from '../contracts/interfaces/cfp.interface';
// import { ContractsService } from '../contracts/contracts.service';
// import { Call } from './interfaces/call.interface';
// import { MESSAGES } from 'src/common/messages';

// @Injectable()
// export class CallsService {
//   constructor(private readonly contractsService: ContractsService) {}

//   async getCall(callId: string): Promise<Call> {
//     if (!ethers.isHexString(callId, 32)) {
//       throw new Error('INVALID_CALLID');
//     }

//     const factory: FactoryContract = this.contractsService.getFactory();
//     const call = await factory.calls(callId);
//     const creator: string = call.creator;
//     const cfpAddress: string = call.cfp;

//     if (creator === ethers.ZeroAddress) {
//       throw new Error('CALLID_NOT_FOUND');
//     }

//     let closingTime: string | null = null;
//     try {
//       const cfpContract: CFPContract = this.contractsService.getCfp(cfpAddress);
//       const ct: BigNumberish = await cfpContract.closingTime();
//       closingTime = new Date(Number(ct) * 1000).toISOString();
//     } catch {
//       closingTime = null;
//     }

//     return { callId, creator, cfpAddress, closingTime };
//   }

//   async getAllCalls(): Promise<Call[]> {
//     try {
//       const factory: FactoryContract = this.contractsService.getFactory();
//       const callIds: string[] = await factory.allCallIds();

//       const calls: Call[] = [];

//       for (const callId of callIds) {
//         const call = await factory.calls(callId);
//         const creator: string = call.creator;
//         const cfpAddress: string = call.cfp;

//         let closingTime: string | null = null;
//         try {
//           const cfpContract: CFPContract =
//             this.contractsService.getCfp(cfpAddress);
//           const ct: BigNumberish = await cfpContract.closingTime();
//           closingTime = new Date(Number(ct) * 1000).toISOString();
//         } catch {
//           closingTime = null;
//         }

//         calls.push({ callId, creator, cfpAddress, closingTime });
//       }

//       return calls;
//     } catch (error) {
//       console.error('Error in getAllCalls:', error);
//       throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
//     }
//   }

//   async getClosingTime(callId: string): Promise<{ closingTime: string }> {
//     if (!ethers.isHexString(callId, 32)) {
//       throw new Error('INVALID_CALLID');
//     }

//     const factory: FactoryContract = this.contractsService.getFactory();
//     const call = await factory.calls(callId);
//     const creator: string = call.creator;
//     const cfpAddress: string = call.cfp;

//     if (creator === ethers.ZeroAddress) {
//       throw new Error('CALLID_NOT_FOUND');
//     }

//     try {
//       const cfpContract: CFPContract = this.contractsService.getCfp(cfpAddress);
//       const ct: BigNumberish = await cfpContract.closingTime();
//       return { closingTime: new Date(Number(ct) * 1000).toISOString() };
//     } catch {
//       throw new Error('INTERNAL_ERROR');
//     }
//   }
// }
