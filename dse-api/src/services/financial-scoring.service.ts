import { Injectable } from '@nestjs/common';
import { CompanyWithScore, FinancialScore, FinancialScoreBreakdown } from '../types/financial-score.types';

@Injectable()
export class FinancialScoringService {
  
  /**
   * Calculate financial score for a single company
   */
  calculateFinancialScore(company: CompanyWithScore): FinancialScore {
    // Handle potential null/undefined values
    const paidUpCapital = company.paid_up_capital_million || 1; // Avoid division by zero
    const shortTermLoan = company.short_term_million || 0;
    const longTermLoan = company.long_term_million || 0;
    const reserveAmount = company.reserve_million || 0;
    
    // 1. Debt Score (10% weight) - Lower debt is better
    const totalLoan = shortTermLoan + longTermLoan;
    const debtToCapitalRatio = totalLoan / paidUpCapital;
    let debtScore = 0;
    if (debtToCapitalRatio <= 0.2) debtScore = 100;
    else if (debtToCapitalRatio <= 0.5) debtScore = 80;
    else if (debtToCapitalRatio <= 1.0) debtScore = 60;
    else if (debtToCapitalRatio <= 2.0) debtScore = 40;
    else debtScore = 20;

    // 2. Reserve Score (10% weight) - Higher reserves relative to capital is better
    const reserveToCapitalRatio = reserveAmount / paidUpCapital;
    let reserveScore = 0;
    if (reserveToCapitalRatio >= 2.0) reserveScore = 100;
    else if (reserveToCapitalRatio >= 1.0) reserveScore = 80;
    else if (reserveToCapitalRatio >= 0.5) reserveScore = 60;
    else if (reserveToCapitalRatio >= 0) reserveScore = 40;
    else reserveScore = 20; // Negative reserves

    // 3. Dividend Consistency Score (15% weight)
    const dividends = company.dividends || [];
    let dividendConsistencyScore = 0;
    
    // Helper function to calculate weighted dividend (cash dividends get full weight, stock dividends get 30% weight)
    const getWeightedDividend = (cashDiv: number, stockDiv: number) => 
      cashDiv + (stockDiv * 0.3);
    
    if (dividends.length === 0) {
      dividendConsistencyScore = 0;
    } else {
      // Factor 1: Payment Frequency (40% of consistency score)
      const nonZeroDividends = dividends.filter(d => getWeightedDividend(d.cash_dividend, d.stock_dividend) > 0);
      const paymentFrequency = nonZeroDividends.length / dividends.length;
      let frequencyScore = paymentFrequency * 100;
      
      // Factor 2: Payment Stability (30% of consistency score)
      const totalDividends = dividends.map(d => getWeightedDividend(d.cash_dividend, d.stock_dividend));
      const avgDividend = totalDividends.reduce((sum, div) => sum + div, 0) / totalDividends.length;
      
      let stabilityScore = 0;
      if (avgDividend > 0) {
        const variance = totalDividends.reduce((sum, div) => sum + Math.pow(div - avgDividend, 2), 0) / totalDividends.length;
        const coefficientOfVariation = Math.sqrt(variance) / avgDividend;
        // Lower coefficient of variation = higher stability
        stabilityScore = Math.max(0, 100 - (coefficientOfVariation * 100));
      }
      
      // Factor 3: Recent Trend (30% of consistency score) - Are dividends improving/maintained?
      let trendScore = 50; // Default neutral score
      if (dividends.length >= 3) {
        const recent3Years = dividends.slice(-3).map(d => getWeightedDividend(d.cash_dividend, d.stock_dividend));
        const older3Years = dividends.slice(-6, -3).map(d => getWeightedDividend(d.cash_dividend, d.stock_dividend));
        
        if (older3Years.length > 0) {
          const recentAvg = recent3Years.reduce((sum, div) => sum + div, 0) / recent3Years.length;
          const olderAvg = older3Years.reduce((sum, div) => sum + div, 0) / older3Years.length;
          
          if (recentAvg > olderAvg * 1.1) trendScore = 100; // Improving trend
          else if (recentAvg >= olderAvg * 0.9) trendScore = 80; // Stable trend
          else if (recentAvg >= olderAvg * 0.7) trendScore = 60; // Slight decline
          else if (recentAvg >= olderAvg * 0.5) trendScore = 40; // Moderate decline
          else trendScore = 20; // Significant decline
        }
      }
      
      // Weighted combination of all factors
      dividendConsistencyScore = (frequencyScore * 0.4) + (stabilityScore * 0.3) + (trendScore * 0.3);
      
      // Bonus for companies that have paid dividends for 4+ consecutive years
      if (dividends.length >= 4) {
        const lastFourYears = dividends.slice(-4);
        const consecutiveDividends = lastFourYears.every(d => getWeightedDividend(d.cash_dividend, d.stock_dividend) > 0);
        if (consecutiveDividends) {
          dividendConsistencyScore = Math.min(100, dividendConsistencyScore * 1.1); // 10% bonus
        }
      }
    }

    // 4. Dividend Yield Score (10% weight) - Based on actual dividend yield (dividend/price ratio)
    let dividendYieldScore = 0;
    if (dividends.length > 0 && company.last_trading_price && company.last_trading_price > 0) {
      // Sort dividends by year to get the truly latest dividend
      const sortedDividends = [...dividends].sort((a, b) => b.year - a.year);
      const latestDividend = sortedDividends[0];
      
      // Convert dividend percentage to actual taka amount (face value is 10 taka)
      const latestCashDividendPercentage = latestDividend.cash_dividend;
      const latestCashDividendAmount = (latestCashDividendPercentage / 100) * 10; // Face value is 10 taka
      
      // Calculate actual dividend yield as percentage (dividend amount in taka / share price * 100)
      const dividendYield = (latestCashDividendAmount / company.last_trading_price) * 100;
      
      if (dividendYield >= 8) dividendYieldScore = 100;        // Excellent yield: 8%+
      else if (dividendYield >= 5) dividendYieldScore = 80;    // Good yield: 5-8%
      else if (dividendYield >= 3) dividendYieldScore = 60;    // Average yield: 3-5%
      else if (dividendYield >= 1) dividendYieldScore = 40;    // Poor yield: 1-3%
      else if (dividendYield > 0) dividendYieldScore = 20;     // Very poor yield: <1%
      else dividendYieldScore = 0;                             // No cash dividend = 0 yield
    }

    // 5. Price Valuation Score (10% weight) - Based on current price position within 52-week range
    let priceValuationScore = 50; // Default neutral score
    if (company.last_trading_price && company.week_52_min && company.week_52_max) {
      const currentPrice = company.last_trading_price;
      const min52Week = company.week_52_min;
      const max52Week = company.week_52_max;
      
      if (max52Week > min52Week) { // Valid range
        const pricePosition = ((currentPrice - min52Week) / (max52Week - min52Week)) * 100;
        
        if (pricePosition <= 25) priceValuationScore = 100;      // Near 52-week low - excellent buying opportunity
        else if (pricePosition <= 40) priceValuationScore = 80;  // Below average - good value
        else if (pricePosition <= 60) priceValuationScore = 60;  // Average range - fair value
        else if (pricePosition <= 75) priceValuationScore = 40;  // Above average - consider carefully
        else priceValuationScore = 20;                           // Near 52-week high - potentially overvalued
      }
    }

    // 6. Financial Performance Score (25% weight) - Based on EPS consistency and growth
    let financialPerformanceScore = 50; // Default neutral score
    const performances = company.financial_performance || [];
    if (performances.length > 0) {
      const sortedPerformances = [...performances].sort((a, b) => a.year - b.year);
      
      // Factor 1: Consistency - How many years with positive EPS (60% weight)
      const positiveYears = sortedPerformances.filter(p => p.earnings_per_share > 0).length;
      const consistencyRatio = positiveYears / sortedPerformances.length;
      let consistencyScore = consistencyRatio * 100;
      
      // Factor 2: Growth trend - Is EPS improving? (40% weight)
      let growthScore = 50; // Default neutral
      if (sortedPerformances.length >= 3) {
        const recent3Years = sortedPerformances.slice(-3);
        const older3Years = sortedPerformances.slice(-6, -3);
        
        if (older3Years.length > 0) {
          const recentAvgEPS = recent3Years.reduce((sum, p) => sum + p.earnings_per_share, 0) / recent3Years.length;
          const olderAvgEPS = older3Years.reduce((sum, p) => sum + p.earnings_per_share, 0) / older3Years.length;
          
          if (recentAvgEPS > olderAvgEPS * 1.2) growthScore = 100; // Strong EPS growth
          else if (recentAvgEPS > olderAvgEPS * 1.1) growthScore = 80; // Good EPS growth
          else if (recentAvgEPS >= olderAvgEPS * 0.9) growthScore = 60; // Stable EPS
          else if (recentAvgEPS >= olderAvgEPS * 0.7) growthScore = 40; // Declining EPS
          else growthScore = 20; // Significant EPS decline
        }
      }
      
      financialPerformanceScore = (consistencyScore * 0.6) + (growthScore * 0.4);
    }

    // 7. Shareholding Quality Score (10% weight) - Higher institutional and sponsor ownership is better
    let shareholdingQualityScore = 0;
    const shareholdings = company.shareholding_percentages || [];
    if (shareholdings.length > 0) {
      const latestShares = shareholdings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      // Incremental scoring curves for each ownership type
      const sponsorWeight = 0.4;    // 40% of shareholding score
      const institutionWeight = 0.35; // 35% of shareholding score
      const foreignWeight = 0.25;   // 25% of shareholding score
      
      // Sponsor/Director score curve (0-100 based on percentage)
      const sponsorPercent = latestShares.sponsor_or_director;
      let sponsorScore = 0;
      if (sponsorPercent >= 75) sponsorScore = 100;
      else if (sponsorPercent >= 50) sponsorScore = 100;
      else if (sponsorPercent >= 25) sponsorScore = 50 + ((sponsorPercent - 25) / 25) * 50;
      else if (sponsorPercent >= 10) sponsorScore = 20 + ((sponsorPercent - 10) / 15) * 30;
      else if (sponsorPercent > 0) sponsorScore = (sponsorPercent / 10) * 20;
      
      // Institution score curve (0-100 based on percentage)
      const institutionPercent = latestShares.institution;
      let institutionScore = 0;
      if (institutionPercent >= 50) institutionScore = 100;
      else if (institutionPercent >= 30) institutionScore = 75 + ((institutionPercent - 30) / 20) * 25;
      else if (institutionPercent >= 15) institutionScore = 50 + ((institutionPercent - 15) / 15) * 25;
      else if (institutionPercent >= 5) institutionScore = 25 + ((institutionPercent - 5) / 10) * 25;
      else if (institutionPercent > 0) institutionScore = (institutionPercent / 5) * 25;
      
      // Foreign score curve (0-100 based on percentage)
      const foreignPercent = latestShares.foreign;
      let foreignScore = 0;
      if (foreignPercent >= 30) foreignScore = 100;
      else if (foreignPercent >= 20) foreignScore = 80 + ((foreignPercent - 20) / 10) * 20;
      else if (foreignPercent >= 10) foreignScore = 60 + ((foreignPercent - 10) / 10) * 20;
      else if (foreignPercent >= 5) foreignScore = 40 + ((foreignPercent - 5) / 5) * 20;
      else if (foreignPercent >= 2) foreignScore = 20 + ((foreignPercent - 2) / 3) * 20;
      else if (foreignPercent > 0) foreignScore = (foreignPercent / 2) * 20;
      
      // Calculate weighted shareholding score
      shareholdingQualityScore = (sponsorScore * sponsorWeight) + 
                                (institutionScore * institutionWeight) + 
                                (foreignScore * foreignWeight);
    }

    // 8. PE Ratio Score (10% weight) - Reasonable PE ratios are better (0 PE gets no advantage)
    let peRatioScore = 0; // Default for missing or 0 PE
    if (company.unaudited_pe_ratio && company.unaudited_pe_ratio > 0) {
      const pe = company.unaudited_pe_ratio;
      
      if (pe <= 8) peRatioScore = 100;        // Excellent value
      else if (pe <= 12) peRatioScore = 90;   // Very good value
      else if (pe <= 15) peRatioScore = 80;   // Good value
      else if (pe <= 18) peRatioScore = 70;   // Fair value
      else if (pe <= 22) peRatioScore = 60;   // Average value
      else if (pe <= 28) peRatioScore = 40;   // Poor value
      else if (pe <= 35) peRatioScore = 20;   // Very poor value
      else peRatioScore = 10;                 // Extremely overvalued
    }

    // Calculate overall score (weighted average with 8 components)
    const overall = Math.round(
      (debtScore * 0.10) +                      // Debt ratio - 10%
      (reserveScore * 0.10) +                   // Financial reserves - 10%
      (dividendConsistencyScore * 0.15) +       // Dividend consistency - 15%
      (dividendYieldScore * 0.10) +             // Dividend yield - 10%
      (priceValuationScore * 0.10) +            // Price valuation - 10%
      (peRatioScore * 0.10) +                   // PE ratio - 10%
      (financialPerformanceScore * 0.25) +      // EPS performance - 25%
      (shareholdingQualityScore * 0.10)         // Shareholding quality - 10%
    );

    // Determine grade and color
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let color: 'green' | 'yellow' | 'orange' | 'red' | 'gray';

    if (overall >= 85) {
      grade = 'A';
      color = 'green';
    } else if (overall >= 70) {
      grade = 'B';
      color = 'yellow';
    } else if (overall >= 55) {
      grade = 'C';
      color = 'orange';
    } else if (overall >= 40) {
      grade = 'D';
      color = 'red';
    } else {
      grade = 'F';
      color = 'gray';
    }

    const breakdown: FinancialScoreBreakdown = {
      debtScore: Math.round(debtScore),
      reserveScore: Math.round(reserveScore),
      dividendConsistencyScore: Math.round(dividendConsistencyScore),
      dividendYieldScore: Math.round(dividendYieldScore),
      priceValuationScore: Math.round(priceValuationScore),
      financialPerformanceScore: Math.round(financialPerformanceScore),
      shareholdingQualityScore: Math.round(shareholdingQualityScore),
      peRatioScore: Math.round(peRatioScore)
    };

    return {
      overall,
      grade,
      color,
      breakdown
    };
  }

  /**
   * Calculate financial scores for multiple companies
   */
  calculateFinancialScores(companies: CompanyWithScore[]): CompanyWithScore[] {
    return companies.map(company => ({
      ...company,
      financial_score: this.calculateFinancialScore(company)
    }));
  }
}
