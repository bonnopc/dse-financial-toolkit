import { CompanyInfo } from '@/types/company.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';

export class DSEApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.DSE_API_URL || 'http://localhost:3001/api/v1';
  }

  async createCompany(companyData: CompanyInfo): Promise<any> {
    try {
      // Transform the data to match API expectations
      const apiData = this.transformCompanyData(companyData);

      const response = await axios.put(
        `${this.baseURL}/companies/upsert`,
        apiData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          // Bad request - data validation error
          console.error(
            `❌ Data validation error for ${companyData.name}:`,
            error.response?.data?.message || 'Invalid data format'
          );
          return null;
        } else {
          console.error(
            `❌ API Error for ${companyData.name} (${error.response?.status}):`,
            error.response?.data?.message || error.message
          );
          return null;
        }
      } else {
        console.error(`❌ Unexpected error for ${companyData.name}:`, error);
        return null;
      }
    }
  }

  private transformCompanyData(companyData: CompanyInfo): any {
    // Validate required fields
    if (!companyData.name) {
      throw new Error(`Missing required field: name`);
    }

    // Clean and validate numeric values
    const cleanNumeric = (value: any): number | null => {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'N/A'
      )
        return null;
      const num =
        typeof value === 'string'
          ? parseFloat(value.replace(/[,%]/g, ''))
          : Number(value);
      return isNaN(num) ? null : num;
    };

    // Safe array mapping with error handling
    const safeDividends = Array.isArray(companyData.dividends)
      ? companyData.dividends.map((dividend) => ({
          year: dividend?.year || new Date().getFullYear(),
          cashDividend: cleanNumeric(dividend?.cashDividend),
          stockDividend: cleanNumeric(dividend?.stockDividend),
        }))
      : [];

    const safeFinancialPerformance = Array.isArray(
      companyData.financialPerformance
    )
      ? companyData.financialPerformance.map((perf: any) => ({
          year: perf?.year || new Date().getFullYear(),
          earningsPerShare: cleanNumeric(perf?.earningsPerShare),
          netOperatingCashFlowPerShare: 0, // Default value since not available in scraper
          netAssetValuePerShare: cleanNumeric(perf?.NAVPerShare),
        }))
      : [];

    // Transform the scraper data structure to match API DTO structure
    return {
      name: companyData.name,
      fullName: companyData.fullName || companyData.name,
      dividends: safeDividends,
      loans: {
        shortTermMillion: cleanNumeric(companyData.loans?.shortTermMillion),
        longTermMillion: cleanNumeric(companyData.loans?.longTermMillion),
        dateUpdated:
          companyData.loans?.dateUpdated ||
          new Date().toISOString().split('T')[0],
      },
      reserveAndIncome: {
        reserveMillion: cleanNumeric(
          companyData.reserveAndIncome?.reserveInMillion
        ),
        unappropriatedProfitMillion: cleanNumeric(
          companyData.reserveAndIncome?.ociInMillion
        ),
        dateUpdated: new Date().toISOString().split('T')[0], // Use current date as fallback
      },
      metadata: {
        sector: companyData.metadata?.sector || 'Unknown',
        authorizedCapitalInMillion: cleanNumeric(
          companyData.metadata?.authorizedCapitalInMillion
        ),
        paidUpCapitalInMillion: cleanNumeric(
          companyData.metadata?.paidUpCapitalInMillion
        ),
        shareCount: cleanNumeric(companyData.metadata?.shareCount),
      },
      priceInfo: {
        lastTradingPrice:
          cleanNumeric(companyData.priceInfo?.lastTradingPrice) || 0,
        changeAmount: 0, // Default value since not available in scraper
        changePercentage: 0, // Default value since not available in scraper
        volume: 0, // Default value since not available in scraper
        valueMillion: 0, // Default value since not available in scraper
        tradeCount: 0, // Default value since not available in scraper
        week52Min:
          cleanNumeric(companyData.priceInfo?.movingRangeFor52Weeks?.min) || 0,
        week52Max:
          cleanNumeric(companyData.priceInfo?.movingRangeFor52Weeks?.max) || 0,
      },
      financialPerformance: safeFinancialPerformance,
      otherInfo: {
        marketLot: 1, // Default value since not available in scraper
        faceValuePerShare: 10, // Common face value in DSE
        marketCategory: companyData.otherInfo?.marketCategory || 'A',
        listingYear: cleanNumeric(companyData.otherInfo?.listingYear) || 0,
        shareHoldingParcentages:
          companyData.otherInfo?.shareHoldingParcentages || [],
      },
      unauditedPERatio: cleanNumeric(companyData.unauditedPERatio),
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/companies/sectors`);
      return response.status === 200;
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      return false;
    }
  }
}
