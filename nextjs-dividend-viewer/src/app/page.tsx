'use client'

import DividendTable from '@/components/DividendTable/DividendTable';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import SectorFilter from '@/components/SectorFilter/SectorFilter';
import dividendsData from '@/data/dividends.json';
import { Company } from '@/types/Company';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Simulate loading time for large dataset
    const timer = setTimeout(() => {
      setCompanies(dividendsData as Company[]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get unique sectors from the data
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(companies.map(company => company.metadata.sector)));
    return uniqueSectors.sort();
  }, [companies]);

  // Filter companies based on selected sector and search term
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Filter by sector
    if (selectedSector !== 'All') {
      filtered = filtered.filter(company => company.metadata.sector === selectedSector);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        company.fullName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [companies, selectedSector, searchTerm]);

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="container">
          <LoadingSpinner />
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
