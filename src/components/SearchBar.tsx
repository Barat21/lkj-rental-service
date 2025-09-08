import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Translations } from '../utils/translations';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedSearch: (startDate: string, endDate: string, vanNumber: string) => void;
  loading?: boolean;
  t: Translations;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAdvancedSearch, loading, t }) => {
  const [generalSearch, setGeneralSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    startDate: '',
    endDate: '',
    vanNumber: ''
  });

  const handleGeneralSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(generalSearch);
  };

  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onAdvancedSearch(advancedSearch.startDate, advancedSearch.endDate, advancedSearch.vanNumber);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{t.searchTrips}</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          {t.advancedSearch}
        </button>
      </div>

      {/* General Search */}
      <form onSubmit={handleGeneralSearch} className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={generalSearch}
              onChange={(e) => setGeneralSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {t.search}
          </button>
        </div>
      </form>

      {/* Advanced Search */}
      {showAdvanced && (
        <form onSubmit={handleAdvancedSearch} className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.startDate}
              </label>
              <input
                type="date"
                value={advancedSearch.startDate}
                onChange={(e) => setAdvancedSearch(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.endDate}
              </label>
              <input
                type="date"
                value={advancedSearch.endDate}
                onChange={(e) => setAdvancedSearch(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.vanNumber}
              </label>
              <input
                type="text"
                value={advancedSearch.vanNumber}
                onChange={(e) => setAdvancedSearch(prev => ({ ...prev, vanNumber: e.target.value }))}
                placeholder={t.vanNumberPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {t.advancedSearch}
          </button>
        </form>
      )}
    </div>
  );
};