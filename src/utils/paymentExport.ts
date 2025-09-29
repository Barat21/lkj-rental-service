import { Payment } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Alternative method using HTML table for better Unicode support
const exportPaymentsViaHTML = async (payments: Payment[]) => {
  // Create a temporary HTML table
  const tableHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: white;">
      <h1 style="text-align: center; margin-bottom: 10px;">LKJ Rental Service</h1>
      <h2 style="text-align: center; margin-bottom: 20px; font-size: 16px;">Payment Records Report</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #059669; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Payment ID</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Van Number</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">From Date</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">To Date</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Payment Date</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map((payment, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
              <td style="border: 1px solid #ddd; padding: 8px;">${payment.id}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${payment.vanNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${payment.fromDate}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${payment.toDate}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${payment.amount.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${payment.paymentDate}</td>
            </tr>
          `).join('')}
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;"></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px; font-size: 10px;">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${payments.length}</p>
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
    pdf.save(`LKJ-Payment-Records-${timestamp}.pdf`);

  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

export const exportPaymentsToPDF = async (payments: Payment[]) => {
  try {
    // Try the HTML-to-canvas method for better Unicode support
    await exportPaymentsViaHTML(payments);
  } catch (error) {
    console.error('HTML export failed, falling back to basic PDF:', error);
    
    // Fallback to basic jsPDF method
    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.text('LKJ Rental Service', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Payment Records Report', 105, 30, { align: 'center' });
    
    const headers = [
      'Payment ID', 'Van Number', 'From Date', 'To Date', 'Amount', 'Payment Date'
    ];
    
    const data = payments.map(payment => [
      payment.id,
      payment.vanNumber,
      payment.fromDate,
      payment.toDate,
      payment.amount.toLocaleString(),
      payment.paymentDate
    ]);
    
    const totalAmountSum = payments.reduce((sum, payment) => sum + payment.amount, 0);
    data.push(['', '', '', 'Total:', totalAmountSum.toLocaleString(), '']);
    
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
        fillColor: [5, 150, 105],
        textColor: 255,
        fontStyle: 'bold'
      }
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`LKJ-Payment-Records-${timestamp}.pdf`);
  }
};