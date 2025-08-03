import { Injectable } from '@nestjs/common';

export interface FinancialScoreBreakdown {
  debtScore: number;
  reserveScore: number;
  dividendConsistencyScore: number;
  dividendYieldScore: number;
  priceValuationScore: number;
  financialPerformanceScore: number;
  shareholdingQualityScore: number;
  peRatioScore: number;
}

export interface FinancialScoreResult {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
  breakdown: FinancialScoreBreakdown;
}

export interface CompanyFinancialData {
  // Basic company info
  code: string;
  unauditedPERatio?: number;

  // Metadata
  paidUpCapitalInMillion: number;

  // Loans
  shortTermMillion: number;
  longTermMillion: number;

  // Reserves
  reserveInMillion: number;

  // Price info
  lastTradingPrice?: number;
  movingRangeFor52Weeks?: {
    min: number;
    max: number;
  };

  // Related data
  dividends: Array<{
    year: number;
    cashDividend: number;
    stockDividend: number;
  }>;

  financialPerformance: Array<{
    year: number;
    earningsPerShare: number;
  }>;

  shareholdingPercentages: Array<{
    date: string;
    sponsorOrDirector: number;
    institution: number;
    foreign: number;
  }>;
}

@Injectable()
export class FinancialScoringService {
  /**
   * Calculate comprehensive financial score for a company
   */
  calculateFinancialScore(
    companyData: CompanyFinancialData
  ): FinancialScoreResult {
    // Handle potential null/undefined values
    const paidUpCapital = companyData.paidUpCapitalInMillion || 1; // Avoid division by zero
    const shortTermLoan = companyData.shortTermMillion || 0;
    const longTermLoan = companyData.longTermMillion || 0;
    const reserveAmount = companyData.reserveInMillion || 0;

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
    const dividends = companyData.dividends;
    let dividendConsistencyScore =
      this.calculateDividendConsistencyScore(dividends);

    // 4. Dividend Yield Score (10% weight)
    let dividendYieldScore = this.calculateDividendYieldScore(
      dividends,
      companyData.lastTradingPrice
    );

    // 5. Price Valuation Score (10% weight)
    let priceValuationScore = this.calculatePriceValuationScore(
      companyData.lastTradingPrice,
      companyData.movingRangeFor52Weeks
    );

    // 6. Financial Performance Score (25% weight)
    let financialPerformanceScore = this.calculateFinancialPerformanceScore(
      companyData.financialPerformance
    );

    // 7. Shareholding Quality Score (10% weight)
    let shareholdingQualityScore = this.calculateShareholdingQualityScore(
      companyData.shareholdingPercentages
    );

    // 8. PE Ratio Score (10% weight)
    let peRatioScore = this.calculatePERatioScore(companyData.unauditedPERatio);

    // Calculate overall score (weighted average)
    const overall = Math.round(
      debtScore * 0.1 +
        reserveScore * 0.1 +
        dividendConsistencyScore * 0.15 +
        dividendYieldScore * 0.1 +
        priceValuationScore * 0.1 +
        peRatioScore * 0.1 +
        financialPerformanceScore * 0.25 +
        shareholdingQualityScore * 0.1
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

    return {
      overall,
      grade,
      color,
      breakdown: {
        debtScore: Math.round(debtScore),
        reserveScore: Math.round(reserveScore),
        dividendConsistencyScore: Math.round(dividendConsistencyScore),
        dividendYieldScore: Math.round(dividendYieldScore),
        priceValuationScore: Math.round(priceValuationScore),
        financialPerformanceScore: Math.round(financialPerformanceScore),
        shareholdingQualityScore: Math.round(shareholdingQualityScore),
        peRatioScore: Math.round(peRatioScore),
      },
    };
  }

  private calculateDividendConsistencyScore(
    dividends: Array<{
      year: number;
      cashDividend: number;
      stockDividend: number;
    }>
  ): number {
    if (dividends.length === 0) {
      return 0;
    }

    // Helper function to calculate weighted dividend
    const getWeightedDividend = (cashDiv: number, stockDiv: number) =>
      cashDiv + stockDiv * 0.3;

    // Factor 1: Payment Frequency (40% of consistency score)
    const nonZeroDividends = dividends.filter(
      (d) => getWeightedDividend(d.cashDividend, d.stockDividend) > 0
    );
    const paymentFrequency = nonZeroDividends.length / dividends.length;
    let frequencyScore = paymentFrequency * 100;

    // Factor 2: Payment Stability (30% of consistency score)
    const totalDividends = dividends.map((d) =>
      getWeightedDividend(d.cashDividend, d.stockDividend)
    );
    const avgDividend =
      totalDividends.reduce((sum, div) => sum + div, 0) / totalDividends.length;

    let stabilityScore = 0;
    if (avgDividend > 0) {
      const variance =
        totalDividends.reduce(
          (sum, div) => sum + Math.pow(div - avgDividend, 2),
          0
        ) / totalDividends.length;
      const coefficientOfVariation = Math.sqrt(variance) / avgDividend;
      stabilityScore = Math.max(0, 100 - coefficientOfVariation * 100);
    }

    // Factor 3: Recent Trend (30% of consistency score)
    let trendScore = 50; // Default neutral score
    if (dividends.length >= 3) {
      const recent3Years = dividends
        .slice(-3)
        .map((d) => getWeightedDividend(d.cashDividend, d.stockDividend));
      const older3Years = dividends
        .slice(-6, -3)
        .map((d) => getWeightedDividend(d.cashDividend, d.stockDividend));

      if (older3Years.length > 0) {
        const recentAvg =
          recent3Years.reduce((sum, div) => sum + div, 0) / recent3Years.length;
        const olderAvg =
          older3Years.reduce((sum, div) => sum + div, 0) / older3Years.length;

        if (recentAvg > olderAvg * 1.1) trendScore = 100;
        else if (recentAvg >= olderAvg * 0.9) trendScore = 80;
        else if (recentAvg >= olderAvg * 0.7) trendScore = 60;
        else if (recentAvg >= olderAvg * 0.5) trendScore = 40;
        else trendScore = 20;
      }
    }

    // Weighted combination
    let consistencyScore =
      frequencyScore * 0.4 + stabilityScore * 0.3 + trendScore * 0.3;

    // Bonus for 4+ consecutive years
    if (dividends.length >= 4) {
      const lastFourYears = dividends.slice(-4);
      const consecutiveDividends = lastFourYears.every(
        (d) => getWeightedDividend(d.cashDividend, d.stockDividend) > 0
      );
      if (consecutiveDividends) {
        consistencyScore = Math.min(100, consistencyScore * 1.1);
      }
    }

    return consistencyScore;
  }

  private calculateDividendYieldScore(
    dividends: Array<{
      year: number;
      cashDividend: number;
      stockDividend: number;
    }>,
    lastTradingPrice?: number
  ): number {
    if (dividends.length === 0 || !lastTradingPrice || lastTradingPrice <= 0) {
      return 0;
    }

    const sortedDividends = [...dividends].sort((a, b) => b.year - a.year);
    const latestDividend = sortedDividends[0];

    const latestCashDividendPercentage = latestDividend.cashDividend;
    const latestCashDividendAmount = (latestCashDividendPercentage / 100) * 10; // Face value is 10 taka

    const dividendYield = (latestCashDividendAmount / lastTradingPrice) * 100;

    if (dividendYield >= 8) return 100;
    else if (dividendYield >= 5) return 80;
    else if (dividendYield >= 3) return 60;
    else if (dividendYield >= 1) return 40;
    else if (dividendYield > 0) return 20;
    else return 0;
  }

  private calculatePriceValuationScore(
    lastTradingPrice?: number,
    movingRange?: { min: number; max: number }
  ): number {
    if (
      !lastTradingPrice ||
      !movingRange ||
      movingRange.max <= movingRange.min
    ) {
      return 50; // Default neutral score
    }

    const pricePosition =
      ((lastTradingPrice - movingRange.min) /
        (movingRange.max - movingRange.min)) *
      100;

    if (pricePosition <= 25) return 100;
    else if (pricePosition <= 40) return 80;
    else if (pricePosition <= 60) return 60;
    else if (pricePosition <= 75) return 40;
    else return 20;
  }

  private calculateFinancialPerformanceScore(
    performances: Array<{ year: number; earningsPerShare: number }>
  ): number {
    if (performances.length === 0) {
      return 50; // Default neutral score
    }

    const sortedPerformances = performances.sort((a, b) => a.year - b.year);

    // Factor 1: Consistency (60% weight)
    const positiveYears = sortedPerformances.filter(
      (p) => p.earningsPerShare > 0
    ).length;
    const consistencyRatio = positiveYears / sortedPerformances.length;
    let consistencyScore = consistencyRatio * 100;

    // Factor 2: Growth trend (40% weight)
    let growthScore = 50; // Default neutral
    if (sortedPerformances.length >= 3) {
      const recent3Years = sortedPerformances.slice(-3);
      const older3Years = sortedPerformances.slice(-6, -3);

      if (older3Years.length > 0) {
        const recentAvgEPS =
          recent3Years.reduce((sum, p) => sum + p.earningsPerShare, 0) /
          recent3Years.length;
        const olderAvgEPS =
          older3Years.reduce((sum, p) => sum + p.earningsPerShare, 0) /
          older3Years.length;

        if (recentAvgEPS > olderAvgEPS * 1.2) growthScore = 100;
        else if (recentAvgEPS > olderAvgEPS * 1.1) growthScore = 80;
        else if (recentAvgEPS >= olderAvgEPS * 0.9) growthScore = 60;
        else if (recentAvgEPS >= olderAvgEPS * 0.7) growthScore = 40;
        else growthScore = 20;
      }
    }

    return consistencyScore * 0.6 + growthScore * 0.4;
  }

  private calculateShareholdingQualityScore(
    shareholdings: Array<{
      date: string;
      sponsorOrDirector: number;
      institution: number;
      foreign: number;
    }>
  ): number {
    if (shareholdings.length === 0) {
      return 0;
    }

    const latestShares = shareholdings.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const sponsorWeight = 0.4;
    const institutionWeight = 0.35;
    const foreignWeight = 0.25;

    // Sponsor score
    const sponsorPercent = latestShares.sponsorOrDirector;
    let sponsorScore = 0;
    if (sponsorPercent >= 75) sponsorScore = 100;
    else if (sponsorPercent >= 50) sponsorScore = 100;
    else if (sponsorPercent >= 25)
      sponsorScore = 50 + ((sponsorPercent - 25) / 25) * 50;
    else if (sponsorPercent >= 10)
      sponsorScore = 20 + ((sponsorPercent - 10) / 15) * 30;
    else if (sponsorPercent > 0) sponsorScore = (sponsorPercent / 10) * 20;

    // Institution score
    const institutionPercent = latestShares.institution;
    let institutionScore = 0;
    if (institutionPercent >= 50) institutionScore = 100;
    else if (institutionPercent >= 30)
      institutionScore = 75 + ((institutionPercent - 30) / 20) * 25;
    else if (institutionPercent >= 15)
      institutionScore = 50 + ((institutionPercent - 15) / 15) * 25;
    else if (institutionPercent >= 5)
      institutionScore = 25 + ((institutionPercent - 5) / 10) * 25;
    else if (institutionPercent > 0)
      institutionScore = (institutionPercent / 5) * 25;

    // Foreign score
    const foreignPercent = latestShares.foreign;
    let foreignScore = 0;
    if (foreignPercent >= 30) foreignScore = 100;
    else if (foreignPercent >= 20)
      foreignScore = 80 + ((foreignPercent - 20) / 10) * 20;
    else if (foreignPercent >= 10)
      foreignScore = 60 + ((foreignPercent - 10) / 10) * 20;
    else if (foreignPercent >= 5)
      foreignScore = 40 + ((foreignPercent - 5) / 5) * 20;
    else if (foreignPercent >= 2)
      foreignScore = 20 + ((foreignPercent - 2) / 3) * 20;
    else if (foreignPercent > 0) foreignScore = (foreignPercent / 2) * 20;

    return (
      sponsorScore * sponsorWeight +
      institutionScore * institutionWeight +
      foreignScore * foreignWeight
    );
  }

  private calculatePERatioScore(unauditedPERatio?: number): number {
    if (!unauditedPERatio || unauditedPERatio <= 0) {
      return 0;
    }

    if (unauditedPERatio <= 8) return 100;
    else if (unauditedPERatio <= 12) return 90;
    else if (unauditedPERatio <= 15) return 80;
    else if (unauditedPERatio <= 18) return 70;
    else if (unauditedPERatio <= 22) return 60;
    else if (unauditedPERatio <= 28) return 40;
    else if (unauditedPERatio <= 35) return 20;
    else return 10;
  }
}
