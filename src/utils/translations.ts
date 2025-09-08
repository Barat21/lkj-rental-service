export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  refresh: string;

  // Form
  addNewTrip: string;
  vanNumber: string;
  date: string;
  pickupLocation: string;
  dropoffLocation: string;
  wayment: string;
  noOfBags: string;
  rent: string;
  miscSpending: string;
  totalRent: string;
  addTrip: string;
  adding: string;
  autoCalculated: string;
  autoCalculatedBags: string;
  autoCalculatedTotal: string;

  // Search
  searchTrips: string;
  advancedSearch: string;
  search: string;
  startDate: string;
  endDate: string;
  searchPlaceholder: string;

  // Table
  tripRecords: string;
  exportToExcel: string;
  tripId: string;
  pickup: string;
  dropoff: string;
  bags: string;
  misc: string;
  actions: string;
  totalRentSum: string;
  noTripsFound: string;
  addTripToStart: string;
  editTrip: string;
  deleteTrip: string;
  saveChanges: string;
  cancelEdit: string;

  // Messages
  showingResults: string;
  showAllTrips: string;
  deleteConfirm: string;

  // Placeholders
  vanNumberPlaceholder: string;
  pickupPlaceholder: string;
  dropoffPlaceholder: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // Header
    appTitle: "LKJ",
    appSubtitle: "",
    refresh: "Refresh",

    // Form
    addNewTrip: "Add New Trip",
    vanNumber: "Van Number",
    date: "Date",
    pickupLocation: "Pickup Location",
    dropoffLocation: "Dropoff Location",
    wayment: "Wayment",
    noOfBags: "No of Bags",
    rent: "Rent",
    miscSpending: "Misc Spending",
    totalRent: "Total Rent",
    addTrip: "Add Trip",
    adding: "Adding...",
    autoCalculated: "Auto-calculated",
    autoCalculatedBags: "Auto-calculated (Wayment ÷ 78)",
    autoCalculatedTotal: "Auto-calculated (Bags × Rent + Misc)",

    // Search
    searchTrips: "Search Trips",
    advancedSearch: "Advanced Search",
    search: "Search",
    startDate: "Start Date",
    endDate: "End Date",
    searchPlaceholder: "Search by Trip ID, Van Number, Location...",

    // Table
    tripRecords: "Trip Records",
    exportToExcel: "Export to Excel",
    tripId: "Trip ID",
    pickup: "Pickup",
    dropoff: "Dropoff",
    bags: "Bags",
    misc: "Misc",
    actions: "Actions",
    totalRentSum: "Total Rent Sum:",
    noTripsFound: "No trips found",
    addTripToStart: "Add a new trip to get started",
    editTrip: "Edit trip",
    deleteTrip: "Delete trip",
    saveChanges: "Save changes",
    cancelEdit: "Cancel edit",

    // Messages
    showingResults: "search results",
    showAllTrips: "Show all trips",
    deleteConfirm: "Are you sure you want to delete this trip?",

    // Placeholders
    vanNumberPlaceholder: "VAN-101",
    pickupPlaceholder: "Downtown Station",
    dropoffPlaceholder: "Airport Terminal"
  },
  ta: {
    // Header
    appTitle: "LKJ",
    appSubtitle: "",
    refresh: "புதுப்பிக்கவும்",

    // Form
    addNewTrip: "புதிய பயணம் சேர்க்கவும்",
    vanNumber: "வேன் எண்",
    date: "தேதி",
    pickupLocation: "எடுக்கும் இடம்",
    dropoffLocation: "விடும் இடம்",
    wayment: "வேமென்ட்",
    noOfBags: "பைகளின் எண்ணிக்கை",
    rent: "வாடகை",
    miscSpending: "பிற செலவுகள்",
    totalRent: "மொத்த வாடகை",
    addTrip: "பயணம் சேர்க்கவும்",
    adding: "சேர்க்கிறது...",
    autoCalculated: "தானாக கணக்கிடப்பட்டது",
    autoCalculatedBags: "தானாக கணக்கிடப்பட்டது (வேமென்ட் ÷ 78)",
    autoCalculatedTotal: "தானாக கணக்கிடப்பட்டது (பைகள் × வாடகை + பிற)",

    // Search
    searchTrips: "பயணங்களை தேடவும்",
    advancedSearch: "மேம்பட்ட தேடல்",
    search: "தேடவும்",
    startDate: "தொடக்க தேதி",
    endDate: "முடிவு தேதி",
    searchPlaceholder: "பயண ஐடி, வேன் எண், இடம் மூலம் தேடவும்...",

    // Table
    tripRecords: "பயண பதிவுகள்",
    exportToExcel: "எக்செல் ஏற்றுமதி",
    tripId: "பயண ஐடி",
    pickup: "எடுக்கும் இடம்",
    dropoff: "விடும் இடம்",
    bags: "பைகள்",
    misc: "பிற",
    actions: "செயல்கள்",
    totalRentSum: "மொத்த வாடகை தொகை:",
    noTripsFound: "பயணங்கள் இல்லை",
    addTripToStart: "தொடங்க புதிய பயணம் சேர்க்கவும்",
    editTrip: "பயணத்தை திருத்தவும்",
    deleteTrip: "பயணத்தை நீக்கவும்",
    saveChanges: "மாற்றங்களை சேமிக்கவும்",
    cancelEdit: "திருத்தலை ரத்து செய்யவும்",

    // Messages
    showingResults: "தேடல் முடிவுகள்",
    showAllTrips: "அனைத்து பயணங்களையும் காட்டவும்",
    deleteConfirm: "இந்த பயணத்தை நீக்க விரும்புகிறீர்களா?",

    // Placeholders
    vanNumberPlaceholder: "வேன்-101",
    pickupPlaceholder: "நகர மையம்",
    dropoffPlaceholder: "விமான நிலையம்"
  }
};

export const useTranslation = (language: string) => {
  return translations[language] || translations.en;
};