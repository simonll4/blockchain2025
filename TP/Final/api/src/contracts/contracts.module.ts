import { Module } from '@nestjs/common';
import { CFPFactoryService } from './services/business.service';
import { ConfigModule } from '../config/config.module';
import { ContractLoader } from './utils/contract-loader';
import { ContractsController } from './contracts.controller';
import { ENSService } from './services/ens.service';

@Module({
  imports: [ConfigModule],
  providers: [CFPFactoryService, ContractLoader, ENSService],
  exports: [CFPFactoryService, ENSService],
  controllers: [ContractsController],
})
export class ContractsModule {}
