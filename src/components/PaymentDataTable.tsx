import React, { useState } from 'react';
import { CreditCard as Edit2, Save, X, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Payment } from '../services/api';
import { Translations } from '../utils/translations';

interface PaymentDataTableProps {
  payments: Payment[];
  onUpdate: (id: string, updates: Partial<Payment>) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  loading?: boolean;
  t: Translations;
}

export const PaymentDataTable: React.FC<PaymentDataTableProps> = ({
  payments, 
  onUpdate, 
  onDelete, 
  onExport, 
  loading,
  t
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Payment>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPaymentSum = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Pagination calculations
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = itemsPerPage === -1 ? payments : payments.slice(startIndex, endIndex);
  
  // Reset to first page when payments change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [payments.length]);

  const startEdit = (payment: Payment) => {
    setEditingId(payment.id);
    setEditData(payment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (editingId && editData) {
      const amount = typeof editData.amount === 'string' ? parseFloat(editData.amount) || 0 : editData.amount || 0;

      onUpdate(editingId, {
        ...editData,
        amount
      });
    }
    setEditingId(null);
    setEditData({});
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleEditChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderCell = (payment: Payment, field: keyof Payment, isReadOnly = false) => {
    const isEditing = editingId === payment.id;
    const value = isEditing ? (editData[field] ?? payment[field]) : payment[field];

    if (!isEditing || isReadOnly) {
      return (
        <span className={field === 'amount' ? 'font-semibold text-green-600' : ''}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      );
    }

    if (field === 'fromDate' || field === 'toDate' || field === 'paymentDate') {
      return (
        <input
          type="date"
          value={value as string}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
        />
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
        />
      );
    }

    return (
      <input
        type="text"
        value={value as string}
        onChange={(e) => handleEditChange(field, e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
      />
    );
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">{t.noPaymentsFound}</p>
        <p className="text-gray-400 text-sm mt-2">{t.addPaymentToStart}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{t.paymentRecords}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <button
            onClick={onExport}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t.exportToPDF}
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      {itemsPerPage !== -1 && payments.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, payments.length)} of {payments.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.vanNumber}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.fromDate}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.toDate}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.amount}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.paymentDate}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(payment, 'vanNumber')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(payment, 'fromDate')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(payment, 'toDate')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(payment, 'amount')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderCell(payment, 'paymentDate', true)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {editingId === payment.id ? (
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
                          onClick={() => startEdit(payment)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                         title={t.editPayment}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(payment.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                         title={t.deletePayment}
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
              <td colSpan={4} className="px-6 py-4 text-right font-semibold text-gray-900">
                {t.totalPaymentSum}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                {itemsPerPage === -1 ? totalPaymentSum.toLocaleString() : 
                 `${currentPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()} / ${totalPaymentSum.toLocaleString()}`}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Pagination */}
      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === pageNum
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};