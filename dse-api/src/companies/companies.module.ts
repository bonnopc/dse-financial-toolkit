import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { FinancialScoringService } from './financial-scoring.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, FinancialScoringService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
