import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { GetProposalResponseDto } from './dto/get-proposal.response.dto';
import { RegisterProposalRequestDto } from './dto/register-proposal-request.dto';
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
  async registerProposal(
    @Body() body: RegisterProposalRequestDto,
    @Headers('content-type') contentType?: string,
  ) {
    //TODO: con pipes creo que se puede hacer esto Validar Content-Type
    if (contentType !== 'application/json') {
      throw new HttpException(
        MESSAGES.INVALID_MIMETYPE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { callId, proposal } = body;
    await this.proposalService.registerProposal(callId, proposal);

    return {
      statusCode: 201,
      message: MESSAGES.OK,
    };
  }
}
