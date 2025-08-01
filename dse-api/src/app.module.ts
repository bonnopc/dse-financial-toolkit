import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './companies/companies.module';
import { DatabaseModule } from './database/database.module';
import { DividendsModule } from './dividends/dividends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CompaniesModule,
    DividendsModule,
  ],
})
export class AppModule {}
