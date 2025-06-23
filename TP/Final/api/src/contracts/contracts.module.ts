import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ConfigModule } from '../config/config.module';
import { ContractLoader } from './utils/contract-loader';
import { ContractsController } from './contracts.controller';

@Module({
  imports: [ConfigModule],
  providers: [ContractsService, ContractLoader],
  exports: [ContractsService],
  controllers: [ContractsController],
})
export class ContractsModule {}
