import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ConfigModule } from '../config/config.module';
import { ContractLoader } from './utils/contract-loader';
import { ContractsController } from './contracts.controller';
import { ENSService } from './ens/ens.service';

@Module({
  imports: [ConfigModule],
  providers: [ContractsService, ContractLoader, ENSService],
  exports: [ContractsService, ENSService],
  controllers: [ContractsController],
})
export class ContractsModule {}
