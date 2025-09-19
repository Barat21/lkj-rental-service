import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { VanRentalTrip } from '../services/api';
import { realAPI, VanSuggestion } from '../services/mockApi';
import { Translations } from '../utils/translations';

interface TripFormProps {
  onSubmit: (trip: Omit<VanRentalTrip, 'id'>) => void;
  loading?: boolean;
  t: Translations;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TripForm: React.FC<TripFormProps> = ({ 
  onSubmit, 
  loading, 
  t, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [formData, setFormData] = useState({
    vanNumber: '',
    date: '',
    pickupLocation: '',
    dropoffLocation: '',
    wayment: '',
    rent: '',
    miscSpending: ''
  });
  const [vanSuggestions, setVanSuggestions] = useState<VanSuggestion[]>([]);
  const [showVanSuggestions, setShowVanSuggestions] = useState(false);
  const [loadingRent, setLoadingRent] = useState(false);

  const waymentNum = parseFloat(formData.wayment) || 0;
  const rentNum = parseFloat(formData.rent) || 0;
  const miscNum = parseFloat(formData.miscSpending) || 0;
  const noOfBags = Math.floor(waymentNum / 78);
  const totalRent = Math.round(noOfBags * rentNum + miscNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vanNumber: formData.vanNumber,
      date: formData.date,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      wayment: waymentNum,
      rent: rentNum,
      miscSpending: miscNum,
      noOfBags,
      totalRent
    });
    setFormData({
      vanNumber: '',
      date: '',
      pickupLocation: '',
      dropoffLocation: '',
      wayment: '',
      rent: '',
      miscSpending: ''
    });
    setVanSuggestions([]);
    setShowVanSuggestions(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVanNumberChange = async (value: string) => {
    handleInputChange('vanNumber', value);
    
    if (value.length > 0) {
      try {
        const suggestions = await realAPI.getVanSuggestions(value);
        setVanSuggestions(suggestions);
        setShowVanSuggestions(true);
      } catch (error) {
        console.error('Error fetching van suggestions:', error);
      }
    } else {
      setVanSuggestions([]);
      setShowVanSuggestions(false);
    }
  };

  const selectVanSuggestion = (vanNumber: string) => {
    handleInputChange('vanNumber', vanNumber);
    setShowVanSuggestions(false);
    setVanSuggestions([]);
  };

  const handlePickupLocationChange = async (value: string) => {
    handleInputChange('pickupLocation', value);
    
    if (value.trim().length > 2 && formData.dropoffLocation.trim().length > 0) {
      setLoadingRent(true);
      try {
        const rent = await realAPI.getRentByLocation(value, formData.dropoffLocation);
        handleInputChange('rent', rent.toString());
      } catch (error) {
        console.error('Error fetching rent information:', error);
      } finally {
        setLoadingRent(false);
      }
    }
  };

  const handleDropoffLocationChange = async (value: string) => {
    handleInputChange('dropoffLocation', value);
    
    if (value.trim().length > 2 && formData.pickupLocation.trim().length > 0) {
      setLoadingRent(true);
      try {
        const rent = await realAPI.getRentByLocation(formData.pickupLocation, value);
        handleInputChange('rent', rent.toString());
      } catch (error) {
        console.error('Error fetching rent information:', error);
      } finally {
        setLoadingRent(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Plus className="h-5 w-5 text-blue-600" onClick={onToggleCollapse}/>
          </div>
          <h2 className="text-xl font-semibold text-gray-900"
          onClick={onToggleCollapse}>{t.addNewTrip}</h2>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.vanNumber}
              </label>
              <input
                type="text"
                value={formData.vanNumber}
                onChange={(e) => handleVanNumberChange(e.target.value)}
                onFocus={() => {
                  if (vanSuggestions.length > 0) {
                    setShowVanSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking
                  setTimeout(() => setShowVanSuggestions(false), 200);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t.vanNumberPlaceholder}
                required
              />
              {showVanSuggestions && vanSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {vanSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectVanSuggestion(suggestion.vanNumber)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span>{suggestion.vanNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {suggestion.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.date}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.pickupLocation}
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => handlePickupLocationChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  loadingRent ? 'bg-gray-50' : ''
                }`}
                placeholder={t.pickupPlaceholder}
                required
              />
              {loadingRent && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                  Loading rent information...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.dropoffLocation}
              </label>
              <input
                type="text"
                value={formData.dropoffLocation}
                onChange={(e) => handleDropoffLocationChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  loadingRent ? 'bg-gray-50' : ''
                }`}
                placeholder={t.dropoffPlaceholder}
                required
              />
              {loadingRent && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                  Loading rent information...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.wayment}
              </label>
              <input
                type="text"
                value={formData.wayment}
                onChange={(e) => handleInputChange('wayment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="156"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.noOfBags}
              </label>
              <input
                type="number"
                value={noOfBags}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">{t.autoCalculatedBags}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.rent}
              </label>
              <input
                type="text"
                value={formData.rent}
                onChange={(e) => handleInputChange('rent', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  loadingRent ? 'bg-blue-50 border-blue-300' : ''
                }`}
                placeholder="150"
                required
              />
              {loadingRent && (
                <p className="text-xs text-blue-600 mt-1">Auto-filling based on location...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.miscSpending}
              </label>
              <input
                type="text"
                value={formData.miscSpending}
                onChange={(e) => handleInputChange('miscSpending', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.totalRent}
              </label>
              <input
                type="number"
                value={totalRent}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 font-medium"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">{t.autoCalculatedTotal}</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {t.adding}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t.addTrip}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};