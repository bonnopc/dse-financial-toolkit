import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import InputLabel from '../common/InputLabel';
import './SectorFilter.css';

interface SectorFilterProps {
  sectors: string[];
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  companiesCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SectorFilter: React.FC<SectorFilterProps> = ({
  sectors,
  selectedSector,
  onSectorChange,
  companiesCount,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="sector-filter-container">
      <div className="filter-header">
        <h2>DSE Companies Financial Data</h2>
        <p className="companies-count">
          Showing {companiesCount} companies
          {selectedSector !== 'All' && ` in ${selectedSector}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
        <p className="data-info">
          Click column headers to sort • View dividends, loans, reserves, and
          capital information
        </p>
      </div>

      <div className="filters-container">
        <div className="filter-section">
          <InputLabel htmlFor="sector-select">Filter by Sector:</InputLabel>
          <select
            id="sector-select"
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="sector-select"
          >
            <option value="All">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>
    </div>
  );
};

export default SectorFilter;
