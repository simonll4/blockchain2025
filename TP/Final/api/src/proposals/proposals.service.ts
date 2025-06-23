import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { ethers } from 'ethers';
import { MESSAGES } from '../common/messages';
import { CallData } from './interfaces/call-data.interface';
import { ProposalData } from './interfaces/proposal-data.interface';

@Injectable()
export class ProposalsService {
  constructor(private readonly contractsService: ContractsService) {}

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

  async registerProposal(callId: string, proposal: string): Promise<string> {
    // Validar callId y proposal (hex de 32 bytes)
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
      console.error('[ERROR] registerProposal - factory.calls', err);
      throw new HttpException(
        MESSAGES.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const { creator, cfp: cfpAddress } = callData;

    if (creator === ethers.ZeroAddress) {
      throw new HttpException(MESSAGES.CALLID_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const cfpContract = this.contractsService.getCfp(String(cfpAddress));

    let proposalData: ProposalData;
    try {
      proposalData = await cfpContract.proposalData(proposal);
    } catch (err) {
      console.error('[ERROR] registerProposal - cfpContract.proposalData', err);
      throw new HttpException(
        MESSAGES.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const { sender } = proposalData;

    if (sender !== ethers.ZeroAddress) {
      throw new HttpException(
        MESSAGES.ALREADY_REGISTERED,
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const tx = await factory.registerProposal(callId, proposal);
      await tx.wait();
      return tx.hash;
    } catch (err) {
      console.error('[ERROR] registerProposal - factory.registerProposal', err);
      throw new HttpException(
        MESSAGES.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
