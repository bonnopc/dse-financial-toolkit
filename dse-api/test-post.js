const fetch = require('node-fetch');

const testData = {
  name: 'TESTPOST123',
  fullName: 'Test Post Company Limited',
  dividends: [{ year: 2023, cashDividend: 2, stockDividend: 0 }],
  loans: {
    shortTermMillion: 20,
    longTermMillion: 30,
    dateUpdated: '2023-12-31',
  },
  reserveAndIncome: {
    reserveMillion: 50,
    unappropriatedProfitMillion: 25,
    dateUpdated: '2023-12-31',
  },
  metadata: {
    sector: 'Technology',
    authorizedCapitalInMillion: 200,
    paidUpCapitalInMillion: 100,
    shareCount: 10000000,
  },
  priceInfo: {
    lastTradingPrice: 25,
    changeAmount: 1.5,
    changePercentage: 6.38,
    volume: 1000,
    valueMillion: 25,
    tradeCount: 100,
    week52Min: 20,
    week52Max: 30,
  },
  financialPerformance: [
    {
      year: 2023,
      earningsPerShare: 3.5,
      netOperatingCashFlowPerShare: 4,
      netAssetValuePerShare: 15,
    },
  ],
  otherInfo: {
    listingYear: 2020,
    marketCategory: 'A',
    shareHoldingParcentages: [
      {
        date: '2023-12-31',
        sponsorOrDirector: 30,
        government: 5,
        institution: 25,
        foreign: 15,
        publicShares: 25,
      },
    ],
  },
  unauditedPERatio: 15,
};

async function testPost() {
  try {
    const response = await fetch('http://localhost:3000/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('Response:', responseText);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPost();
