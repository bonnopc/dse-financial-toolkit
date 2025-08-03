'use client';

import DividendTable from '@/components/DividendTable/DividendTable';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import SectorFilter from '@/components/SectorFilter/SectorFilter';
import { useCompanies, useSectors } from '@/hooks/useApiData';
import { useState } from 'react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  // Use React Query to fetch data
  const {
    data: companies = [],
    isLoading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies,
  } = useCompanies({
    sector: selectedSector !== 'All' ? selectedSector : undefined,
    limit: 1000, // Fetch all companies
  });

  const { data: sectors = [], isLoading: sectorsLoading } = useSectors();

  const isLoading = companiesLoading || sectorsLoading;

  // Filter companies based on search term
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  if (isLoading) {
    return (
      <div className="App">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="App">
        <div className="container">
          <div
            className="error-message"
            style={{
              padding: '20px',
              margin: '20px 0',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c00',
            }}
          >
            <h3>Error loading data</h3>
            <p>
              {companiesError instanceof Error
                ? companiesError.message
                : 'Failed to load company data'}
            </p>
            <button
              onClick={() => refetchCompanies()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <SectorFilter
          sectors={sectors}
          selectedSector={selectedSector}
          onSectorChange={handleSectorChange}
          companiesCount={filteredCompanies.length}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <DividendTable companies={filteredCompanies} />
      </div>
    </div>
  );
}
