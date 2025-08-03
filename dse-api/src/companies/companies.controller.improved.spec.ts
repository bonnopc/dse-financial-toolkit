import { Test, TestingModule } from '@nestjs/testing';
import {
  CompanyTestDataFactory,
  MockServices,
  TestAssertions,
} from '../test-utils';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let mockCompaniesService: jest.Mocked<Partial<CompaniesService>>;

  beforeEach(async () => {
    mockCompaniesService = MockServices.createCompaniesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('findAll', () => {
    const mockCompanies = CompanyTestDataFactory.createFullCompanyList(2);

    beforeEach(() => {
      mockCompaniesService.findAll!.mockResolvedValue(mockCompanies);
    });

    it('should return all companies', async () => {
      const result = await controller.findAll();

      expect(result).toEqual(mockCompanies);
      TestAssertions.assertPaginatedList(result);
      result.forEach(TestAssertions.assertCompanyStructure);
      expect(mockCompaniesService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined
      );
    });

    it('should filter companies by sector', async () => {
      const techCompanies = mockCompanies.filter(
        (c) => c.sector === 'Technology'
      );
      mockCompaniesService.findAll!.mockResolvedValue(techCompanies);

      const result = await controller.findAll('Technology');

      expect(result).toEqual(techCompanies);
      expect(mockCompaniesService.findAll).toHaveBeenCalledWith(
        'Technology',
        undefined,
        undefined
      );
    });

    it('should apply pagination parameters', async () => {
      await controller.findAll(undefined, 10, 20);

      expect(mockCompaniesService.findAll).toHaveBeenCalledWith(
        undefined,
        10,
        20
      );
    });
  });

  describe('findOne', () => {
    const mockCompany = CompanyTestDataFactory.createFullCompany();

    beforeEach(() => {
      mockCompaniesService.findOne!.mockResolvedValue(mockCompany);
    });

    it('should handle non-existent company', async () => {
      mockCompaniesService.findOne!.mockResolvedValue(null);

      const result = await controller.findOne('NONEXISTENT');

      expect(result).toBeNull();
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith('NONEXISTENT');
    });
  });

  describe('upsert', () => {
    const mockCreateDto = CompanyTestDataFactory.createCreateCompanyDto();
    const mockResult = CompanyTestDataFactory.createBasicCompany();

    it('should create or update a company', async () => {
      mockCompaniesService.upsertCompany!.mockResolvedValue(mockResult);

      const result = await controller.upsert(mockCreateDto);

      expect(result).toEqual(mockResult);
      TestAssertions.assertCompanyStructure(result);
      expect(mockCompaniesService.upsertCompany).toHaveBeenCalledWith(
        mockCreateDto
      );
    });
  });

  describe('getSectors', () => {
    const mockSectors = ['Technology', 'Banking', 'Healthcare'];

    it('should return all unique sectors', async () => {
      mockCompaniesService.getSectors!.mockResolvedValue(mockSectors);

      const result = await controller.getSectors();

      expect(result).toEqual(mockSectors);
      expect(Array.isArray(result)).toBe(true);
      expect(mockCompaniesService.getSectors).toHaveBeenCalled();
    });

    it('should handle empty sectors list', async () => {
      mockCompaniesService.getSectors!.mockResolvedValue([]);

      const result = await controller.getSectors();

      expect(result).toEqual([]);
      expect(mockCompaniesService.getSectors).toHaveBeenCalled();
    });
  });
});
