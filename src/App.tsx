import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw } from 'lucide-react';
import { TripForm } from './components/TripForm';
import { SearchBar } from './components/SearchBar';
import { DataTable } from './components/DataTable';
import { LanguageToggle } from './components/LanguageToggle';
import { vanRentalAPI, VanRentalTrip } from './services/api';
import { exportToExcel } from './utils/export';
import { useTranslation } from './utils/translations';

function App() {
  const [trips, setTrips] = useState<VanRentalTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<VanRentalTrip[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [language, setLanguage] = useState('en');
  
  const t = useTranslation(language);

  // Load trips on component mount
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await vanRentalAPI.getAllTrips();
      setTrips(data);
      setSearchResults(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = async (tripData: Omit<VanRentalTrip, 'id'>) => {
    setLoading(true);
    try {
      const newTrip = await vanRentalAPI.createTrip(tripData);
      setTrips(prev => [...prev, newTrip]);
      if (!isSearching) {
        setSearchResults(prev => [...prev, newTrip]);
      }
    } catch (error) {
      console.error('Error adding trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrip = async (id: string, updates: Partial<VanRentalTrip>) => {
    try {
      const updatedTrip = await vanRentalAPI.updateTrip(id, updates);
      setTrips(prev => prev.map(trip => trip.id === id ? updatedTrip : trip));
      setSearchResults(prev => prev.map(trip => trip.id === id ? updatedTrip : trip));
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await vanRentalAPI.deleteTrip(id);
        setTrips(prev => prev.filter(trip => trip.id !== id));
        setSearchResults(prev => prev.filter(trip => trip.id !== id));
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(trips);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const results = await vanRentalAPI.searchTrips(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (startDate: string, endDate: string, vanNumber: string) => {
    if (!startDate && !endDate && !vanNumber) {
      setSearchResults(trips);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const results = await vanRentalAPI.searchByDateAndVan(
        startDate || '1900-01-01',
        endDate || '2100-12-31',
        vanNumber
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error in advanced search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToExcel(searchResults);
  };

  const handleRefresh = () => {
    loadTrips();
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{t.appTitle}</h1>
                <p className="text-sm text-gray-600">{t.appSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle 
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {t.refresh}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Form */}
        <TripForm onSubmit={handleAddTrip} loading={loading} t={t} />

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onAdvancedSearch={handleAdvancedSearch}
          loading={loading}
          t={t}
        />

        {/* Results Info */}
        {isSearching && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              {searchResults.length} {t.showingResults}
              <button
                onClick={handleRefresh}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                {t.showAllTrips}
              </button>
            </p>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          trips={searchResults}
          onUpdate={handleUpdateTrip}
          onDelete={handleDeleteTrip}
          onExport={handleExport}
          loading={loading}
          t={t}
        />
      </main>
    </div>
  );
}

export default App;