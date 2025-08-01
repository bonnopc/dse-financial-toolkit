import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class DividendDto {
  @ApiProperty({ description: 'Dividend year' })
  @IsNumber()
  year: number;

  @ApiPropertyOptional({ description: 'Cash dividend percentage' })
  @IsOptional()
  @IsNumber()
  cashDividend?: number;

  @ApiPropertyOptional({ description: 'Stock dividend percentage' })
  @IsOptional()
  @IsNumber()
  stockDividend?: number;
}

export class CompanyLoanDto {
  @ApiPropertyOptional({ description: 'Short term loan in millions' })
  @IsOptional()
  @IsNumber()
  shortTermMillion?: number;

  @ApiPropertyOptional({ description: 'Long term loan in millions' })
  @IsOptional()
  @IsNumber()
  longTermMillion?: number;

  @ApiPropertyOptional({ description: 'Date when loan data was updated' })
  @IsOptional()
  @IsString()
  dateUpdated?: string;
}

export class ReserveAndIncomeDto {
  @ApiPropertyOptional({ description: 'Reserve amount in millions' })
  @IsOptional()
  @IsNumber()
  reserveMillion?: number;

  @ApiPropertyOptional({ description: 'Unappropriated profit in millions' })
  @IsOptional()
  @IsNumber()
  unappropriatedProfitMillion?: number;

  @ApiPropertyOptional({ description: 'Date when reserve data was updated' })
  @IsOptional()
  @IsString()
  dateUpdated?: string;
}

export class CompanyMetadataDto {
  @ApiPropertyOptional({ description: 'Company sector' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ description: 'Authorized capital in millions' })
  @IsOptional()
  @IsNumber()
  authorizedCapitalInMillion?: number;

  @ApiPropertyOptional({ description: 'Paid up capital in millions' })
  @IsOptional()
  @IsNumber()
  paidUpCapitalInMillion?: number;

  @ApiPropertyOptional({ description: 'Total share count' })
  @IsOptional()
  @IsNumber()
  shareCount?: number;
}

export class PriceInfoDto {
  @ApiPropertyOptional({ description: 'Last trading price' })
  @IsOptional()
  @IsNumber()
  lastTradingPrice?: number;

  @ApiPropertyOptional({ description: 'Price change amount' })
  @IsOptional()
  @IsNumber()
  changeAmount?: number;

  @ApiPropertyOptional({ description: 'Price change percentage' })
  @IsOptional()
  @IsNumber()
  changePercentage?: number;

  @ApiPropertyOptional({ description: 'Trading volume' })
  @IsOptional()
  @IsNumber()
  volume?: number;

  @ApiPropertyOptional({ description: 'Trading value in millions' })
  @IsOptional()
  @IsNumber()
  valueMillion?: number;

  @ApiPropertyOptional({ description: 'Number of trades' })
  @IsOptional()
  @IsNumber()
  tradeCount?: number;

  @ApiPropertyOptional({ description: '52-week minimum price' })
  @IsOptional()
  @IsNumber()
  week52Min?: number;

  @ApiPropertyOptional({ description: '52-week maximum price' })
  @IsOptional()
  @IsNumber()
  week52Max?: number;
}

export class FinancialPerformanceDto {
  @ApiProperty({ description: 'Performance year' })
  @IsNumber()
  year: number;

  @ApiPropertyOptional({ description: 'Earnings per share' })
  @IsOptional()
  @IsNumber()
  earningsPerShare?: number;

  @ApiPropertyOptional({ description: 'Net operating cash flow per share' })
  @IsOptional()
  @IsNumber()
  netOperatingCashFlowPerShare?: number;

  @ApiPropertyOptional({ description: 'Net asset value per share' })
  @IsOptional()
  @IsNumber()
  netAssetValuePerShare?: number;
}

export class ShareholdingPercentageDto {
  @ApiProperty({ description: 'Date when shareholding data was recorded' })
  @IsString()
  date: string;

  @ApiPropertyOptional({ description: 'Sponsor or director shareholding percentage' })
  @IsOptional()
  @IsNumber()
  sponsorOrDirector?: number;

  @ApiPropertyOptional({ description: 'Government shareholding percentage' })
  @IsOptional()
  @IsNumber()
  government?: number;

  @ApiPropertyOptional({ description: 'Institution shareholding percentage' })
  @IsOptional()
  @IsNumber()
  institution?: number;

  @ApiPropertyOptional({ description: 'Foreign shareholding percentage' })
  @IsOptional()
  @IsNumber()
  foreign?: number;

  @ApiPropertyOptional({ description: 'Public shareholding percentage' })
  @IsOptional()
  @IsNumber()
  publicShares?: number;
}

export class OtherInfoDto {
  @ApiPropertyOptional({ description: 'Market lot size' })
  @IsOptional()
  @IsNumber()
  marketLot?: number;

  @ApiPropertyOptional({ description: 'Face value per share' })
  @IsOptional()
  @IsNumber()
  faceValuePerShare?: number;

  @ApiPropertyOptional({ description: 'Market category' })
  @IsOptional()
  @IsString()
  marketCategory?: string;

  @ApiPropertyOptional({ description: 'Company listing year' })
  @IsOptional()
  @IsNumber()
  listingYear?: number;

  @ApiPropertyOptional({ description: 'Shareholding percentages', type: [ShareholdingPercentageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShareholdingPercentageDto)
  shareHoldingParcentages?: ShareholdingPercentageDto[];
}

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company trading code' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Company full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'Company dividends', type: [DividendDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DividendDto)
  dividends: DividendDto[];

  @ApiProperty({ description: 'Company loan information' })
  @ValidateNested()
  @Type(() => CompanyLoanDto)
  loans: CompanyLoanDto;

  @ApiProperty({ description: 'Company reserve and income information' })
  @ValidateNested()
  @Type(() => ReserveAndIncomeDto)
  reserveAndIncome: ReserveAndIncomeDto;

  @ApiProperty({ description: 'Company metadata' })
  @ValidateNested()
  @Type(() => CompanyMetadataDto)
  metadata: CompanyMetadataDto;

  @ApiProperty({ description: 'Current price information' })
  @ValidateNested()
  @Type(() => PriceInfoDto)
  priceInfo: PriceInfoDto;

  @ApiProperty({ description: 'Financial performance data', type: [FinancialPerformanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinancialPerformanceDto)
  financialPerformance: FinancialPerformanceDto[];

  @ApiProperty({ description: 'Other company information' })
  @ValidateNested()
  @Type(() => OtherInfoDto)
  otherInfo: OtherInfoDto;

  @ApiPropertyOptional({ description: 'Unaudited P/E ratio' })
  @IsOptional()
  @IsNumber()
  unauditedPERatio?: number;
}
