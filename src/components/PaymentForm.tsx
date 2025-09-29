import React, { useState } from 'react';
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { realAPI, VanSuggestion } from '../services/mockApi';
import { Translations } from '../utils/translations';

interface PaymentFormProps {
  onSubmit: (paymentData: {
    vanNumber: string;
    startDate: string;
    endDate: string;
    amount: number;
    transactionDate: string;
  }) => void;
  loading?: boolean;
  t: Translations;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ 
  onSubmit, 
  loading, 
  t, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [formData, setFormData] = useState({
    vanNumber: '',
    startDate: '',
    endDate: '',
    amount: '',
    transactionDate: ''
  });
  const [vanSuggestions, setVanSuggestions] = useState<VanSuggestion[]>([]);
  const [showVanSuggestions, setShowVanSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vanNumber: formData.vanNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      amount: parseFloat(formData.amount) || 0,
      transactionDate: formData.transactionDate
    });
    setFormData({
      vanNumber: '',
      startDate: '',
      endDate: '',
      amount: '',
      transactionDate: ''
    });
    setVanSuggestions([]);
    setShowVanSuggestions(false);
  };

  const handleInputChange = (field: string, value: string) => {
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CreditCard className="h-5 w-5 text-green-600" onClick={onToggleCollapse}/>
          </div>
          <h2 className="text-xl font-semibold text-gray-900"
          onClick={onToggleCollapse}>Record Payment</h2>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Van Number
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
                  setTimeout(() => setShowVanSuggestions(false), 200);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                From Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Date
              </label>
              <input
                type="date"
                value={formData.transactionDate}
                onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};