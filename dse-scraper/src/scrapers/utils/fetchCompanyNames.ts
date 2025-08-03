import axios from 'axios';
import * as cheerio from 'cheerio';

const COMPANY_LIST_URL = 'https://www.dsebd.org/company_listing.php';

// Fetch all company names dynamically
export async function fetchCompanyNames(): Promise<string[]> {
  try {
    const response = await axios.get(COMPANY_LIST_URL);
    const $ = cheerio.load(response.data);
    let companyList: string[] = [];

    // Look for links in divs with BodyContent class
    $('div.BodyContent').each((_index, div) => {
      $(div)
        .find('a')
        .each((_linkIndex, link) => {
          const href = $(link).attr('href');
          if (href && href.includes('displayCompany.php?name=')) {
            const companyName = href.split('=')[1];
            if (companyName && !companyList.includes(companyName)) {
              companyList.push(companyName);
            }
          }
        });
    });

    console.log(`✅ Found ${companyList.length} companies.`);
    return companyList;
  } catch (error) {
    console.error('❌ Error fetching company names:', error);
    return [];
  }
}
