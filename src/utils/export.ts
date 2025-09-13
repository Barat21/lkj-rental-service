import { VanRentalTrip } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Function to convert Tamil text to a format that displays correctly in PDF
const formatTextForPDF = (text: string): string => {
  // For Tamil text, we'll use a fallback approach
  // If the text contains Tamil characters, we'll transliterate or use English equivalents
  const tamilPattern = /[\u0B80-\u0BFF]/;
  
  if (tamilPattern.test(text)) {
    // Common Tamil to English mappings for locations
    const tamilToEnglish: { [key: string]: string } = {
      'சென்னை': 'Chennai',
      'திண்டிவனம்': 'Tindivanam',
      'கடலூர்': 'Cuddalore',
      'பாண்டிச்சேரி': 'Puducherry',
      'விழுப்புரம்': 'Villupuram',
      'கல்லக்குறிச்சி': 'Kallakurichi',
      'சேலம்': 'Salem',
      'கோவை': 'Coimbatore',
      'மதுரை': 'Madurai',
      'திருச்சி': 'Trichy',
      'தஞ்சாவூர்': 'Thanjavur',
      'திருநெல்வேலி': 'Tirunelveli',
      'கன்னியாகுமரி': 'Kanyakumari',
      'ஈரோடு': 'Erode',
      'திருப்பூர்': 'Tirupur',
      'வேலூர்': 'Vellore',
      'திருவண்ணாமலை': 'Tiruvannamalai',
      'கரூர்': 'Karur',
      'நாமக்கல்': 'Namakkal',
      'தர்மபுரி': 'Dharmapuri',
      'கிருஷ்ணகிரி': 'Krishnagiri',
      'ராமநாதபுரம்': 'Ramanathapuram',
      'சிவகங்கை': 'Sivaganga',
      'புதுக்கோட்டை': 'Pudukkottai',
      'பெரம்பலூர்': 'Perambalur',
      'அரியலூர்': 'Ariyalur',
      'நாகப்பட்டினம்': 'Nagapattinam',
      'திருவாரூர்': 'Tiruvarur',
      'டிண்டுக்கல்': 'Dindigul',
      'தேனி': 'Theni',
      'விருதுநகர்': 'Virudhunagar',
      'தூத்துக்குடி': 'Thoothukudi',
      'திருச்செந்தூர்': 'Tiruchendur'
    };

    // Try to find exact match first
    if (tamilToEnglish[text]) {
      return tamilToEnglish[text];
    }

    // If no exact match, try partial matches
    for (const [tamil, english] of Object.entries(tamilToEnglish)) {
      if (text.includes(tamil)) {
        return text.replace(tamil, english);
      }
    }

    // If no mapping found, return transliterated version (remove Tamil characters)
    return text.replace(/[\u0B80-\u0BFF]/g, '?');
  }

  return text;
};

export const exportToPDF = (trips: VanRentalTrip[]) => {
  const doc = new jsPDF();
  
  // Set font to helvetica (better Unicode support)
  doc.setFont('helvetica');
  
  // Add title
  doc.setFontSize(20);
  doc.text('LKJ Rental Service', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Trip Records Report', 105, 30, { align: 'center' });
  
  // Prepare table data with proper text formatting
  const headers = [
    'Trip ID',
    'Van Number', 
    'Date',
    'Pickup',
    'Dropoff',
    'Wayment',
    'Bags',
    'Rent',
    'Misc',
    'Total'
  ];
  
  const data = trips.map(trip => [
    trip.id,
    trip.vanNumber,
    trip.date,
    formatTextForPDF(trip.pickupLocation),
    formatTextForPDF(trip.dropoffLocation),
    trip.wayment.toLocaleString(),
    trip.noOfBags.toString(),
    trip.rent.toLocaleString(),
    trip.miscSpending.toLocaleString(),
    trip.totalRent.toLocaleString()
  ]);
  
  // Add total row
  const totalRentSum = trips.reduce((sum, trip) => sum + trip.totalRent, 0);
  data.push([
    '', '', '', '', '', '', '', '', 'Total:', totalRentSum.toLocaleString()
  ]);
  
  // Create table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica',
      fontStyle: 'normal'
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: 50
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { cellWidth: 15 }, // Trip ID
      1: { cellWidth: 20 }, // Van Number
      2: { cellWidth: 20 }, // Date
      3: { cellWidth: 25 }, // Pickup
      4: { cellWidth: 25 }, // Dropoff
      5: { cellWidth: 18 }, // Wayment
      6: { cellWidth: 12 }, // Bags
      7: { cellWidth: 15 }, // Rent
      8: { cellWidth: 15 }, // Misc
      9: { cellWidth: 20 }  // Total
    },
    didParseCell: function(data) {
      // Make the total row bold
      if (data.row.index === trips.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [248, 249, 250];
      }
    }
  });
  
  // Add generation date
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 20);
  
  // Save the PDF
  doc.save(`van-rental-trips-${new Date().toISOString().split('T')[0]}.pdf`);
};