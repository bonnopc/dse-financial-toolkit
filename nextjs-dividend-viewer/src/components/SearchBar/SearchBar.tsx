import React from 'react';
import InputLabel from '../common/InputLabel';
import './SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-bar-container">
      <InputLabel htmlFor="search-input">
        Search Companies:
      </InputLabel>
      <input
        id="search-input"
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by company name or code..."
        className="search-input"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="clear-button"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;
