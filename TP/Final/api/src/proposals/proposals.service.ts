import {
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CFPFactoryService } from '../contracts/services/business.service';
import { ethers } from 'ethers';
import { MESSAGES } from '../common/messages';

import { CallData } from './interfaces/call-data.interface';
import { ProposalData } from './interfaces/proposal-data.interface';

@Injectable()
export class ProposalsService {
  constructor(private readonly contractsService: CFPFactoryService) {}

  async getProposalData(
    callId: string,
    proposal: string,
  ): Promise<ProposalData> {
    if (!ethers.isHexString(callId, 32)) {
      throw new HttpException(MESSAGES.INVALID_CALLID, HttpStatus.BAD_REQUEST);
    }

    if (!ethers.isHexString(proposal, 32)) {
      throw new HttpException(
        MESSAGES.INVALID_PROPOSAL,
        HttpStatus.BAD_REQUEST,
      );
    }

    const factory = this.contractsService.getFactory();

    let callData: CallData;
    try {
      callData = await factory.calls(callId);
    } catch (err) {
      console.error('[ERROR] getProposalData - factory.calls', err);
      throw new HttpException(
        MESSAGES.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (callData.creator === ethers.ZeroAddress) {
      throw new HttpException(MESSAGES.CALLID_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const cfpContract = this.contractsService.getCfp(callData.cfp);

    let proposalData: ProposalData;
    try {
      proposalData = await cfpContract.proposalData(proposal);
    } catch (err) {
      console.error('[ERROR] getProposalData - proposalData', err);
      throw new HttpException(
        MESSAGES.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (proposalData.sender === ethers.ZeroAddress) {
      throw new HttpException(
        MESSAGES.PROPOSAL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return proposalData;
  }

  async registerProposal(callId: string, proposal: string): Promise<void> {
    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_CALLID });
    }

    if (!ethers.isHexString(proposal, 32)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_PROPOSAL });
    }

    const factory = this.contractsService.getFactory();
    await this.contractsService.refreshNonce();

    let callData: CallData;
    try {
      callData = await factory.calls(callId);
    } catch (err) {
      console.error('[factory.calls]', err);
      throw new InternalServerErrorException({
        message: MESSAGES.INTERNAL_ERROR,
      });
    }

    const { creator, cfp: cfpAddress } = callData;
    if (creator === ethers.ZeroAddress) {
      throw new NotFoundException({ message: MESSAGES.CALLID_NOT_FOUND });
    }

    const cfpContract = this.contractsService.getCfp(String(cfpAddress));

    let proposalData: ProposalData;
    try {
      proposalData = await cfpContract.proposalData(proposal);
    } catch (err) {
      console.error('[cfpContract.proposalData]', err);
      throw new InternalServerErrorException({
        message: MESSAGES.INTERNAL_ERROR,
      });
    }

    if (proposalData.sender !== ethers.ZeroAddress) {
      throw new ForbiddenException({ message: MESSAGES.ALREADY_REGISTERED });
    }

    try {
      await this.contractsService.sendTransaction(
        await factory.registerProposal.populateTransaction(callId, proposal),
      );
    } catch (err) {
      console.error('[factory.registerProposal]', err);
      throw new InternalServerErrorException({
        message: MESSAGES.INTERNAL_ERROR,
      });
    }
  }
}
