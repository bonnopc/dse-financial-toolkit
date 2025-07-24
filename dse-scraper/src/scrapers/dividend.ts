import { CompanyLoan, CompanyMetadata, Dividend, FinancialPerformance, OtherInfo, PriceInfo, ReserveAndIncome } from "@/types/company.js";
import * as cheerio from "cheerio";

interface CompanyData {
    dividends: Dividend[];
    loans: CompanyLoan;
    reserveAndIncome: ReserveAndIncome;
    metadata: CompanyMetadata;
    priceInfo: PriceInfo;
    financialPerformance: FinancialPerformance[];
    otherInfo: OtherInfo;
    unauditedPERatio: number;
}

function getDividendData($: cheerio.Root,dividendTable: cheerio.Cheerio): Dividend[] {
    let dividends: Dividend[] = [];

    // Extract data from the identified table
    dividendTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("td");

        if (cols.length > 8) {
            const year = $(cols[0]).text().trim();
            const dividend = $(cols[7]).text().trim();

            // this dividend might have the following format: "18.00", ""18.00%, 5% B"", "6%B", "6% B" etc.
            // 'B' means stock dividend
            let cashDividend = 0;
            let stockDividend = 0;

            const values = dividend.split(",");

            if(values.length > 1) {
                // case, there is both cash and stock dividend
                // both first or last value can be stock dividend
                if(values[0].toLowerCase().includes("b")) {
                    stockDividend = parseFloat(values[0].replace("%", "").replace("B", "").trim());
                    cashDividend = parseFloat(values[1].replace("%", "").trim());
                } else {
                    cashDividend = parseFloat(values[0].replace("%", "").trim());
                    stockDividend = parseFloat(values[1].replace("%", "").replace("B", "").trim());
                }
            } else if(dividend.toLowerCase().includes("b")) {
                // case, there is stock dividend
                stockDividend = parseFloat(dividend.replace("%", "").replace("B", "").trim());
            } else {
                // case, there is only cash dividend
                cashDividend = parseFloat(dividend.replace("%", "").trim());
            }

            if (/^\d{4}$/.test(year)) {
                dividends.push({
                    year: parseInt(year),
                    cashDividend: Number.isNaN(cashDividend) ? 0 : cashDividend,
                    stockDividend: Number.isNaN(stockDividend) ? 0 : stockDividend
                });
            }
        }
    });

    return dividends;
}

function getLoanData($: cheerio.Root, loanTable: cheerio.Cheerio): CompanyLoan {
    let shortTermMillion = 0;
    let longTermMillion = 0;
    let dateUpdated = "";

    loanTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("td");

        if (cols.length > 2 && $(cols[1]).text().trim().toLowerCase().includes("short-term loan (mn)")) {
            shortTermMillion = parseFloat($(cols[2]).text().trim());
        }

        if(cols.length > 1 && $(cols[0]).text().trim().includes("Long-term loan (mn)")) {
            longTermMillion = parseFloat($(cols[1]).text().trim());
        }

        if(cols.length === 1 && $(cols[0]).text().trim().includes("Present Loan Status as")) {
            dateUpdated = $(cols[0]).text().trim().split("on")[1].trim();
        }
    });

    return {
        shortTermMillion,
        longTermMillion,
        dateUpdated
    };
}

function getReserveAndIncome($: cheerio.Root, reserveAndIncomeTable: cheerio.Cheerio): ReserveAndIncome {
    let reserveInMillion = 0;
    let ociInMillion = 0;

    reserveAndIncomeTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("th");

        if (cols.length === 1 && $(cols[0]).text().trim().toLowerCase().includes("reserve & surplus without oci (mn)")) {
            const values = $(row).find("td");
            reserveInMillion = parseFloat($(values[0]).text().trim().replace(",", ""));
        }

        if(cols.length === 1 && $(cols[0]).text().trim().toLowerCase().includes("other comprehensive income (oci) (mn)")) {
            const values = $(row).find("td");
            ociInMillion = parseFloat($(values[0]).text().trim().replace(",", ""));
        }
    });
    

    return {
        reserveInMillion,
        ociInMillion
    };
}

function getMetadata($: cheerio.Root, metadataTable: cheerio.Cheerio): CompanyMetadata {
    let sector = "";
    let authorizedCapitalInMillion = 0;
    let paidUpCapitalInMillion = 0;
    let shareCount = 0;

    metadataTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("th");

        if (cols.length > 1 && $(cols[1]).text().trim().toLowerCase().includes("sector")) {
            const values = $(row).find("td");
            sector = $(values[1]).text().trim();
        }

        if (cols.length > 1 && $(cols[0]).text().trim().toLowerCase().includes("authorized capital (mn)")) {
            const values = $(row).find("td");
            authorizedCapitalInMillion = parseFloat($(values[0]).text().trim().replace(",", ""));
        }

        if (cols.length > 1 && $(cols[0]).text().trim().toLowerCase().includes("paid-up capital (mn)")) {
            const values = $(row).find("td");
            paidUpCapitalInMillion = parseFloat($(values[0]).text().trim().replace(",", ""));
        }

        if (cols.length > 1 && $(cols[0]).text().trim().toLowerCase().includes("total no. of outstanding securities")) {
            const values = $(row).find("td");
            shareCount = parseFloat($(values[0]).text().trim().replace(/,/g, ''));
        }
    });

    return {
        sector,
        authorizedCapitalInMillion,
        paidUpCapitalInMillion,
        shareCount
    };
}

function getPriceInfo($: cheerio.Root, priceInfoTable: cheerio.Cheerio): PriceInfo {
    let lastTradingPrice = 0;
    let movingRangeFor52Weeks = { min: 0, max: 0 };

    priceInfoTable.find("tbody tr").each((_index, row) => {
        const headers = $(row).find("th");
        const cols = $(row).find("td");

        if (headers.length > 1 && $(headers[0]).text().trim().toLowerCase().includes("last trading price")) {
            lastTradingPrice = parseFloat($(cols[0]).text().trim().replace(/,/g, ''));
        }

        if (headers.length > 0 && $(headers[0]).text().trim().toLowerCase().includes("52 weeks")) {
            const rangeText = $(cols[1]).text().trim();
            const rangeParts = rangeText.split("-");
            if (rangeParts.length === 2) {
                movingRangeFor52Weeks.min = parseFloat(rangeParts[0].trim().replace(/,/g, ''));
                movingRangeFor52Weeks.max = parseFloat(rangeParts[1].trim().replace(/,/g, ''));
            }
        }
    });

    return {
        lastTradingPrice,
        movingRangeFor52Weeks
    };
}

function getFinancialPerformance($: cheerio.Root, financialPerformanceTable: cheerio.Cheerio): FinancialPerformance[] {
    let financialPerformance: FinancialPerformance[] = [];

    financialPerformanceTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("td");

        if (cols.length > 12) {
            const year = parseInt($(cols[0]).text().trim());
            
            if(!isNaN(year)) {
                const profitInMillion = parseFloat($(cols[11]).text().trim().replace(/,/g, ''));
                const originalEarningsPerShare = parseFloat($(cols[4]).text().trim().replace(/,/g, ''));
                const restatedEarningsPerShare = parseFloat($(cols[5]).text().trim().replace(/,/g, ''));
                const dilutedEarningsPerShare = parseFloat($(cols[6]).text().trim().replace(/,/g, ''));
                const originalNAVPerShare = parseFloat($(cols[7]).text().trim().replace(/,/g, ''));
                const restatedNAVPerShare = parseFloat($(cols[8]).text().trim().replace(/,/g, ''));
                const dilutedNAVPerShare = parseFloat($(cols[9]).text().trim().replace(/,/g, ''));
                const earningsPerShare = isNaN(dilutedEarningsPerShare) ?
                    isNaN(restatedEarningsPerShare) ? originalEarningsPerShare : restatedEarningsPerShare :
                    dilutedEarningsPerShare;
                const navPerShare = isNaN(dilutedNAVPerShare) ?
                    isNaN(restatedNAVPerShare) ? originalNAVPerShare : restatedNAVPerShare :
                    dilutedNAVPerShare;
                
                financialPerformance.push({
                    year,
                    profitInMillion: isNaN(profitInMillion) ? 0 : profitInMillion,
                    earningsPerShare: isNaN(earningsPerShare) ? 0 : earningsPerShare,
                    NAVPerShare: isNaN(navPerShare) ? 0 : navPerShare
                });
            }
        }
    });

    return financialPerformance;
    
}

function getOtherInfo($: cheerio.Root, otherInfoTable: cheerio.Cheerio): OtherInfo {
    let listingYear = 0;
    let marketCategory = "";
    let shareHoldingParcentages: OtherInfo["shareHoldingParcentages"] = [];

    otherInfoTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("td");

        if (cols.length > 1 && $(cols[0]).text().trim().toLowerCase().includes("listing year")) {
            listingYear = parseInt($(cols[1]).text().trim());
        }

        if (cols.length > 1 && $(cols[0]).text().trim().toLowerCase().includes("market category")) {
            marketCategory = $(cols[1]).text().trim();
        }

        if (cols.length > 1 && $(cols[0]).text().trim().toLowerCase().includes("share holding percentage")) {
            const fullText = $(cols[0]).text().trim();
            const dateMatch = fullText.match(/\[as on ([^\](\)]+)/);
            const extractedDate = dateMatch ? dateMatch[1].trim() : "";
            
            const dataCells = $(cols[1]).find("td");
            if (dataCells.length === 5) {
                // Extract text and parse percentage values
                // Each cell has format like "Sponsor/Director:<br>33.04"
                const parsePercentage = (cellIndex: number) => {
                    const cellText = $(dataCells[cellIndex]).text().trim();
                    // Split by colon and take the last part (the number)
                    const parts = cellText.split(':');
                    const numberPart = parts[parts.length - 1].trim();
                    return parseFloat(numberPart);
                };

                shareHoldingParcentages.push({
                    date: extractedDate,
                    sponsorOrDirector: parsePercentage(0), // Sponsor/Director
                    government: parsePercentage(1),        // Govt
                    institution: parsePercentage(2),       // Institute
                    foreign: parsePercentage(3),           // Foreign
                    publicShares: parsePercentage(4)       // Public
                });
            }
        }
    });

    return {
        listingYear,
        marketCategory,
        shareHoldingParcentages
    };
}

function getUnauditedPERatio($: cheerio.Root, peRatioTable: cheerio.Cheerio): number {
    let dilutedEpsPeRatio = 0;
        let basicEpsPeRatio = 0;
    peRatioTable.find("tbody tr").each((_index, row) => {
        const cols = $(row).find("td");
        
        if(cols.length > 0 && $(cols[0]).text().trim().toLowerCase().includes("current p/e ratio using diluted eps")) {
            dilutedEpsPeRatio = parseFloat($(cols[6]).text().trim());
        } 
        
        if (cols.length > 0 && $(cols[0]).text().trim().toLowerCase().includes("current p/e ratio using basic eps")) {
            basicEpsPeRatio = parseFloat($(cols[6]).text().trim());
        }
    });

    const unauditedPERatio = !dilutedEpsPeRatio || isNaN(dilutedEpsPeRatio) ?
        (isNaN(basicEpsPeRatio) ? 0 : basicEpsPeRatio) :
        dilutedEpsPeRatio;

    return isNaN(unauditedPERatio) ? 0 : unauditedPERatio;
}

export function getCompanyData($: cheerio.Root): CompanyData {
    const tablesToFind: { [key: string]: {
        table: cheerio.Cheerio,
        textInTable: string
    } } = {
        dividendTable: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Dividend in %*"
        },
        loanTable: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Short-term loan (mn)"
        },
        reserveAndIncomeTable: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Reserve & Surplus without OCI (mn)"
        },
        metadata: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Authorized Capital (mn)"
        },
        priceInfo: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Last Trading Price"
        },
        financialPerformance: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Profit for the year"
        },
        otherInfo: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Listing Year"
        },
        peRatio: {
            table: cheerio.load('<table></table>')('table'),
            textInTable: "Current P/E Ratio using Basic EPS"
        }
    };

  
    // Find the table that contains the `textInTable` and assign it to the corresponding key
    $("table").each((_index, table) => {
        const tableText = $(table).text();
        Object.keys(tablesToFind).forEach((key) => {
            if (tableText.includes(tablesToFind[key].textInTable)) {
                tablesToFind[key].table = $(table);
            }
        });
    });

    const dividends = getDividendData($, tablesToFind.dividendTable.table);
    const loans = getLoanData($, tablesToFind.loanTable.table);
    const reserveAndIncome = getReserveAndIncome($, tablesToFind.reserveAndIncomeTable.table);
    const metadata = getMetadata($, tablesToFind.metadata.table);
    const priceInfo = getPriceInfo($, tablesToFind.priceInfo.table);
    const financialPerformance = getFinancialPerformance($, tablesToFind.financialPerformance.table);
    const otherInfo = getOtherInfo($, tablesToFind.otherInfo.table);
    const unauditedPERatio = getUnauditedPERatio($, tablesToFind.peRatio.table);

    return { dividends, loans, reserveAndIncome, metadata, priceInfo, financialPerformance, otherInfo, unauditedPERatio };
}