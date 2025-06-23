import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Param,
  HttpCode,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { GetProposalResponseDto } from './dto/get-proposal.response.dto';
import { MESSAGES } from '../common/messages';

@Controller()
export class ProposalsController {
  constructor(private readonly proposalService: ProposalsService) {}

  @Get('proposal-data/:callId/:proposal')
  async getProposalData(
    @Param('callId') callId: string,
    @Param('proposal') proposal: string,
  ) {
    try {
      const data = await this.proposalService.getProposalData(callId, proposal);
      return new GetProposalResponseDto({
        sender: data.sender,
        blockNumber: Number(data.blockNumber),
        timestamp: new Date(Number(data.timestamp) * 1000).toISOString(),
      });
    } catch (error) {
      console.error('[ERROR] getProposalData', error);
      throw error;
    }
  }

  @Post('register-proposal')
  @HttpCode(201)
  async registerProposal(
    @Body() body: { callId: string; proposal: string },
    @Headers('content-type') contentType?: string,
  ) {
    if (contentType !== 'application/json') {
      throw new BadRequestException({ message: MESSAGES.INVALID_MIMETYPE });
    }

    const { callId, proposal } = body;

    try {
      await this.proposalService.registerProposal(callId, proposal);
      return { message: MESSAGES.OK };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: MESSAGES.INTERNAL_ERROR,
      });
    }
  }
}
