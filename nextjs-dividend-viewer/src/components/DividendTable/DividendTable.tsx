import { Company } from '@/types/Company';
import { calculateFinancialScore } from '@/utils/financialScoring';
import React, { useMemo, useState } from 'react';
import DividendHistoryTooltip from '../DividendHistoryTooltip/DividendHistoryTooltip';
import FinancialScoreCell from '../FinancialScoreCell/FinancialScoreCell';
import './DividendTable.css';

interface DividendTableProps {
  companies: Company[];
}

type SortField =
  | 'name'
  | 'sector'
  | 'year'
  | 'cashDividend'
  | 'stockDividend'
  | 'totalDividends'
  | 'paidUpCapital'
  | 'shareCount'
  | 'shortTermLoan'
  | 'longTermLoan'
  | 'totalLoan'
  | 'reserve'
  | 'financialScore'
  | 'lastTradingPrice'
  | 'dividendYield'
  | 'pricePosition'
  | 'peRatio'
  | 'latestProfit'
  | 'latestEPS'
  | 'latestNAV';
type SortDirection = 'asc' | 'desc';

const DividendTable: React.FC<DividendTableProps> = ({ companies }) => {
  const [sortField, setSortField] = useState<SortField>('financialScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getLatestDividend = (company: Company) => {
    if (company.dividends.length === 0) {
      return { year: 0, cashDividend: 0, stockDividend: 0 };
    }
    const latest = company.dividends.reduce((prev, current) =>
      prev.year > current.year ? prev : current
    );
    return latest;
  };

  const getTotalDividends = (company: Company) => {
    return company.dividends.reduce(
      (total, dividend) =>
        total + dividend.cashDividend + dividend.stockDividend,
      0
    );
  };

  const getTotalLoan = (company: Company) => {
    return company.loans.shortTermMillion + company.loans.longTermMillion;
  };

  const getLatestFinancialPerformance = (company: Company) => {
    if (
      !company.financialPerformance ||
      company.financialPerformance.length === 0
    ) {
      return null;
    }

    // Sort by year to get the latest performance data
    const sortedPerformance = [...company.financialPerformance].sort(
      (a, b) => b.year - a.year
    );
    return sortedPerformance[0];
  };

  // Helper function to safely convert values to numbers
  const safeToNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  const getFinancialPerformanceChange = (
    company: Company,
    field: 'profitInMillion' | 'earningsPerShare' | 'NAVPerShare'
  ) => {
    const performances = company.financialPerformance;
    if (!performances || performances.length < 2) {
      const latest = getLatestFinancialPerformance(company);
      const currentValue = latest ? latest[field] : 0;
      return {
        current: safeToNumber(currentValue),
        change: 0,
        changePercent: 0,
      };
    }

    // Sort by year to get latest and previous
    const sortedPerformances = [...performances].sort(
      (a, b) => b.year - a.year
    );
    const latest = sortedPerformances[0];
    const previous = sortedPerformances[1];

    const currentValue = safeToNumber(latest[field]);
    const previousValue = safeToNumber(previous[field]);
    const change = currentValue - previousValue;
    const changePercent =
      previousValue !== 0 ? (change / previousValue) * 100 : 0;

    return { current: currentValue, change, changePercent };
  };

  const FinancialPerformanceCell: React.FC<{
    company: Company;
    field: 'profitInMillion' | 'earningsPerShare' | 'NAVPerShare';
    suffix?: string;
  }> = ({ company, field, suffix = '' }) => {
    const data = getFinancialPerformanceChange(company, field);

    if (data.current === 0 && data.change === 0) {
      return <span>N/A</span>;
    }

    const changeClass =
      data.changePercent > 0
        ? 'financial-increase'
        : data.changePercent < 0
          ? 'financial-decrease'
          : 'financial-neutral';

    const displayValue =
      field === 'profitInMillion'
        ? safeToNumber(data.current).toLocaleString()
        : safeToNumber(data.current).toFixed(2);

    return (
      <span>
        {displayValue}
        {suffix}
        {data.change !== 0 && (
          <small className={changeClass}>
            {' '}
            ({data.changePercent > 0 ? '+' : ''}
            {safeToNumber(data.changePercent).toFixed(1)}%)
          </small>
        )}
      </span>
    );
  };

  const getCurrentDividendYield = (company: Company) => {
    if (
      company.dividends.length === 0 ||
      !company.priceInfo?.lastTradingPrice ||
      parseFloat(company.priceInfo.lastTradingPrice) <= 0
    ) {
      return 0;
    }

    // Sort dividends by year to get the truly latest dividend
    const sortedDividends = [...company.dividends].sort(
      (a, b) => b.year - a.year
    );
    const latestDividend = sortedDividends[0];

    // Convert dividend percentage to actual taka amount (face value is 10 taka)
    const latestCashDividendPercentage = latestDividend.cashDividend;
    const latestCashDividendAmount = (latestCashDividendPercentage / 100) * 10; // Face value is 10 taka

    // Calculate actual dividend yield as percentage (dividend amount in taka / share price * 100)
    return (
      (latestCashDividendAmount /
        parseFloat(company.priceInfo.lastTradingPrice)) *
      100
    );
  };

  const getPricePosition = (company: Company) => {
    if (
      !company.priceInfo?.lastTradingPrice ||
      !company.priceInfo?.movingRangeFor52Weeks ||
      (company.priceInfo.movingRangeFor52Weeks.min === 0 &&
        company.priceInfo.movingRangeFor52Weeks.max === 0)
    ) {
      return 0;
    }

    const currentPrice = parseFloat(company.priceInfo.lastTradingPrice);
    const min52Week = company.priceInfo.movingRangeFor52Weeks.min;
    const max52Week = company.priceInfo.movingRangeFor52Weeks.max;

    if (max52Week <= min52Week) return 0;

    return ((currentPrice - min52Week) / (max52Week - min52Week)) * 100;
  };

  const getPricePositionClass = (position: number) => {
    if (position <= 25) return 'price-position-excellent'; // Near low
    if (position <= 40) return 'price-position-good';
    if (position <= 60) return 'price-position-average';
    if (position <= 75) return 'price-position-poor';
    return 'price-position-very-poor'; // Near high
  };

  const get52WeekRange = (company: Company) => {
    if (
      !company.priceInfo?.movingRangeFor52Weeks ||
      (company.priceInfo.movingRangeFor52Weeks.min === 0 &&
        company.priceInfo.movingRangeFor52Weeks.max === 0)
    ) {
      return 'N/A';
    }
    const min = company.priceInfo.movingRangeFor52Weeks.min;
    const max = company.priceInfo.movingRangeFor52Weeks.max;
    return `৳${min.toFixed(2)} - ৳${max.toFixed(2)}`;
  };

  const getLatestShareholding = (company: Company) => {
    if (
      !company.otherInfo?.shareHoldingParcentages ||
      company.otherInfo.shareHoldingParcentages.length === 0
    ) {
      return null;
    }

    // Sort by date to get the latest one (assuming dates are in a comparable format)
    const sortedShares = [...company.otherInfo.shareHoldingParcentages].sort(
      (a, b) => {
        // Convert dates to Date objects for proper comparison
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      }
    );

    return sortedShares[0];
  };

  const getShareholdingChange = (
    company: Company,
    field:
      | 'sponsorOrDirector'
      | 'government'
      | 'institution'
      | 'foreign'
      | 'publicShares'
  ) => {
    const shares = company.otherInfo?.shareHoldingParcentages;
    // Check if we have no data or empty array
    if (!shares || shares.length === 0) {
      return {
        current: 0,
        change: 0,
        changePercent: 0,
      };
    }

    if (shares.length < 2) {
      const latest = getLatestShareholding(company);
      return {
        current: latest ? latest[field] : 0,
        change: 0,
        changePercent: 0,
      };
    }

    // Sort by date to get latest and previous
    const sortedShares = [...shares].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    const latest = sortedShares[0];
    const previous = sortedShares[1];

    const currentValue = latest[field];
    const previousValue = previous[field];
    const change = currentValue - previousValue;
    const changePercent =
      previousValue !== 0 ? (change / previousValue) * 100 : 0;

    return { current: currentValue, change, changePercent };
  };

  const ShareholdingCell: React.FC<{
    company: Company;
    field:
      | 'sponsorOrDirector'
      | 'government'
      | 'institution'
      | 'foreign'
      | 'publicShares';
  }> = ({ company, field }) => {
    const data = getShareholdingChange(company, field);

    if (data.current === 0 && data.change === 0) {
      return <span>N/A</span>;
    }

    const changeClass =
      data.changePercent > 0
        ? 'shareholding-increase'
        : data.changePercent < 0
          ? 'shareholding-decrease'
          : 'shareholding-neutral';

    return (
      <span>
        {data.current.toFixed(2)}%
        {data.change !== 0 && (
          <small className={changeClass}>
            {' '}
            ({data.changePercent > 0 ? '+' : ''}
            {data.changePercent.toFixed(1)}%)
          </small>
        )}
      </span>
    );
  };

  // Calculate financial scores for all companies
  const companiesWithScores = useMemo(() => {
    // First, ensure we don't have duplicate companies
    const uniqueCompanies = companies.filter(
      (company, index, self) =>
        index === self.findIndex((c) => c.name === company.name)
    );

    return uniqueCompanies.map((company) => {
      try {
        return {
          ...company,
          financialScore: calculateFinancialScore(company, companies),
        };
      } catch (error) {
        console.warn(`Error calculating score for ${company.name}:`, error);
        return {
          ...company,
          financialScore: {
            overall: 0,
            grade: 'F' as const,
            color: 'gray' as const,
            breakdown: {
              debtScore: 0,
              reserveScore: 0,
              dividendConsistencyScore: 0,
              dividendYieldScore: 0,
              priceValuationScore: 0,
              financialPerformanceScore: 0,
              shareholdingQualityScore: 0,
              peRatioScore: 0,
            },
          },
        };
      }
    });
  }, [companies]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'financialScore' ? 'desc' : 'asc'); // Default desc for health score
    }
  };

  const sortedCompanies = useMemo(() => {
    // Create a stable copy to avoid mutation issues
    const companiesToSort = companiesWithScores.slice();

    const sorted = companiesToSort.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          // String comparison for names
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);

        case 'sector':
          aValue = a.metadata.sector;
          bValue = b.metadata.sector;
          // String comparison for sectors
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);

        case 'year':
          aValue = getLatestDividend(a).year;
          bValue = getLatestDividend(b).year;
          break;

        case 'cashDividend':
          aValue = getLatestDividend(a).cashDividend;
          bValue = getLatestDividend(b).cashDividend;
          break;

        case 'stockDividend':
          aValue = getLatestDividend(a).stockDividend;
          bValue = getLatestDividend(b).stockDividend;
          break;

        case 'totalDividends':
          aValue = getTotalDividends(a);
          bValue = getTotalDividends(b);
          break;

        case 'paidUpCapital':
          aValue = a.metadata.paidUpCapitalInMillion;
          bValue = b.metadata.paidUpCapitalInMillion;
          break;

        case 'shareCount':
          aValue = a.metadata.shareCount ?? 0;
          bValue = b.metadata.shareCount ?? 0;
          break;

        case 'shortTermLoan':
          aValue = a.loans.shortTermMillion;
          bValue = b.loans.shortTermMillion;
          break;

        case 'longTermLoan':
          aValue = a.loans.longTermMillion;
          bValue = b.loans.longTermMillion;
          break;

        case 'totalLoan':
          aValue = getTotalLoan(a);
          bValue = getTotalLoan(b);
          break;

        case 'reserve':
          aValue = a.reserveAndIncome.reserveInMillion;
          bValue = b.reserveAndIncome.reserveInMillion;
          break;

        case 'financialScore':
          aValue = a.financialScore?.overall ?? 0;
          bValue = b.financialScore?.overall ?? 0;
          // Explicit numerical comparison for financial scores
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;

        case 'lastTradingPrice':
          aValue = parseFloat(a.priceInfo?.lastTradingPrice || '0');
          bValue = parseFloat(b.priceInfo?.lastTradingPrice || '0');
          break;

        case 'dividendYield':
          aValue = getCurrentDividendYield(a);
          bValue = getCurrentDividendYield(b);
          break;

        case 'pricePosition':
          aValue = getPricePosition(a);
          bValue = getPricePosition(b);
          break;

        case 'peRatio':
          aValue = a.unauditedPERatio ?? 0;
          bValue = b.unauditedPERatio ?? 0;
          break;

        case 'latestProfit':
          aValue = getFinancialPerformanceChange(a, 'profitInMillion').current;
          bValue = getFinancialPerformanceChange(b, 'profitInMillion').current;
          break;

        case 'latestEPS':
          aValue = getFinancialPerformanceChange(a, 'earningsPerShare').current;
          bValue = getFinancialPerformanceChange(b, 'earningsPerShare').current;
          break;

        case 'latestNAV':
          aValue = getFinancialPerformanceChange(a, 'NAVPerShare').current;
          bValue = getFinancialPerformanceChange(b, 'NAVPerShare').current;
          break;

        default:
          aValue = a.name;
          bValue = b.name;
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
      }

      // Numerical comparison for all other fields
      const numA = Number(aValue) || 0;
      const numB = Number(bValue) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [companiesWithScores, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <th onClick={() => handleSort(field)} className="sortable-header">
      {children} <span className="sort-icon">{getSortIcon(field)}</span>
    </th>
  );

  return (
    <div className="table-container">
      <div className="table-scroll-wrapper">
        <table className="dividend-table">
          <thead>
            <tr>
              <SortableHeader field="name">Company Code</SortableHeader>
              <th>Full Name</th>
              <SortableHeader field="sector">Sector</SortableHeader>
              <SortableHeader field="financialScore">
                Health Score
              </SortableHeader>
              <SortableHeader field="lastTradingPrice">
                Last Trading Price (৳)
              </SortableHeader>
              <th>52-Week Range (৳)</th>
              <SortableHeader field="pricePosition">
                Price Position (%)
              </SortableHeader>
              <SortableHeader field="dividendYield">
                Dividend Yield (%)
              </SortableHeader>
              <SortableHeader field="peRatio">P/E Ratio</SortableHeader>
              <SortableHeader field="latestProfit">
                Latest Profit (M)
              </SortableHeader>
              <SortableHeader field="latestEPS">Latest EPS (৳)</SortableHeader>
              <SortableHeader field="latestNAV">Latest NAV (৳)</SortableHeader>
              <SortableHeader field="year">Latest Year</SortableHeader>
              <SortableHeader field="cashDividend">
                Latest Cash Dividend (%)
              </SortableHeader>
              <SortableHeader field="stockDividend">
                Latest Stock Dividend (%)
              </SortableHeader>
              <SortableHeader field="totalDividends">
                Total Historical Dividends
              </SortableHeader>
              <SortableHeader field="shortTermLoan">
                Short Term Loan (M)
              </SortableHeader>
              <SortableHeader field="longTermLoan">
                Long Term Loan (M)
              </SortableHeader>
              <SortableHeader field="totalLoan">Total Loan (M)</SortableHeader>
              <SortableHeader field="reserve">Reserve (M)</SortableHeader>
              <SortableHeader field="paidUpCapital">
                Paid Up Capital (M)
              </SortableHeader>
              <SortableHeader field="shareCount">Share Count</SortableHeader>
              <th>Sponsor/Director (%)</th>
              <th>Government (%)</th>
              <th>Institution (%)</th>
              <th>Foreign (%)</th>
              <th>Public Shares (%)</th>
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.map((company, index) => {
              const latestDividend = getLatestDividend(company);
              const totalDividends = getTotalDividends(company);
              const totalLoan = getTotalLoan(company);

              return (
                <tr
                  key={company.name}
                  className={index % 2 === 0 ? 'even-row' : 'odd-row'}
                >
                  <td className="company-code">{company.name}</td>
                  <td className="company-name">{company.fullName}</td>
                  <td className="sector">{company.metadata.sector}</td>
                  <td className="financial-score-cell">
                    <FinancialScoreCell
                      score={company.financialScore}
                      companyName={company.name}
                    />
                  </td>
                  <td className="price-value">
                    ৳
                    {company.priceInfo?.lastTradingPrice
                      ? parseFloat(company.priceInfo.lastTradingPrice).toFixed(
                          2
                        )
                      : 'N/A'}
                  </td>
                  <td className="range-52week">{get52WeekRange(company)}</td>
                  <td
                    className={`price-position ${getPricePositionClass(getPricePosition(company))}`}
                  >
                    <div className="price-position-container">
                      <div className="price-position-bar">
                        <div
                          className="price-position-indicator"
                          style={{
                            left: `${Math.min(100, Math.max(0, getPricePosition(company)))}%`,
                          }}
                        ></div>
                      </div>
                      <span className="price-position-text">
                        {getPricePosition(company) > 0
                          ? `${getPricePosition(company).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`dividend-yield-value ${(() => {
                      const yield_ = getCurrentDividendYield(company);
                      if (yield_ <= 0) return 'yield-none';
                      if (yield_ >= 8) return 'yield-excellent';
                      if (yield_ >= 5) return 'yield-good';
                      if (yield_ >= 3) return 'yield-average';
                      if (yield_ >= 1) return 'yield-poor';
                      return 'yield-very-poor';
                    })()}`}
                  >
                    {(() => {
                      const yield_ = getCurrentDividendYield(company);
                      return yield_ > 0 ? `${yield_.toFixed(2)}%` : 'N/A';
                    })()}
                  </td>
                  <td
                    className={`pe-ratio-value ${(() => {
                      const peRatio = company.unauditedPERatio;
                      if (!peRatio || peRatio <= 0) return 'pe-none';
                      if (peRatio <= 10) return 'pe-excellent';
                      if (peRatio <= 15) return 'pe-good';
                      if (peRatio <= 20) return 'pe-average';
                      if (peRatio <= 30) return 'pe-poor';
                      return 'pe-very-poor';
                    })()}`}
                  >
                    {company.unauditedPERatio
                      ? company.unauditedPERatio.toFixed(2)
                      : 'N/A'}
                  </td>
                  <td className="financial-performance-value">
                    <FinancialPerformanceCell
                      company={company}
                      field="profitInMillion"
                      suffix="M"
                    />
                  </td>
                  <td className="financial-performance-value">
                    <FinancialPerformanceCell
                      company={company}
                      field="earningsPerShare"
                      suffix="৳"
                    />
                  </td>
                  <td className="financial-performance-value">
                    <FinancialPerformanceCell
                      company={company}
                      field="NAVPerShare"
                      suffix="৳"
                    />
                  </td>
                  <td>{latestDividend.year || 'N/A'}</td>
                  <td className="dividend-value">
                    {latestDividend.cashDividend}%
                  </td>
                  <td className="dividend-value">
                    {latestDividend.stockDividend}%
                  </td>
                  <td className="total-dividends">
                    <DividendHistoryTooltip
                      company={company}
                      totalDividends={totalDividends}
                    />
                  </td>
                  <td className="loan-value">
                    {company.loans.shortTermMillion.toLocaleString()}
                  </td>
                  <td className="loan-value">
                    {company.loans.longTermMillion.toLocaleString()}
                  </td>
                  <td className="loan-value total-loan">
                    {totalLoan.toLocaleString()}
                  </td>
                  <td className="reserve-value">
                    {company.reserveAndIncome.reserveInMillion.toLocaleString()}
                  </td>
                  <td className="capital">
                    {company.metadata.paidUpCapitalInMillion.toLocaleString()}
                  </td>
                  <td className="share-count">
                    {company.metadata.shareCount
                      ? company.metadata.shareCount.toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="shareholding-value">
                    <ShareholdingCell
                      company={company}
                      field="sponsorOrDirector"
                    />
                  </td>
                  <td className="shareholding-value">
                    <ShareholdingCell company={company} field="government" />
                  </td>
                  <td className="shareholding-value">
                    <ShareholdingCell company={company} field="institution" />
                  </td>
                  <td className="shareholding-value">
                    <ShareholdingCell company={company} field="foreign" />
                  </td>
                  <td className="shareholding-value">
                    <ShareholdingCell company={company} field="publicShares" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DividendTable;
