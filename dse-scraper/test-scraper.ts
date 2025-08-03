import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from 'dotenv';
import { DSEApiClient } from './src/api/client';
import { getCompanyData } from './src/scrapers/dividend';
import { extractCompanyFullName } from './src/scrapers/utils/extractCompanyFullName';

config();

const apiClient = new DSEApiClient();

async function fetchDividendData(companyCode: string) {
  try {
    const response = await axios.get(
      `https://www.dsebd.org/displayCompany.php?name=${companyCode}`,
      {
        timeout: 10000,
      }
    );
    const $ = cheerio.load(response.data);
    return getCompanyData($);
  } catch (error) {
    console.error(
      `Error fetching data for ${companyCode}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function testSpecificCompanies() {
  // Test a mix of different types of companies
  const testCompanies = [
    'BEXIMCO', // Regular company that should work
    'TB10Y0126', // Treasury bond - might fail
    'AAMRANET', // Tech company
    'INVALID123', // This will definitely fail
    'BANKASIA', // Bank
  ];

  console.log('🧪 Testing specific companies for errors...');

  for (const company of testCompanies) {
    try {
      console.log(`\n🔍 Testing ${company}...`);

      // Test scraping
      const data = await fetchDividendData(company);
      if (!data || Object.keys(data).length === 0) {
        console.log(`⚠️ ${company}: No data returned from scraper`);
        continue;
      }

      // Extract full name
      const response = await axios.get(
        `https://www.dsebd.org/displayCompany.php?name=${company}`
      );
      const $ = cheerio.load(response.data);
      const fullName = extractCompanyFullName($);

      const companyInfo = { name: company, fullName, ...data };

      console.log(`✅ ${company}: Scraped successfully`);
      console.log(`   - Full name: ${fullName || 'Not found'}`);
      console.log(`   - Dividends: ${data.dividends?.length || 0} records`);
      console.log(`   - Sector: ${data.metadata?.sector || 'Not found'}`);

      // Test API submission
      try {
        const result = await apiClient.createCompany(companyInfo);
        if (result === null) {
          console.log(`⚠️ ${company}: Already exists in database`);
        } else {
          console.log(`✅ ${company}: Saved to database`);
        }
      } catch (apiError) {
        console.error(
          `❌ ${company}: API Error -`,
          apiError instanceof Error ? apiError.message : apiError
        );
      }
    } catch (error) {
      console.error(
        `❌ ${company}: Scraping Error -`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

testSpecificCompanies()
  .then(() => {
    console.log('\n🧪 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
