import { VanRentalTrip } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Alternative method using HTML table for better Unicode support
const exportViaHTML = async (trips: VanRentalTrip[], advanceAmount: number = 0) => {
  const totalRentSum = trips.reduce((sum, trip) => sum + trip.totalRent, 0);
  const balanceAmount = totalRentSum - advanceAmount;

  // Create a temporary HTML table
  const tableHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: white;">
      <h1 style="text-align: center; margin-bottom: 10px;">LKJ Rental Service</h1>
      <h2 style="text-align: center; margin-bottom: 20px; font-size: 16px;">Trip Records Report</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #2563eb; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Trip ID</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Van Number</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Pickup Location</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Dropoff Location</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Wayment</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Bags</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Rent</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Misc</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Rent</th>
          </tr>
        </thead>
        <tbody>
          ${trips.map((trip, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.id}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.vanNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.date}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.pickupLocation}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.dropoffLocation}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.wayment.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.noOfBags}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.rent.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.miscSpending.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${trip.totalRent.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="9" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Amount:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${totalRentSum.toLocaleString()}</td>
          </tr>
          ${advanceAmount > 0 ? `
            <tr style="background-color: #fff3cd; font-weight: bold;">
              <td colspan="9" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Advance Given:</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #856404;">-${advanceAmount.toLocaleString()}</td>
            </tr>
            <tr style="background-color: #d4edda; font-weight: bold;">
              <td colspan="9" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Balance Amount:</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #155724;">${balanceAmount.toLocaleString()}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
      <div style="margin-top: 20px; font-size: 10px;">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${trips.length}</p>
        ${advanceAmount > 0 ? `<p>Advance Amount: ${advanceAmount.toLocaleString()}</p>` : ''}
        ${advanceAmount > 0 ? `<p>Balance Amount: ${balanceAmount.toLocaleString()}</p>` : ''}
      </div>
    </div>
  `;

  // Create a temporary div
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = tableHTML;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '1200px';
  document.body.appendChild(tempDiv);

  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    const imgWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(`LKJ-Rental-Trips-${timestamp}.pdf`);

  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

export const exportToPDF = async (trips: VanRentalTrip[], advanceAmount: number = 0) => {
  try {
    // Try the HTML-to-canvas method for better Unicode support
    await exportViaHTML(trips, advanceAmount);
  } catch (error) {
    console.error('HTML export failed, falling back to basic PDF:', error);
    
    const totalRentSum = trips.reduce((sum, trip) => sum + trip.totalRent, 0);
    const balanceAmount = totalRentSum - advanceAmount;
    
    // Fallback to basic jsPDF method
    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.text('LKJ Rental Service', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Trip Records Report', 105, 30, { align: 'center' });
    
    const headers = [
      'Trip ID', 'Van Number', 'Date', 'Pickup Location', 'Dropoff Location',
      'Wayment', 'Bags', 'Rent', 'Misc', 'Total Rent'
    ];
    
    const data = trips.map(trip => [
      trip.id,
      trip.vanNumber,
      trip.date,
      trip.pickupLocation,
      trip.dropoffLocation,
      trip.wayment.toLocaleString(),
      trip.noOfBags.toString(),
      trip.rent.toLocaleString(),
      trip.miscSpending.toLocaleString(),
      trip.totalRent.toLocaleString()
    ]);
    
    // Add summary rows
    data.push(['', '', '', '', '', '', '', '', 'Total Amount:', totalRentSum.toLocaleString()]);
    if (advanceAmount > 0) {
      data.push(['', '', '', '', '', '', '', '', 'Advance Given:', `-${advanceAmount.toLocaleString()}`]);
      data.push(['', '', '', '', '', '', '', '', 'Balance Amount:', balanceAmount.toLocaleString()]);
    }
    
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold'
      },
      didParseCell: function (data) {
        // Style the summary rows
        if (data.row.index >= trips.length) {
          data.cell.styles.fontStyle = 'bold';
          if (data.cell.text[0]?.includes('Advance')) {
            data.cell.styles.textColor = [133, 100, 4]; // Brown color for advance
          } else if (data.cell.text[0]?.includes('Balance')) {
            data.cell.styles.textColor = [21, 87, 36]; // Green color for balance
          }
        }
      },
      columnStyles: {
        3: { cellWidth: 40 },
        4: { cellWidth: 40 }
      }
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`LKJ-Rental-Trips-${timestamp}.pdf`);
  }
};