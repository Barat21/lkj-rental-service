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
    const res = await fetch(`${API_BASE}/searchByDateAndVan?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search by date and van");
    return res.json();
  },
};
