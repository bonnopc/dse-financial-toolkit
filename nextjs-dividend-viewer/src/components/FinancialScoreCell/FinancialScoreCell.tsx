import { FinancialScore } from '@/utils/financialScoring';
import React from 'react';
import SmartTooltip from '../SmartTooltip/SmartTooltip';
import './FinancialScoreCell.css';

interface FinancialScoreCellProps {
  score: FinancialScore;
  companyName: string;
}

const FinancialScoreCell: React.FC<FinancialScoreCellProps> = ({
  score,
  companyName,
}) => {
  const tooltipContent = (
    <>
      <div className="tooltip-header">
        {companyName} - Financial Health Breakdown
      </div>
      <div className="tooltip-content">
        <div className="score-item">
          <span className="score-label">Debt Management (10%):</span>
          <span className="score-value">{score.breakdown.debtScore}/100</span>
        </div>
        <div className="score-item">
          <span className="score-label">Reserve Strength (10%):</span>
          <span className="score-value">
            {score.breakdown.reserveScore}/100
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">Dividend Consistency (15%):</span>
          <span className="score-value">
            {score.breakdown.dividendConsistencyScore}/100
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">Dividend Yield (10%):</span>
          <span className="score-value">
            {score.breakdown.dividendYieldScore}/100
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">Price Valuation (10%):</span>
          <span className="score-value">
            {score.breakdown.priceValuationScore}/100
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">PE Ratio (10%):</span>
          <span className="score-value">
            {score.breakdown.peRatioScore}/100
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">EPS Performance (25%):</span>
          <span className="score-value">
            {score.breakdown.financialPerformanceScore}/100
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">Shareholding Quality (10%):</span>
          <span className="score-value">
            {score.breakdown.shareholdingQualityScore}/100
          </span>
        </div>
        <div className="score-total">
          <span className="score-label">Overall Score:</span>
          <span className="score-value">{score.overall}/100</span>
        </div>
        <div className="score-note">
          <small>
            8-factor analysis.
            <br />
            Higher = better.
          </small>
        </div>
      </div>
    </>
  );

  return (
    <SmartTooltip tooltip={tooltipContent} maxWidth={280}>
      <div className={`financial-score score-${score.color}`}>
        <span className="score-grade">{score.grade}</span>
        <span className="score-number">{score.overall}</span>
      </div>
    </SmartTooltip>
  );
};

export default FinancialScoreCell;
