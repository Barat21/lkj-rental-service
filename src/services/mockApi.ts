// Real API service for van rental application

export interface VanSuggestion {
  vanNumber: string;
  isActive: boolean;
}

const API_BASE = "https://van-rental-service.onrender.com/api/trips";

export const realAPI = {
  // Get van number suggestions from real API
  async getVanSuggestions(query: string): Promise<VanSuggestion[]> {
    try {
      const response = await fetch(`${API_BASE}/getVanNumbers`);
      if (!response.ok) {
        throw new Error('Failed to fetch van numbers');
      }
      
      const vanNumbers: string[] = await response.json();
      
      // Filter based on query and format as VanSuggestion objects
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');
      
      return vanNumbers
        .filter(vanNumber => 
          vanNumber.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery)
        )
        .slice(0, 5) // Limit to 5 suggestions
        .map(vanNumber => ({
          vanNumber,
          isActive: true // Assuming all returned van numbers are active
        }));
    } catch (error) {
      console.error('Error fetching van suggestions:', error);
      return [];
    }
  },

  // Get rent based on pickup and dropoff locations from real API
  async getRentByLocation(pickupLocation: string, dropoffLocation: string): Promise<number> {
    try {
      const params = new URLSearchParams({
        pickup: pickupLocation.trim(),
        dropOff: dropoffLocation.trim()
      });
      
      const response = await fetch(`${API_BASE}/calculateRate?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to calculate rate');
      }
      
      const rate = await response.json();
      return typeof rate === 'number' ? rate : 100; // Default to 100 if invalid response
    } catch (error) {
      console.error('Error calculating rate:', error);
      return 100; // Default rate on error
    }
  }
}