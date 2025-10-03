import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, LogOut } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TripForm } from './components/TripForm';
import { SearchBar } from './components/SearchBar';
import { DataTable } from './components/DataTable';
import { PaymentForm } from './components/PaymentForm';
import { LanguageToggle } from './components/LanguageToggle';
import { vanRentalAPI, VanRentalTrip } from './services/api';
import { exportToPDF } from './utils/export';
import { useTranslation } from './utils/translations';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [trips, setTrips] = useState<VanRentalTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<VanRentalTrip[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const [isPaymentFormCollapsed, setIsPaymentFormCollapsed] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('unpaid');
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [currentAdvancedSearch, setCurrentAdvancedSearch] = useState({
    startDate: '',
    endDate: '',
    vanNumber: ''
  });
  
  const t = useTranslation(language);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setTrips([]);
    setSearchResults([]);
    setIsSearching(false);
  };

  // Load trips on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadTrips();
    }
  }, [isAuthenticated]);

  // Load trips when payment filter changes
  useEffect(() => {
    if (isAuthenticated) {
      // If there's an active search, re-run the search with new payment filter
      if (isSearching) {
        if (currentSearchQuery) {
          handleSearch(currentSearchQuery);
        } else {
          handleAdvancedSearch(
            currentAdvancedSearch.startDate,
            currentAdvancedSearch.endDate,
            currentAdvancedSearch.vanNumber,
            paymentFilter
          );
        }
      } else {
        loadTripsWithFilter();
      }
    }
  }, [paymentFilter, isAuthenticated]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await vanRentalAPI.getAllTrips();
      // Filter based on current payment filter
      const filteredData = filterTripsByPaymentStatus(data, paymentFilter);
      setTrips(filteredData);
      setSearchResults(filteredData);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripsWithFilter = async () => {
    setLoading(true);
    try {
      const data = await vanRentalAPI.getAllTrips();
      const filteredData = filterTripsByPaymentStatus(data, paymentFilter);
      setTrips(filteredData);
      if (!isSearching) {
        setSearchResults(filteredData);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTripsByPaymentStatus = (trips: VanRentalTrip[], status: 'all' | 'paid' | 'unpaid'): VanRentalTrip[] => {
    if (status === 'all') return trips;
    if (status === 'paid') return trips.filter(trip => trip.paid === true);
    return trips.filter(trip => trip.paid !== true); // unpaid (false or undefined)
  };

  const handleAddTrip = async (tripData: Omit<VanRentalTrip, 'id'>) => {
    setLoading(true);
    try {
      const newTrip = await vanRentalAPI.createTrip(tripData);
      // Only add to current view if it matches the payment filter
      if (paymentFilter === 'all' || 
          (paymentFilter === 'paid' && newTrip.paid) || 
          (paymentFilter === 'unpaid' && !newTrip.paid)) {
        setTrips(prev => [...prev, newTrip]);
        if (!isSearching) {
          setSearchResults(prev => [...prev, newTrip]);
        }
      }
    } catch (error) {
      console.error('Error adding trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (paymentData: {
    vanNumber: string;
    startDate: string;
    endDate: string;
    amount: number;
    transactionDate: string;
  }) => {
    setLoading(true);
    try {
      await vanRentalAPI.recordPayment(
        paymentData.startDate,
        paymentData.endDate,
        paymentData.vanNumber,
        paymentData.transactionDate,
        paymentData.amount
      );
      // Reload trips to reflect payment status changes
      await loadTripsWithFilter();
      alert(t.paymentRecorded);
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment. Please try again.');
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
    setCurrentSearchQuery(query);
    setCurrentAdvancedSearch({ startDate: '', endDate: '', vanNumber: '' });
    
    if (!query.trim()) {
      const filteredTrips = filterTripsByPaymentStatus(trips, paymentFilter);
      setSearchResults(filteredTrips);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const results = await vanRentalAPI.searchTripsWithPaymentFilter(query, paymentFilter);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (startDate: string, endDate: string, vanNumber: string, paymentStatus: 'all' | 'paid' | 'unpaid') => {
    setCurrentSearchQuery('');
    setCurrentAdvancedSearch({ startDate, endDate, vanNumber });
    
    if (!startDate && !endDate && !vanNumber) {
      const filteredTrips = filterTripsByPaymentStatus(trips, paymentStatus);
      setSearchResults(filteredTrips);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const results = await vanRentalAPI.searchByDateVanAndPayment(
        startDate || '1900-01-01',
        endDate || '2100-12-31',
        vanNumber,
        paymentStatus
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error in advanced search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (advanceAmount: number = 0) => {
    exportToPDF(searchResults, advanceAmount);
  };

  const handlePaymentFilterChange = (filter: 'all' | 'paid' | 'unpaid') => {
    setPaymentFilter(filter);
    setIsSearching(false);
  };

  const handleRefresh = () => {
    setCurrentSearchQuery('');
    setCurrentAdvancedSearch({ startDate: '', endDate: '', vanNumber: '' });
    setIsSearching(false);
    loadTripsWithFilter();
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

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
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
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
        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onAdvancedSearch={handleAdvancedSearch}
          loading={loading}
          t={t}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={handlePaymentFilterChange}
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

        {/* Trip Form - Now at the bottom and collapsible */}
        <TripForm 
          onSubmit={handleAddTrip} 
          loading={loading} 
          t={t}
          isCollapsed={isFormCollapsed}
          onToggleCollapse={() => setIsFormCollapsed(!isFormCollapsed)}
        />

           {/* Payment Form */}
        <PaymentForm 
          onSubmit={handleRecordPayment} 
          loading={loading} 
          t={t}
          isCollapsed={isPaymentFormCollapsed}
          onToggleCollapse={() => setIsPaymentFormCollapsed(!isPaymentFormCollapsed)}
        />
        
      </main>

      {/* Loading Spinner Overlay */}
      {loading && <LoadingSpinner message="Processing..." />}
    </div>
  );
}

export default App;