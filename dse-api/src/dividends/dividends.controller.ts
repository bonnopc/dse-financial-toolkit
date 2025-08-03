import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DividendsService } from './dividends.service';

@ApiTags('dividends')
@Controller('dividends')
export class DividendsController {
  constructor(private readonly dividendsService: DividendsService) {}

  @Get('company/:code')
  @ApiOperation({ summary: 'Get dividends for a specific company' })
  @ApiParam({ name: 'code', description: 'Company trading code' })
  @ApiResponse({ status: 200, description: 'Company dividend history' })
  findByCompany(@Param('code') code: string) {
    return this.dividendsService.findByCompany(code);
  }

  @Get('top-payers')
  @ApiOperation({ summary: 'Get top dividend paying companies' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results to return',
  })
  @ApiResponse({ status: 200, description: 'Top dividend paying companies' })
  findTopPayers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.dividendsService.findTopDividendPayers(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dividend statistics' })
  @ApiResponse({ status: 200, description: 'Overall dividend statistics' })
  getStats() {
    return this.dividendsService.getDividendStats();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get dividend trends over years' })
  @ApiQuery({
    name: 'years',
    required: false,
    description: 'Number of years to analyze',
  })
  @ApiResponse({ status: 200, description: 'Dividend trends by year' })
  getTrends(
    @Query('years', new DefaultValuePipe(5), ParseIntPipe) years?: number
  ) {
    return this.dividendsService.getDividendTrends(years);
  }
}
