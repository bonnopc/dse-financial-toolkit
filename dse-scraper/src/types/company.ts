export interface Dividend {
    year: number;
    cashDividend: number;
    stockDividend: number;
}

export interface CompanyMetadata {
    sector: string;
    authorizedCapitalInMillion: number;
    paidUpCapitalInMillion: number;
    shareCount: number;
}

export interface CompanyInfo {
    name: string;
    fullName?: string;
    dividends: Dividend[];
    loans: CompanyLoan;
    reserveAndIncome: ReserveAndIncome;
    metadata: CompanyMetadata;
    priceInfo: PriceInfo;
    financialPerformance: FinancialPerformance[];
    otherInfo: OtherInfo;
    unauditedPERatio: number;
}

export interface CompanyLoan {
    shortTermMillion: number;
    longTermMillion: number;
    dateUpdated: string;
}

export interface ReserveAndIncome {
    reserveInMillion: number;
    ociInMillion: number;
}

export interface FinancialPerformance {
    year: number;
    profitInMillion: number;
    earningsPerShare: number;
    NAVPerShare: number;
}

export interface OtherInfo {
    listingYear: number;
    marketCategory: string;
    shareHoldingParcentages: {
        date: string;
        publicShares: number;
        sponsorOrDirector: number;
        government: number;
        foreign: number;
        institution: number;
    }[];
}

export interface PriceInfo {
    lastTradingPrice: number;
    movingRangeFor52Weeks: {
        min: number;
        max: number;
    };
}