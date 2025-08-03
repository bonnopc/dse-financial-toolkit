import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Kysely } from 'kysely';
import { PAGINATION_CONSTANTS } from '../constants/pagination.constants';
import { DATABASE_CONNECTION } from '../database/database.module';
import { Database } from '../database/schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FinancialScoringService } from './financial-scoring.service';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Kysely<Database>,
    private readonly financialScoringService: FinancialScoringService
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto) {
    const {
      name,
      fullName,
      dividends,
      loans,
      reserveAndIncome,
      metadata,
      priceInfo,
      financialPerformance,
      otherInfo,
      unauditedPERatio,
    } = createCompanyDto;

    return await this.db.transaction().execute(async (trx) => {
      // Check if company already exists
      const existingCompany = await trx
        .selectFrom('companies')
        .where('code', '=', name)
        .selectAll()
        .executeTakeFirst();

      if (existingCompany) {
        throw new ConflictException(`Company with code ${name} already exists`);
      }

      // Insert company
      const company = await trx
        .insertInto('companies')
        .values({
          code: name,
          full_name: fullName,
          sector: metadata.sector,
          listing_year: otherInfo.listingYear || 0,
          market_category: otherInfo.marketCategory || 'A',
          unaudited_pe_ratio: unauditedPERatio || null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(['id', 'code', 'full_name', 'sector'])
        .executeTakeFirstOrThrow();

      // Insert dividends
      if (dividends.length > 0) {
        await trx
          .insertInto('dividends')
          .values(
            dividends.map((dividend) => ({
              company_id: company.id,
              year: dividend.year,
              cash_dividend: dividend.cashDividend,
              stock_dividend: dividend.stockDividend,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .execute();
      }

      // Insert company loans
      await trx
        .insertInto('company_loans')
        .values({
          company_id: company.id,
          short_term_million: loans.shortTermMillion,
          long_term_million: loans.longTermMillion,
          date_updated: loans.dateUpdated,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      // Insert company reserves
      await trx
        .insertInto('company_reserves')
        .values({
          company_id: company.id,
          reserve_million: reserveAndIncome.reserveMillion,
          unappropriated_profit_million:
            reserveAndIncome.unappropriatedProfitMillion,
          date_updated: reserveAndIncome.dateUpdated,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      // Insert company metadata
      await trx
        .insertInto('company_metadata')
        .values({
          company_id: company.id,
          authorized_capital_million: metadata.authorizedCapitalInMillion,
          paid_up_capital_million: metadata.paidUpCapitalInMillion,
          share_count: metadata.shareCount,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      // Insert price info
      await trx
        .insertInto('price_info')
        .values({
          company_id: company.id,
          last_trading_price: priceInfo.lastTradingPrice,
          change_amount: priceInfo.changeAmount,
          change_percentage: priceInfo.changePercentage,
          volume: priceInfo.volume,
          value_million: priceInfo.valueMillion,
          trade_count: priceInfo.tradeCount,
          week_52_min: priceInfo.week52Min || 0,
          week_52_max: priceInfo.week52Max || 0,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      // Insert financial performance
      if (financialPerformance.length > 0) {
        await trx
          .insertInto('financial_performance')
          .values(
            financialPerformance.map((perf) => ({
              company_id: company.id,
              year: perf.year,
              earnings_per_share: perf.earningsPerShare,
              net_operating_cash_flow_per_share:
                perf.netOperatingCashFlowPerShare,
              net_asset_value_per_share: perf.netAssetValuePerShare,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .execute();
      }

      // Insert shareholding percentages
      if (
        otherInfo.shareHoldingParcentages &&
        otherInfo.shareHoldingParcentages.length > 0
      ) {
        await trx
          .insertInto('shareholding_percentages')
          .values(
            otherInfo.shareHoldingParcentages.map((shareholding) => ({
              company_id: company.id,
              date_recorded: new Date(shareholding.date),
              sponsor_or_director: shareholding.sponsorOrDirector,
              government: shareholding.government,
              institution: shareholding.institution,
              foreign_ownership: shareholding.foreign,
              public_shares: shareholding.publicShares,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .execute();
      }

      // Calculate and store financial score for the newly created company
      await this.calculateAndStoreFinancialScore(trx, company.id);

      // Fetch the company with financial score included
      const updatedCompany = await trx
        .selectFrom('companies')
        .where('id', '=', company.id)
        .selectAll()
        .executeTakeFirstOrThrow();

      return updatedCompany;
    });
  }

  async upsertCompany(createCompanyDto: CreateCompanyDto) {
    const {
      name,
      fullName,
      dividends,
      loans,
      reserveAndIncome,
      metadata,
      priceInfo,
      financialPerformance,
      otherInfo,
      unauditedPERatio,
    } = createCompanyDto;

    return await this.db.transaction().execute(async (trx) => {
      // Check if company already exists
      let company = await trx
        .selectFrom('companies')
        .where('code', '=', name)
        .selectAll()
        .executeTakeFirst();

      if (company) {
        // Update existing company
        await trx
          .updateTable('companies')
          .set({
            full_name: fullName,
            sector: metadata.sector,
            listing_year: otherInfo.listingYear || 0,
            market_category: otherInfo.marketCategory || 'A',
            unaudited_pe_ratio: unauditedPERatio || null,
            updated_at: new Date(),
          })
          .where('code', '=', name)
          .execute();

        // Re-fetch the updated company
        company = await trx
          .selectFrom('companies')
          .where('code', '=', name)
          .selectAll()
          .executeTakeFirstOrThrow();

        // Delete existing related data to replace with fresh data
        await Promise.all([
          trx
            .deleteFrom('dividends')
            .where('company_id', '=', company.id)
            .execute(),
          trx
            .deleteFrom('company_loans')
            .where('company_id', '=', company.id)
            .execute(),
          trx
            .deleteFrom('company_reserves')
            .where('company_id', '=', company.id)
            .execute(),
          trx
            .deleteFrom('financial_performance')
            .where('company_id', '=', company.id)
            .execute(),
          trx
            .deleteFrom('shareholding_percentages')
            .where('company_id', '=', company.id)
            .execute(),
        ]);

        // Update metadata and price info (these are single records)
        await Promise.all([
          trx
            .updateTable('company_metadata')
            .set({
              authorized_capital_million: metadata.authorizedCapitalInMillion,
              paid_up_capital_million: metadata.paidUpCapitalInMillion,
              share_count: metadata.shareCount,
              updated_at: new Date(),
            })
            .where('company_id', '=', company.id)
            .execute(),

          trx
            .updateTable('price_info')
            .set({
              last_trading_price: priceInfo.lastTradingPrice,
              change_amount: priceInfo.changeAmount,
              change_percentage: priceInfo.changePercentage,
              volume: priceInfo.volume,
              value_million: priceInfo.valueMillion,
              trade_count: priceInfo.tradeCount,
              week_52_min: priceInfo.week52Min || 0,
              week_52_max: priceInfo.week52Max || 0,
              updated_at: new Date(),
            })
            .where('company_id', '=', company.id)
            .execute(),
        ]);
      } else {
        // Create new company
        company = await trx
          .insertInto('companies')
          .values({
            code: name,
            full_name: fullName,
            sector: metadata.sector,
            listing_year: otherInfo.listingYear || 0,
            market_category: otherInfo.marketCategory || 'A',
            unaudited_pe_ratio: unauditedPERatio || null,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning([
            'id',
            'code',
            'full_name',
            'sector',
            'listing_year',
            'market_category',
            'unaudited_pe_ratio',
            'financial_score',
            'financial_score_components',
            'financial_score_calculated_at',
            'created_at',
            'updated_at',
          ])
          .executeTakeFirstOrThrow();

        // Insert metadata and price info for new company
        await Promise.all([
          trx
            .insertInto('company_metadata')
            .values({
              company_id: company.id,
              authorized_capital_million: metadata.authorizedCapitalInMillion,
              paid_up_capital_million: metadata.paidUpCapitalInMillion,
              share_count: metadata.shareCount,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .execute(),

          trx
            .insertInto('price_info')
            .values({
              company_id: company.id,
              last_trading_price: priceInfo.lastTradingPrice,
              change_amount: priceInfo.changeAmount,
              change_percentage: priceInfo.changePercentage,
              volume: priceInfo.volume,
              value_million: priceInfo.valueMillion,
              trade_count: priceInfo.tradeCount,
              week_52_min: priceInfo.week52Min || 0,
              week_52_max: priceInfo.week52Max || 0,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .execute(),
        ]);
      }

      // Insert fresh data (for both new and existing companies)
      if (dividends.length > 0) {
        await trx
          .insertInto('dividends')
          .values(
            dividends.map((dividend) => ({
              company_id: company.id,
              year: dividend.year,
              cash_dividend: dividend.cashDividend,
              stock_dividend: dividend.stockDividend,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .execute();
      }

      // Insert loans
      await trx
        .insertInto('company_loans')
        .values({
          company_id: company.id,
          short_term_million: loans.shortTermMillion,
          long_term_million: loans.longTermMillion,
          date_updated: loans.dateUpdated,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      // Insert reserve and income
      await trx
        .insertInto('company_reserves')
        .values({
          company_id: company.id,
          reserve_million: reserveAndIncome.reserveMillion,
          unappropriated_profit_million:
            reserveAndIncome.unappropriatedProfitMillion,
          date_updated: reserveAndIncome.dateUpdated,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      // Insert financial performance
      if (financialPerformance.length > 0) {
        await trx
          .insertInto('financial_performance')
          .values(
            financialPerformance.map((perf) => ({
              company_id: company.id,
              year: perf.year,
              earnings_per_share: perf.earningsPerShare,
              net_operating_cash_flow_per_share:
                perf.netOperatingCashFlowPerShare,
              net_asset_value_per_share: perf.netAssetValuePerShare,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .execute();
      }

      // Insert shareholding percentages
      if (
        otherInfo.shareHoldingParcentages &&
        otherInfo.shareHoldingParcentages.length > 0
      ) {
        await trx
          .insertInto('shareholding_percentages')
          .values(
            otherInfo.shareHoldingParcentages.map((shareholding) => ({
              company_id: company.id,
              date_recorded: new Date(shareholding.date),
              sponsor_or_director: shareholding.sponsorOrDirector,
              government: shareholding.government,
              institution: shareholding.institution,
              foreign_ownership: shareholding.foreign,
              public_shares: shareholding.publicShares,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .execute();
      }

      // Calculate and store financial score
      await this.calculateAndStoreFinancialScore(trx, company.id);

      // Fetch the company with financial score included
      const updatedCompany = await trx
        .selectFrom('companies')
        .where('id', '=', company.id)
        .selectAll()
        .executeTakeFirstOrThrow();

      return updatedCompany;
    });
  }

  private async calculateAndStoreFinancialScore(trx: any, companyId: number) {
    // Fetch company data needed for scoring
    const companyData = await trx
      .selectFrom('companies')
      .leftJoin(
        'company_metadata',
        'companies.id',
        'company_metadata.company_id'
      )
      .leftJoin('price_info', 'companies.id', 'price_info.company_id')
      .leftJoin('company_loans', 'companies.id', 'company_loans.company_id')
      .leftJoin(
        'company_reserves',
        'companies.id',
        'company_reserves.company_id'
      )
      .select([
        'companies.id',
        'companies.code',
        'companies.full_name',
        'companies.sector',
        'companies.unaudited_pe_ratio',
        'company_metadata.authorized_capital_million',
        'company_metadata.paid_up_capital_million',
        'company_metadata.share_count',
        'price_info.last_trading_price',
        'price_info.change_amount',
        'price_info.change_percentage',
        'price_info.volume',
        'price_info.value_million',
        'price_info.trade_count',
        'price_info.week_52_min',
        'price_info.week_52_max',
        'company_loans.short_term_million',
        'company_loans.long_term_million',
        'company_reserves.reserve_million',
        'company_reserves.unappropriated_profit_million',
      ])
      .where('companies.id', '=', companyId)
      .executeTakeFirst();

    if (!companyData) {
      return;
    }

    // Fetch related data
    const [dividends, financialPerformance, shareholding] = await Promise.all([
      trx
        .selectFrom('dividends')
        .select(['year', 'cash_dividend', 'stock_dividend'])
        .where('company_id', '=', companyId)
        .orderBy('year', 'desc')
        .execute(),

      trx
        .selectFrom('financial_performance')
        .select([
          'year',
          'earnings_per_share',
          'net_operating_cash_flow_per_share',
          'net_asset_value_per_share',
        ])
        .where('company_id', '=', companyId)
        .orderBy('year', 'desc')
        .execute(),

      trx
        .selectFrom('shareholding_percentages')
        .select([
          'sponsor_or_director',
          'government',
          'institution',
          'foreign_ownership',
          'public_shares',
        ])
        .where('company_id', '=', companyId)
        .orderBy('date_recorded', 'desc')
        .limit(1)
        .executeTakeFirst(),
    ]);

    // Transform data to match the expected format
    const transformedCompany = {
      code: companyData.code,
      unauditedPERatio: companyData.unaudited_pe_ratio,
      paidUpCapitalInMillion: companyData.paid_up_capital_million || 1,
      shortTermMillion: companyData.short_term_million || 0,
      longTermMillion: companyData.long_term_million || 0,
      reserveInMillion: companyData.reserve_million || 0,
      lastTradingPrice: companyData.last_trading_price,
      movingRangeFor52Weeks: {
        min: companyData.week_52_min || 0,
        max: companyData.week_52_max || 0,
      },
      dividends:
        dividends?.map((d) => ({
          year: d.year,
          cashDividend: d.cash_dividend || 0,
          stockDividend: d.stock_dividend || 0,
        })) || [],
      financialPerformance:
        financialPerformance?.map((f) => ({
          year: f.year,
          earningsPerShare: f.earnings_per_share || 0,
        })) || [],
      shareholdingPercentages: shareholding
        ? [
            {
              date: new Date().toISOString(),
              sponsorOrDirector: shareholding.sponsor_or_director || 0,
              institution: shareholding.institution || 0,
              foreign: shareholding.foreign_ownership || 0,
            },
          ]
        : [],
    };

    // Calculate financial score
    const scoreResult =
      this.financialScoringService.calculateFinancialScore(transformedCompany);

    // Store the financial score
    await trx
      .updateTable('companies')
      .set({
        financial_score: scoreResult.overall,
        financial_score_components: JSON.stringify(scoreResult.breakdown),
        financial_score_calculated_at: new Date(),
        updated_at: new Date(),
      })
      .where('id', '=', companyId)
      .execute();
  }

  async findAll(
    sector?: string,
    limit: number = PAGINATION_CONSTANTS.MAX_LIMIT,
    offset: number = PAGINATION_CONSTANTS.DEFAULT_OFFSET
  ) {
    let query = this.db
      .selectFrom('companies')
      .leftJoin(
        'company_metadata',
        'companies.id',
        'company_metadata.company_id'
      )
      .leftJoin('price_info', 'companies.id', 'price_info.company_id')
      .leftJoin('company_loans', 'companies.id', 'company_loans.company_id')
      .leftJoin(
        'company_reserves',
        'companies.id',
        'company_reserves.company_id'
      )
      .select([
        // Companies table
        'companies.id',
        'companies.code',
        'companies.full_name',
        'companies.sector',
        'companies.listing_year',
        'companies.market_category',
        'companies.unaudited_pe_ratio',
        'companies.financial_score',
        'companies.financial_score_components',
        'companies.financial_score_calculated_at',
        'companies.created_at',
        'companies.updated_at',
        // Company metadata
        'company_metadata.company_id',
        'company_metadata.authorized_capital_million',
        'company_metadata.paid_up_capital_million',
        'company_metadata.share_count',
        // Price info
        'price_info.last_trading_price',
        'price_info.change_amount',
        'price_info.change_percentage',
        'price_info.volume',
        'price_info.value_million',
        'price_info.trade_count',
        'price_info.week_52_min',
        'price_info.week_52_max',
        'price_info.updated_at as date_updated',
        // Company loans
        'company_loans.short_term_million',
        'company_loans.long_term_million',
        // Company reserves
        'company_reserves.reserve_million',
        'company_reserves.unappropriated_profit_million',
      ]);

    if (sector) {
      query = query.where('companies.sector', '=', sector);
    }

    const companies = await query.limit(limit).offset(offset).execute();

    // Fetch related data for each company
    const companiesWithRelatedData = await Promise.all(
      companies.map(async (company) => {
        console.log(
          `Fetching related data for company ID: ${company.id}, Code: ${company.code}`
        );

        // Get dividends
        const dividends = await this.db
          .selectFrom('dividends')
          .where('company_id', '=', company.id)
          .selectAll()
          .orderBy('year', 'desc')
          .execute();

        console.log(`Found ${dividends.length} dividends for ${company.code}`);

        // Get financial performance
        const financialPerformance = await this.db
          .selectFrom('financial_performance')
          .where('company_id', '=', company.id)
          .selectAll()
          .orderBy('year', 'desc')
          .execute();

        console.log(
          `Found ${financialPerformance.length} financial records for ${company.code}`
        );

        // Get shareholding percentages
        const shareholdingData = await this.db
          .selectFrom('shareholding_percentages')
          .where('company_id', '=', company.id)
          .selectAll()
          .orderBy('date_recorded', 'desc')
          .execute();

        console.log(
          `Found ${shareholdingData.length} shareholding records for ${company.code}`
        );

        return {
          ...company,
          dividends,
          financial_performance: financialPerformance,
          shareholding_percentages: shareholdingData,
          // Financial score is now included in the main query
          financial_score: company.financial_score,
          financial_score_components: company.financial_score_components
            ? JSON.parse(company.financial_score_components)
            : null,
          financial_score_calculated_at: company.financial_score_calculated_at,
        };
      })
    );

    return companiesWithRelatedData;
  }

  async findOne(code: string) {
    const company = await this.db
      .selectFrom('companies')
      .where('code', '=', code)
      .selectAll()
      .executeTakeFirst();

    if (!company) {
      throw new NotFoundException(`Company with code ${code} not found`);
    }

    // Get related data
    const [
      dividends,
      loans,
      reserves,
      metadata,
      priceInfo,
      financialPerformance,
    ] = await Promise.all([
      this.db
        .selectFrom('dividends')
        .where('company_id', '=', company.id)
        .selectAll()
        .execute(),
      this.db
        .selectFrom('company_loans')
        .where('company_id', '=', company.id)
        .selectAll()
        .executeTakeFirst(),
      this.db
        .selectFrom('company_reserves')
        .where('company_id', '=', company.id)
        .selectAll()
        .executeTakeFirst(),
      this.db
        .selectFrom('company_metadata')
        .where('company_id', '=', company.id)
        .selectAll()
        .executeTakeFirst(),
      this.db
        .selectFrom('price_info')
        .where('company_id', '=', company.id)
        .selectAll()
        .executeTakeFirst(),
      this.db
        .selectFrom('financial_performance')
        .where('company_id', '=', company.id)
        .selectAll()
        .execute(),
    ]);

    return {
      ...company,
      dividends,
      loans,
      reserves,
      metadata,
      priceInfo,
      financialPerformance,
    };
  }

  async getSectors() {
    const sectors = await this.db
      .selectFrom('companies')
      .select('sector')
      .where('sector', 'is not', null)
      .groupBy('sector')
      .execute();

    return sectors.map((s) => s.sector).filter(Boolean);
  }
}
