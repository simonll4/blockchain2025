import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { MESSAGES } from 'src/common/messages';

@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('/contract-address')
  async getContractAddress() {
    const factory = this.contractsService.getFactory();
    return { address: await factory.getAddress() };
  }

  @Get('/contract-owner')
  async getContractOwner() {
    try {
      const factory = this.contractsService.getFactory();
      const owner = await factory.owner();
      return { address: owner };
    } catch (error) {
      console.error('[ERROR] getContractOwner:', error);
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
