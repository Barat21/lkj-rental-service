import { VanRentalTrip } from '../services/api';

export const exportToExcel = (trips: VanRentalTrip[]) => {
  // Create CSV content
  const headers = [
    'Trip ID',
    'Van Number',
    'Date',
    'Pickup Location',
    'Dropoff Location',
    'Wayment',
    'No of Bags',
    'Rent',
    'Misc Spending',
    'Total Rent'
  ];

  const csvContent = [
    headers.join(','),
    ...trips.map(trip => [
      trip.id,
      `"${trip.vanNumber}"`,
      trip.date,
      `"${trip.pickupLocation}"`,
      `"${trip.dropoffLocation}"`,
      trip.wayment,
      trip.noOfBags,
      trip.rent,
      trip.miscSpending,
      trip.totalRent
    ].join(',')),
    // Add total row
    `,,,,,,,,Total:,${trips.reduce((sum, trip) => sum + trip.totalRent, 0)}`
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `van-rental-trips-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};