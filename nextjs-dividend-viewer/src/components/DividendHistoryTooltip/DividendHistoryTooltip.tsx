import { Company } from '@/types/Company';
import React from 'react';
import SmartTooltip from '../SmartTooltip/SmartTooltip';
import './DividendHistoryTooltip.css';

interface DividendHistoryTooltipProps {
  company: Company;
  totalDividends: number;
}

const DividendHistoryTooltip: React.FC<DividendHistoryTooltipProps> = ({ company, totalDividends }) => {
  const sortedDividends = [...company.dividends].sort((a, b) => b.year - a.year); // Most recent first

  const tooltipContent = (
    <>
      <div className="tooltip-header">
        {company.name} - Dividend History
      </div>
      <div className="tooltip-content">
        {sortedDividends.length === 0 ? (
          <div className="no-dividends">No dividend history available</div>
        ) : (
          <div className="dividend-years">
            {sortedDividends.map((dividend) => (
              <div key={dividend.year} className="dividend-year-row">
                <span className="year">{dividend.year}</span>
                <div className="dividend-details">
                  <span className="cash-dividend">
                    Cash: {dividend.cashDividend}%
                  </span>
                  <span className="stock-dividend">
                    Stock: {dividend.stockDividend}%
                  </span>
                  <span className="total-year">
                    Total: {dividend.cashDividend + dividend.stockDividend}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="summary-row">
          <span className="summary-label">Total Historical:</span>
          <span className="summary-value">{totalDividends}%</span>
        </div>
      </div>
    </>
  );

  return (
    <SmartTooltip tooltip={tooltipContent} maxWidth={320}>
      <span className="total-dividends-value">{totalDividends}%</span>
    </SmartTooltip>
  );
};

export default DividendHistoryTooltip;
