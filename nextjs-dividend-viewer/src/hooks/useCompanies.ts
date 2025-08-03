import { transformApiCompaniesToCompanies } from '@/lib/data-transformer';
import { dseApiClient } from '@/lib/dse-api-client';
import { Company } from '@/types/Company';
import { useCallback, useEffect, useState } from 'react';

interface UseCompaniesReturn {
  companies: Company[];
  loading: boolean;
  error: string | null;
  sectors: string[];
  refetch: () => Promise<void>;
}

interface UseCompaniesOptions {
  sector?: string;
  limit?: number;
  offset?: number;
}

export function useCompanies(
  options: UseCompaniesOptions = {}
): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch companies and sectors in parallel
      const [apiCompanies, apiSectors] = await Promise.all([
        dseApiClient.getCompanies(options),
        dseApiClient.getSectors(),
      ]);

      // Transform API data to frontend format
      const transformedCompanies =
        transformApiCompaniesToCompanies(apiCompanies);

      setCompanies(transformedCompanies);
      setSectors(['All', ...apiSectors.filter(Boolean)]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch companies';
      setError(errorMessage);
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  }, [options.sector, options.limit, options.offset]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    sectors,
    refetch: fetchCompanies,
  };
}
