// Mock API service for van rental application

export interface VanSuggestion {
  vanNumber: string;
  isActive: boolean;
}

// Mock van numbers database
const mockVanNumbers: VanSuggestion[] = [
  { vanNumber: 'TN01 AB1234', isActive: true },
  { vanNumber: 'TN01 AB1235', isActive: true },
  { vanNumber: 'TN01 AB1236', isActive: false },
  { vanNumber: 'TN02 CD5678', isActive: true },
  { vanNumber: 'TN02 CD5679', isActive: true },
  { vanNumber: 'TN03 EF9012', isActive: false },
  { vanNumber: 'TN09 GH3456', isActive: true },
  { vanNumber: 'TN09 GH3457', isActive: true },
  { vanNumber: 'TN10 IJ7890', isActive: true },
  { vanNumber: 'TN11 KL2345', isActive: false },
  { vanNumber: 'TN12 MN6789', isActive: true },
  { vanNumber: 'TN13 OP0123', isActive: true },
  { vanNumber: 'TN14 QR4567', isActive: true },
  { vanNumber: 'TN15 ST8901', isActive: false },
  { vanNumber: 'TN16 UV2345', isActive: true },
];

// Mock location-based rent data
const locationRentData: Record<string, number> = {
  'chennai': 150,
  'bangalore': 180,
  'coimbatore': 120,
  'madurai': 110,
  'salem': 100,
  'tirupur': 95,
  'erode': 90,
  'vellore': 105,
  'tirunelveli': 115,
  'thanjavur': 100,
  'trichy': 125,
  'kanchipuram': 130,
  'airport': 200,
  'bus stand': 80,
  'railway station': 85,
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAPI = {
  // Get van number suggestions based on input
  async getVanSuggestions(query: string): Promise<VanSuggestion[]> {
    await delay(300); // Simulate network delay
    
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');
    
    return mockVanNumbers.filter(van => 
      van.vanNumber.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery)
    ).slice(0, 5); // Limit to 5 suggestions
  },

  // Get rent based on pickup and dropoff locations
  async getRentByLocation(pickupLocation: string, dropoffLocation: string): Promise<number> {
    await delay(500); // Simulate network delay
    
    const pickup = pickupLocation.toLowerCase().trim();
    const dropoff = dropoffLocation.toLowerCase().trim();
    
    // Base rent calculation
    let baseRent = 100;
    
    // Check for specific locations in pickup
    for (const [location, rent] of Object.entries(locationRentData)) {
      if (pickup.includes(location)) {
        baseRent = Math.max(baseRent, rent);
        break;
      }
    }
    
    // Check for specific locations in dropoff and apply premium
    for (const [location, rent] of Object.entries(locationRentData)) {
      if (dropoff.includes(location)) {
        baseRent = Math.max(baseRent, rent);
        break;
      }
    }
    
    // Apply distance-based premium (mock calculation)
    const distancePremium = Math.floor(Math.random() * 50); // Random 0-50 premium
    
    // Apply pickup location premiums
    if (pickup.includes('chennai')) baseRent += 20;
    if (pickup.includes('airport')) baseRent += 30;
    if (pickup.includes('bangalore')) baseRent += 25;
    
    // Apply dropoff location premiums
    if (dropoff.includes('chennai')) baseRent += 15;
    if (dropoff.includes('airport')) baseRent += 25;
    if (dropoff.includes('bangalore')) baseRent += 20;
    
    return Math.max(baseRent + distancePremium, 80); // Minimum rent of 80
  }
};