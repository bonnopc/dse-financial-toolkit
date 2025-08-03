import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;

  const mockCompaniesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    upsertCompany: jest.fn(),
    getSectors: jest.fn(),
  };

  beforeEach(async () => {
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
    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockCompanies = [
        {
          id: 1,
          code: 'TEST',
          fullName: 'Test Company',
          financial_score: 75.5,
        },
      ];

      mockCompaniesService.findAll.mockResolvedValue(mockCompanies);

      const result = await controller.findAll();
      expect(result).toEqual(mockCompanies);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return companies filtered by sector', async () => {
      const mockCompanies = [
        {
          id: 1,
          code: 'TECH',
          fullName: 'Tech Company',
          sector: 'Technology',
          financial_score: 80.0,
        },
      ];

      mockCompaniesService.findAll.mockResolvedValue(mockCompanies);

      const result = await controller.findAll('Technology');
      expect(result).toEqual(mockCompanies);
      expect(service.findAll).toHaveBeenCalledWith(
        'Technology',
        undefined,
        undefined
      );
    });
  });

  describe('findOne', () => {
    it('should return a company by code', async () => {
      const mockCompany = {
        id: 1,
        code: 'TEST',
        fullName: 'Test Company',
        financial_score: 75.5,
      };

      mockCompaniesService.findOne.mockResolvedValue(mockCompany);

      const result = await controller.findOne('TEST');
      expect(result).toEqual(mockCompany);
      expect(service.findOne).toHaveBeenCalledWith('TEST');
    });
  });

  describe('upsert', () => {
    it('should create or update a company', async () => {
      const mockCreateDto = {
        name: 'NEW',
        fullName: 'New Company Limited',
        metadata: {
          paidUpCapitalInMillion: 100,
        },
        loans: {
          shortTermMillion: 10,
          longTermMillion: 20,
        },
      };

      const mockResult = {
        id: 1,
        code: 'NEW',
        fullName: 'New Company Limited',
        financial_score: 65.0,
      };

      mockCompaniesService.upsertCompany.mockResolvedValue(mockResult);

      const result = await controller.upsert(mockCreateDto as any);
      expect(result).toEqual(mockResult);
      expect(service.upsertCompany).toHaveBeenCalledWith(mockCreateDto);
    });
  });

  describe('getSectors', () => {
    it('should return all unique sectors', async () => {
      const mockSectors = ['Technology', 'Banking', 'Healthcare'];

      mockCompaniesService.getSectors.mockResolvedValue(mockSectors);

      const result = await controller.getSectors();
      expect(result).toEqual(mockSectors);
      expect(service.getSectors).toHaveBeenCalled();
    });
  });
});
