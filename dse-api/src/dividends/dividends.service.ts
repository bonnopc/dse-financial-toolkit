import { DATABASE_CONNECTION } from '../database/database.module';
import { Database } from '../database/schema';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';

@Injectable()
export class DividendsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Kysely<Database>,
  ) {}

  async findByCompany(companyCode: string) {
    return await this.db
      .selectFrom('dividends')
      .innerJoin('companies', 'companies.id', 'dividends.company_id')
      .where('companies.code', '=', companyCode)
      .select([
        'dividends.year',
        'dividends.cash_dividend',
        'dividends.stock_dividend',
        'dividends.created_at',
        'dividends.updated_at',
      ])
      .orderBy('dividends.year', 'desc')
      .execute();
  }

  async findTopDividendPayers(limit: number = 10) {
    return await this.db
      .selectFrom('dividends')
      .innerJoin('companies', 'companies.id', 'dividends.company_id')
      .select([
        'companies.code',
        'companies.full_name',
        'companies.sector',
      ])
      .select((eb) => [
        eb.fn.avg('dividends.cash_dividend').as('avg_cash_dividend'),
        eb.fn.avg('dividends.stock_dividend').as('avg_stock_dividend'),
        eb.fn.count('dividends.id').as('dividend_count'),
      ])
      .groupBy(['companies.code', 'companies.full_name', 'companies.sector'])
      .having((eb) => eb.fn.count('dividends.id'), '>=', 3) // At least 3 years of dividend data
      .orderBy('avg_cash_dividend', 'desc')
      .limit(limit)
      .execute();
  }

  async getDividendStats() {
    const stats = await this.db
      .selectFrom('dividends')
      .select((eb) => [
        eb.fn.avg('dividends.cash_dividend').as('avg_cash_dividend'),
        eb.fn.max('dividends.cash_dividend').as('max_cash_dividend'),
        eb.fn.min('dividends.cash_dividend').as('min_cash_dividend'),
        eb.fn.avg('dividends.stock_dividend').as('avg_stock_dividend'),
        eb.fn.max('dividends.stock_dividend').as('max_stock_dividend'),
        eb.fn.min('dividends.stock_dividend').as('min_stock_dividend'),
        eb.fn.count('dividends.id').as('total_dividend_records'),
      ])
      .executeTakeFirst();

    return stats;
  }

  async getDividendTrends(years: number = 5) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;

    return await this.db
      .selectFrom('dividends')
      .select([
        'dividends.year',
      ])
      .select((eb) => [
        eb.fn.avg('dividends.cash_dividend').as('avg_cash_dividend'),
        eb.fn.avg('dividends.stock_dividend').as('avg_stock_dividend'),
        eb.fn.count('dividends.id').as('company_count'),
      ])
      .where('dividends.year', '>=', startYear)
      .groupBy('dividends.year')
      .orderBy('dividends.year', 'desc')
      .execute();
  }
}
