import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PAGINATION_CONSTANTS } from '../constants/pagination.constants';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 409, description: 'Company already exists' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.createCompany(createCompanyDto);
  }

  @Put('upsert')
  @ApiOperation({ summary: 'Create or update a company (upsert)' })
  @ApiResponse({ status: 200, description: 'Company created or updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid company data' })
  upsert(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.upsertCompany(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({ name: 'sector', required: false, description: 'Filter by sector' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip' })
  @ApiResponse({ status: 200, description: 'List of companies' })
  findAll(
    @Query('sector') sector?: string,
    @Query('limit', new DefaultValuePipe(PAGINATION_CONSTANTS.DEFAULT_LIMIT), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(PAGINATION_CONSTANTS.DEFAULT_OFFSET), ParseIntPipe) offset?: number,
  ) {
    return this.companiesService.findAll(sector, limit, offset);
  }

  @Get('sectors')
  @ApiOperation({ summary: 'Get all available sectors' })
  @ApiResponse({ status: 200, description: 'List of sectors' })
  getSectors() {
    return this.companiesService.getSectors();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get company by code' })
  @ApiParam({ name: 'code', description: 'Company trading code' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('code') code: string) {
    return this.companiesService.findOne(code);
  }
}
