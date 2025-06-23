import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ContractsModule } from './contracts/contracts.module';
import { ProposalsModule } from './proposals/proposals.module';
import { CallsModule } from './calls/calls.module';
import { AccountsModule } from './accounts/accounts.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    ContractsModule,
    ProposalsModule,
    CallsModule,
    AccountsModule,
    HealthModule,
  ],
})
export class AppModule {}
