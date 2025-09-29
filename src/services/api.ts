// Service layer for Van Rental data (real API calls)
export interface VanRentalTrip {
  id: string;
  vanNumber: string;
  date: string;
  pickupLocation: string;
  dropoffLocation: string;
  wayment: number;
  noOfBags: number;
  rent: number;
  miscSpending: number;
  totalRent: number;
  paid?: boolean;
}

const API_BASE = "https://van-rental-service.onrender.com/api/trips"; // Spring Boot backend URL

export const vanRentalAPI = {
  // Get all trips
  getAllTrips: async (): Promise<VanRentalTrip[]> => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch trips");
    return res.json();
  },

  // Create a new trip
  createTrip: async (trip: Omit<VanRentalTrip, "id">): Promise<VanRentalTrip> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error("Failed to create trip");
    return res.json();
  },

  // Update a trip
  updateTrip: async (id: string, updates: Partial<VanRentalTrip>): Promise<VanRentalTrip> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update trip");
    return res.json();
  },

  // Delete a trip
  deleteTrip: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete trip");
  },

  // Search trips (general search)
  searchTrips: async (query: string): Promise<VanRentalTrip[]> => {
    const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to search trips");
    return res.json();
  },

  // Search by date range and van number
  searchByDateAndVan: async (startDate: string, endDate: string, vanNumber: string): Promise<VanRentalTrip[]> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      vanNumber,
    });
    const res = await fetch(`${API_BASE}/filter?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search by date and van");
    return res.json();
  },

  // Record payment
  recordPayment: async (startDate: string, endDate: string, vanNumber: string, transactionDate: string, amount: number): Promise<void> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      vanNumber,
      transactionDate,
      amount: amount.toString(),
    });
    const res = await fetch(`${API_BASE}/recordPayment?${params.toString()}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to record payment");
  },

  // Search with payment status filter
  searchTripsWithPaymentFilter: async (query: string, paymentStatus: 'all' | 'paid' | 'unpaid'): Promise<VanRentalTrip[]> => {
    const params = new URLSearchParams({
      query,
      paymentStatus,
    });
    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search trips");
    return res.json();
  },

  // Search by date, van and payment status
  searchByDateVanAndPayment: async (startDate: string, endDate: string, vanNumber: string, paymentStatus: 'all' | 'paid' | 'unpaid'): Promise<VanRentalTrip[]> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      vanNumber,
      paymentStatus,
    });
    const res = await fetch(`${API_BASE}/filter?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search by date, van and payment status");
    return res.json();
  },
};
