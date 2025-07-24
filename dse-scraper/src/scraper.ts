import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import pLimit from "p-limit";
import { getCompanyData } from "./scrapers/dividend.js";
import { extractCompanyFullName } from "./scrapers/utils/extractCompanyFullName.js";
import { fetchCompanyNames } from "./scrapers/utils/fetchCompanyNames.js";
import { CompanyInfo } from "./types/company.js";

const BASE_URL = "https://www.dsebd.org";
const OUTPUT_FILE = "../nextjs-dividend-viewer/src/data/dividends.json"; // JSON file to store data

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

// Store the scraped data in a JSON file
function saveToJSON(data: CompanyInfo[]): void {
    try {
        // Create directory if it doesn't exist
        const dir = OUTPUT_FILE.substring(0, OUTPUT_FILE.lastIndexOf('/'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ Data saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error("❌ Error saving JSON file:", error);
    }
}

// Scrape and store data for all companies
async function scrapeAllCompanies(): Promise<void> {
    console.log("⏳ Fetching company names...");
    const companyList = await fetchCompanyNames();
    // const companyList = ["BEXIMCO"]; // For testing purposes

    if (companyList.length === 0) {
        console.error("❌ No companies found. Exiting...");
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

    saveToJSON(companyInfo);
    console.log(`✅ Scraping completed. Processed ${companyInfo.length} companies.`);
}

// Run the scraper
scrapeAllCompanies();