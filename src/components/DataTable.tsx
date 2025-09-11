import React, { useState } from 'react';
import { Edit2, Save, X, Download, Trash2, Printer } from 'lucide-react';
import { VanRentalTrip } from '../services/api';
import { Translations } from '../utils/translations';

interface DataTableProps {
  trips: VanRentalTrip[];
  onUpdate: (id: string, updates: Partial<VanRentalTrip>) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onPrint: () => void;
  loading?: boolean;
  t: Translations;
}

export const DataTable: React.FC<DataTableProps> = ({
  trips, 
  onUpdate, 
  onDelete, 
  onExport, 
  onPrint,
  loading,
  t
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<VanRentalTrip>>({});

  const totalRentSum = trips.reduce((sum, trip) => sum + trip.totalRent, 0);

  const startEdit = (trip: VanRentalTrip) => {
    setEditingId(trip.id);
    setEditData(trip);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (editingId && editData) {
      // Recalculate dependent fields
      const wayment = editData.wayment || 0;
      const rent = editData.rent || 0;
      const miscSpending = editData.miscSpending || 0;
      const noOfBags = Math.floor(wayment / 78);
      const totalRent = Math.round(noOfBags * rent + miscSpending);

      onUpdate(editingId, {
        ...editData,
        noOfBags,
        totalRent
      });
    }
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderCell = (trip: VanRentalTrip, field: keyof VanRentalTrip, isReadOnly = false) => {
    const isEditing = editingId === trip.id;
    const value = isEditing ? (editData[field] ?? trip[field]) : trip[field];

    if (!isEditing || isReadOnly) {
      return (
        <span className={field === 'totalRent' ? 'font-semibold text-green-600' : ''}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      );
    }

    if (field === 'date') {
      return (
        <input
          type="date"
          value={value as string}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
        />
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleEditChange(field, parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
          min="0"
          step={field === 'rent' || field === 'miscSpending' ? '0.01' : '1'}
        />
      );
    }

    return (
      <input
        type="text"
        value={value as string}
        onChange={(e) => handleEditChange(field, e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
      />
    );
  };

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">{t.noTripsFound}</p>
        <p className="text-gray-400 text-sm mt-2">{t.addTripToStart}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{t.tripRecords}</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onPrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={onExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t.exportToExcel}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.tripId}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.vanNumber}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.date}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.pickup}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.dropoff}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.wayment}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.bags}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.rent}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.misc}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.totalRent}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trip.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'vanNumber')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'date')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'pickupLocation')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'dropoffLocation')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'wayment')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'noOfBags', true)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'rent')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'miscSpending')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(trip, 'totalRent', true)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {editingId === trip.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-700 transition-colors"
                         title={t.saveChanges}
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                         title={t.cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(trip)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                         title={t.editTrip}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(trip.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                         title={t.deleteTrip}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={9} className="px-6 py-4 text-right font-semibold text-gray-900">
                {t.totalRentSum}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                {totalRentSum.toLocaleString()}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};