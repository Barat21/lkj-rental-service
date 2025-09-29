// Mock API service for payments - will be replaced with real API later
import { Payment } from './api';

// Mock data storage
let mockPayments: Payment[] = [
  {
    id: '1',
    vanNumber: 'TN01 AB1234',
    fromDate: '2024-01-01',
    toDate: '2024-01-15',
    amount: 15000,
    paymentDate: '2024-01-16'
  },
  {
    id: '2',
    vanNumber: 'TN02 CD5678',
    fromDate: '2024-01-01',
    toDate: '2024-01-10',
    amount: 12000,
    paymentDate: '2024-01-11'
  }
];

let nextId = 3;

export const mockPaymentAPI = {
  // Get all payments
  getAllPayments: async (): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return [...mockPayments];
  },

  // Create a new payment
  createPayment: async (payment: Omit<Payment, "id" | "paymentDate">): Promise<Payment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPayment: Payment = {
      ...payment,
      id: nextId.toString(),
      paymentDate: new Date().toISOString().split('T')[0]
    };
    mockPayments.push(newPayment);
    nextId++;
    return newPayment;
  },

  // Update a payment
  updatePayment: async (id: string, updates: Partial<Payment>): Promise<Payment> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    
    mockPayments[index] = { ...mockPayments[index], ...updates };
    return mockPayments[index];
  },

  // Delete a payment
  deletePayment: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    
    mockPayments.splice(index, 1);
  },

  // Search payments
  searchPayments: async (query: string): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockPayments.filter(payment =>
      payment.vanNumber.toLowerCase().includes(lowerQuery) ||
      payment.id.toLowerCase().includes(lowerQuery) ||
      payment.amount.toString().includes(lowerQuery)
    );
  },

  // Search by date range and van number
  searchPaymentsByDateAndVan: async (startDate: string, endDate: string, vanNumber: string): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPayments.filter(payment => {
      const matchesVan = !vanNumber || payment.vanNumber.toLowerCase().includes(vanNumber.toLowerCase());
      const matchesDateRange = (!startDate || payment.fromDate >= startDate) && 
                              (!endDate || payment.toDate <= endDate);
      return matchesVan && matchesDateRange;
    });
  }
};