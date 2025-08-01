import { transformApiCompaniesToCompanies } from '@/lib/data-transformer';
import { dseApiClient } from '@/lib/dse-api-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Hook to fetch companies with React Query
 */
export function useCompanies(params?: {
  sector?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      const apiCompanies = await dseApiClient.getCompanies(params);
      return transformApiCompaniesToCompanies(apiCompanies);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch sectors derived from companies data
 * This avoids duplicate API calls by reusing the companies query
 */
export function useSectors() {
  // Fetch all companies with limit=1000 to get complete sectors list
  const companiesQuery = useQuery({
    queryKey: ['companies', { limit: 1000 }],
    queryFn: async () => {
      const apiCompanies = await dseApiClient.getCompanies({ limit: 1000 });
      return transformApiCompaniesToCompanies(apiCompanies);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - sectors don't change often
  });

  // Derive sectors from companies data
  const sectors = useMemo(() => {
    if (!companiesQuery.data) return [];
    
    const uniqueSectors = Array.from(new Set(
      companiesQuery.data
        .map(company => company.metadata.sector)
        .filter(sector => sector && sector.trim() !== '')
    )) as string[];
    
    return uniqueSectors.sort();
  }, [companiesQuery.data]);

  return {
    data: sectors,
    isLoading: companiesQuery.isLoading,
    error: companiesQuery.error,
    isError: companiesQuery.isError,
    isSuccess: companiesQuery.isSuccess,
  };
}

/**
 * Hook to fetch a specific company by code
 */
export function useCompany(code: string) {
  return useQuery({
    queryKey: ['company', code],
    queryFn: () => dseApiClient.getCompanyByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
