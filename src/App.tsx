import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, LogOut, CreditCard, FileText } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TripForm } from './components/TripForm';
import { PaymentForm } from './components/PaymentForm';
import { SearchBar } from './components/SearchBar';
import { DataTable } from './components/DataTable';
import { PaymentDataTable } from './components/PaymentDataTable';
import { LanguageToggle } from './components/LanguageToggle';
import { vanRentalAPI, VanRentalTrip, Payment } from './services/api';
import { mockPaymentAPI } from './services/mockPaymentApi';
import { exportToPDF } from './utils/export';
import { exportPaymentsToPDF } from './utils/paymentExport';
import { useTranslation } from './utils/translations';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [trips, setTrips] = useState<VanRentalTrip[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<VanRentalTrip[]>([]);
  const [paymentSearchResults, setPaymentSearchResults] = useState<Payment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaymentSearching, setIsPaymentSearching] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const [isPaymentFormCollapsed, setIsPaymentFormCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'trips' | 'payments'>('trips');
  
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
      loadPayments();
    }
  }, [isAuthenticated]);

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

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await mockPaymentAPI.getAllPayments();
      setPayments(data);
      setPaymentSearchResults(data);
    } catch (error) {
      console.error('Error loading payments:', error);
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

  const handleAddPayment = async (paymentData: Omit<Payment, 'id' | 'paymentDate'>) => {
    setLoading(true);
    try {
      const newPayment = await mockPaymentAPI.createPayment(paymentData);
      setPayments(prev => [...prev, newPayment]);
      if (!isPaymentSearching) {
        setPaymentSearchResults(prev => [...prev, newPayment]);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
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

  const handleUpdatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const updatedPayment = await mockPaymentAPI.updatePayment(id, updates);
      setPayments(prev => prev.map(payment => payment.id === id ? updatedPayment : payment));
      setPaymentSearchResults(prev => prev.map(payment => payment.id === id ? updatedPayment : payment));
    } catch (error) {
      console.error('Error updating payment:', error);
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

  const handleDeletePayment = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await mockPaymentAPI.deletePayment(id);
        setPayments(prev => prev.filter(payment => payment.id !== id));
        setPaymentSearchResults(prev => prev.filter(payment => payment.id !== id));
      } catch (error) {
        console.error('Error deleting payment:', error);
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

  const handlePaymentSearch = async (query: string) => {
    if (!query.trim()) {
      setPaymentSearchResults(payments);
      setIsPaymentSearching(false);
      return;
    }

    setLoading(true);
    setIsPaymentSearching(true);
    try {
      const results = await mockPaymentAPI.searchPayments(query);
      setPaymentSearchResults(results);
    } catch (error) {
      console.error('Error searching payments:', error);
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

  const handleAdvancedPaymentSearch = async (startDate: string, endDate: string, vanNumber: string) => {
    if (!startDate && !endDate && !vanNumber) {
      setPaymentSearchResults(payments);
      setIsPaymentSearching(false);
      return;
    }

    setLoading(true);
    setIsPaymentSearching(true);
    try {
      const results = await mockPaymentAPI.searchPaymentsByDateAndVan(
        startDate || '1900-01-01',
        endDate || '2100-12-31',
        vanNumber
      );
      setPaymentSearchResults(results);
    } catch (error) {
      console.error('Error in advanced payment search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (isPaid: boolean | null) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const results = await vanRentalAPI.searchByPaidStatus(isPaid);
      setSearchResults(results);
    } catch (error) {
      console.error('Error filtering by status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToPDF(searchResults);
  };

  const handlePaymentExport = () => {
    exportPaymentsToPDF(paymentSearchResults);
  };

  const handleRefresh = () => {
    if (activeTab === 'trips') {
      loadTrips();
      setIsSearching(false);
    } else {
      loadPayments();
      setIsPaymentSearching(false);
    }
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
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('trips')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'trips'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Trip Management
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'payments'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Payment Management
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'trips' ? (
          <>
        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onAdvancedSearch={handleAdvancedSearch}
          onStatusFilter={handleStatusFilter}
          loading={loading}
          t={t}
          showStatusFilter={true}
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
          </>
        ) : (
          <>
            {/* Payment Search Bar */}
            <SearchBar
              onSearch={handlePaymentSearch}
              onAdvancedSearch={handleAdvancedPaymentSearch}
              loading={loading}
              t={t}
              showStatusFilter={false}
            />

            {/* Payment Results Info */}
            {isPaymentSearching && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  {paymentSearchResults.length} {t.showingResults}
                  <button
                    onClick={() => {
                      loadPayments();
                      setIsPaymentSearching(false);
                    }}
                    className="ml-2 text-green-600 hover:text-green-700 underline"
                  >
                    Show all payments
                  </button>
                </p>
              </div>
            )}

            {/* Payment Data Table */}
            <PaymentDataTable
              payments={paymentSearchResults}
              onUpdate={handleUpdatePayment}
              onDelete={handleDeletePayment}
              onExport={handlePaymentExport}
              loading={loading}
              t={t}
            />

            {/* Payment Form - Now at the bottom and collapsible */}
            <PaymentForm 
              onSubmit={handleAddPayment} 
              loading={loading} 
              t={t}
              isCollapsed={isPaymentFormCollapsed}
              onToggleCollapse={() => setIsPaymentFormCollapsed(!isPaymentFormCollapsed)}
            />
          </>
        )}
      </main>

      {/* Loading Spinner Overlay */}
      {loading && <LoadingSpinner message="Processing..." />}
    </div>
  );
}

export default App;