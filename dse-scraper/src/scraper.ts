import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import pLimit from 'p-limit';
import { DSEApiClient } from './api/client.js';
import { getCompanyData } from './scrapers/dividend.js';
import { extractCompanyFullName } from './scrapers/utils/extractCompanyFullName.js';
import { fetchCompanyNames } from './scrapers/utils/fetchCompanyNames.js';
import { CompanyInfo } from './types/company.js';

const BASE_URL = 'https://www.dsebd.org';
const OUTPUT_FILE = '../nextjs-dividend-viewer/src/data/dividends.json'; // JSON file to store data (backup)

// Initialize API client
const apiClient = new DSEApiClient();

// Limit the number of parallel requests
const limit = pLimit(5);

// Fetch dividend data for a single company
async function fetchCompanyData(name: string): Promise<CompanyInfo[]> {
  try {
    const url = `${BASE_URL}/displayCompany.php?name=${name}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const fullName = extractCompanyFullName($);
    const restData = getCompanyData($);

    return [{ name, fullName, ...restData }];
  } catch (error) {
    console.error(`❌ Error fetching data for ${name}:`, error);
    return [];
  }
}

// Store the scraped data in database via API
async function saveToDatabase(data: CompanyInfo[]): Promise<void> {
  try {
    console.log(`🔄 Saving ${data.length} companies to database...`);

    let successCount = 0;
    let errorCount = 0;

    for (const company of data) {
      try {
        const result = await apiClient.createCompany(company);
        if (result !== null) {
          successCount++;
          console.log(`✅ Saved/Updated ${company.name} in database`);
        } else {
          errorCount++;
          console.log(`⚠️ Failed to save ${company.name} (validation error)`);
        }
      } catch (error) {
        errorCount++;
        if (error instanceof Error) {
          console.error(`❌ Failed to save ${company.name}: ${error.message}`);
        } else {
          console.error(`❌ Failed to save ${company.name}: Unknown error`);
        }
        // Continue processing other companies instead of stopping
      }
    }

    console.log(
      `📊 Database save summary: ${successCount} success, ${errorCount} errors`
    );
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    // Don't throw error here, let the process continue
  }
}

// Store the scraped data in a JSON file (backup)
function saveToJSON(data: CompanyInfo[]): void {
  try {
    // Create directory if it doesn't exist
    const dir = OUTPUT_FILE.substring(0, OUTPUT_FILE.lastIndexOf('/'));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Backup saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Error saving JSON backup:', error);
  }
}

// Scrape and store data for all companies
async function scrapeAllCompanies(): Promise<void> {
  console.log('🔍 Checking API connection...');

  // Check if API is available
  const isApiHealthy = await apiClient.healthCheck();
  if (!isApiHealthy) {
    console.error(
      '❌ API is not available. Please make sure the DSE API server is running.'
    );
    console.log(
      '💡 Start the API server with: cd dse-api && bun run start:dev'
    );
    return;
  }
  console.log('✅ API connection successful');

  console.log('⏳ Fetching company names...');
  const companyList = await fetchCompanyNames();
  // const companyList = ["ABB1STMF"]; // For testing purposes - this company has rich data

  if (companyList.length === 0) {
    console.error('❌ No companies found. Exiting...');
    return;
  }

  let companyInfo: CompanyInfo[] = [];

  const tasks = companyList.map((company) =>
    limit(async () => {
      console.log(`🔍 Fetching dividend data for ${company}...`);
      const data = await fetchCompanyData(company);
      if (data.length > 0) {
        companyInfo = companyInfo.concat(data);
      }
    })
  );

  await Promise.all(tasks);

  // Save to database first
  await saveToDatabase(companyInfo);

  // Also save to JSON as backup
  saveToJSON(companyInfo);

  console.log(
    `✅ Scraping completed. Processed ${companyInfo.length} companies.`
  );
}

// Run the scraper
scrapeAllCompanies();
