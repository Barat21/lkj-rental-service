import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { VanRentalTrip } from '../services/api';
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
    wayment: 0,
    rent: 0,
    miscSpending: 0
  });

  const noOfBags = Math.floor(formData.wayment / 78);
  const totalRent = Math.round(noOfBags * formData.rent + formData.miscSpending);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      noOfBags,
      totalRent
    });
    setFormData({
      vanNumber: '',
      date: '',
      pickupLocation: '',
      dropoffLocation: '',
      wayment: 0,
      rent: 0,
      miscSpending: 0
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.vanNumber}
              </label>
              <input
                type="text"
                value={formData.vanNumber}
                onChange={(e) => handleInputChange('vanNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t.vanNumberPlaceholder}
                required
              />
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
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t.pickupPlaceholder}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.dropoffLocation}
              </label>
              <input
                type="text"
                value={formData.dropoffLocation}
                onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t.dropoffPlaceholder}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.wayment}
              </label>
              <input
                type="number"
                value={formData.wayment}
                onChange={(e) => handleInputChange('wayment', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="156"
                min="0"
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
                type="number"
                value={formData.rent}
                onChange={(e) => handleInputChange('rent', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="150"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.miscSpending}
              </label>
              <input
                type="number"
                value={formData.miscSpending}
                onChange={(e) => handleInputChange('miscSpending', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="25"
                min="0"
                step="0.01"
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