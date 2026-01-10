import React from 'react';
import SearchInput from '../atoms/SearchInput';
import CustomDropdown from '../atoms/CustomDropdown';

const HistoryFilters = ({ 
  searchQuery, 
  onSearchChange, 
  selectedDate, 
  onDateChange, 
  dateOptions = [],
  className = '' 
}) => {
  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      {/* Search */}
      <div className="flex-1">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="🔍 Cari nama atau pesan donatur..."
        />
      </div>
      
      {/* Date Filter */}
      <CustomDropdown
        value={selectedDate}
        onChange={onDateChange}
        options={dateOptions}
        placeholder="📅 Semua tanggal"
        className="md:w-72"
      />
    </div>
  );
};

export default HistoryFilters;
