/**
 * Comprehensive Export and Download Utilities for Pharmacy Management System
 * Handles PDF, CSV, Excel, and thermal printing with proper formatting
 */

// Type definitions for different data formats
interface ExportOptions {
  filename?: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  title?: string;
  subtitle?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  orientation?: 'portrait' | 'landscape';
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ReportData {
  title: string;
  data: any[];
  summary?: Record<string, any>;
  metadata?: Record<string, any>;
}

// PDF Generation using HTML and print
export const generatePDF = (data: any, options: ExportOptions) => {
  const { filename = 'report', title = 'Report', subtitle = '', includeHeader = true } = options;
  
  try {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Unable to open print window. Please allow popups for this site.');
      alert('Unable to open print window. Please allow popups for this site.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
            color: #1a202c;
            background: white;
            font-size: 14px;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #0066ff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #0066ff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          
          .header h2 {
            color: #64748b;
            margin: 5px 0 0 0;
            font-size: 16px;
            font-weight: 500;
          }
          
          .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
            color: #64748b;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
          }
          
          th, td {
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
          }
          
          th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #1a202c;
          }
          
          .summary-section {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          
          .summary-item strong {
            color: #1a202c;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 15px;
            }
            .no-print { 
              display: none; 
            }
            @page {
              margin: 1in;
            }
          }
        </style>
      </head>
      <body>
        ${generateHTMLContent(data, options)}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

// Generate HTML content based on data type
const generateHTMLContent = (data: any, options: ExportOptions) => {
  const { title = 'Report', subtitle = '', includeHeader = true } = options;
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  let content = '';
  
  if (includeHeader) {
    content += `
      <div class="header">
        <h1>PharmaCare Management System</h1>
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      
      <div class="meta-info">
        <div>Generated on: ${currentDate} at ${currentTime}</div>
        <div>Report ID: ${generateReportId()}</div>
      </div>
    `;
  }

  // Handle different data types
  if (Array.isArray(data)) {
    content += generateTableHTML(data);
  } else if (data.type === 'prescription') {
    content += generatePrescriptionHTML(data);
  } else if (data.type === 'receipt') {
    content += generateReceiptHTML(data);
  } else if (data.type === 'invoice') {
    content += generateInvoiceHTML(data);
  } else {
    content += generateGenericReportHTML(data);
  }

  content += `
    <div class="footer">
      <p>This report was generated automatically by PharmaCare Management System</p>
      <p>© ${new Date().getFullYear()} PharmaCare - All rights reserved</p>
    </div>
  `;

  return content;
};

// CSV Export Function
export const exportToCSV = (data: any[], options: ExportOptions) => {
  const { filename = 'export', title = 'Export' } = options;
  
  try {
    let csvContent = '\uFEFF'; // UTF-8 BOM for proper encoding
    
    // Add title if provided
    if (title) {
      csvContent += `"${title}"\n`;
      csvContent += `"Generated on: ${new Date().toLocaleString()}"\n\n`;
    }
    
    if (data.length === 0) {
      csvContent += '"No data available"\n';
    } else {
      // Extract headers from first object
      const headers = Object.keys(data[0]);
      
      // Add headers with proper escaping
      csvContent += headers.map(header => `"${formatHeader(header)}"`).join(',') + '\n';
      
      // Add data rows
      data.forEach(row => {
        const values = headers.map(header => {
          let value = row[header];
          
          // Handle null/undefined values
          if (value === null || value === undefined) {
            return '""';
          }
          
          // Convert to string and handle special characters
          value = String(value);
          
          // Always wrap in quotes and escape existing quotes
          return `"${value.replace(/"/g, '""')}"`;
        });
        csvContent += values.join(',') + '\n';
      });
    }
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('Error generating CSV:', error);
    alert('Error generating CSV file. Please try again.');
  }
};

// Excel Export Function (CSV format compatible with Excel)
export const exportToExcel = (data: any[], options: ExportOptions) => {
  const { filename = 'export' } = options;
  exportToCSV(data, { ...options, filename: filename + '_excel' });
};

// JSON Export Function
export const exportToJSON = (data: any, options: ExportOptions) => {
  const { filename = 'export' } = options;
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

// Download file helper
const downloadFile = (content: string, filename: string, mimeType: string) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`Successfully initiated download for: ${filename}`);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert(`Error downloading ${filename}. Please try again.`);
  }
};

// Generate table HTML from array data
const generateTableHTML = (data: any[]) => {
  if (data.length === 0) return '<p>No data available</p>';
  
  const headers = Object.keys(data[0]);
  let html = '<table><thead><tr>';
  
  headers.forEach(header => {
    html += `<th>${formatHeader(header)}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      const value = row[header];
      html += `<td>${formatCellValue(value, header)}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
};

// Generate prescription HTML
const generatePrescriptionHTML = (prescription: any) => {
  return `
    <div class="prescription-header">
      <h3>Prescription #${prescription.prescription_number}</h3>
      <div class="prescription-meta">
        <div><strong>Patient:</strong> ${prescription.patientName}</div>
        <div><strong>Phone:</strong> ${prescription.patientPhone}</div>
        <div><strong>Pharmacist:</strong> ${prescription.pharmacistName}</div>
        <div><strong>Date:</strong> ${new Date(prescription.created_at).toLocaleDateString()}</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Quantity</th>
          <th>Dosage</th>
          <th>Instructions</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${prescription.items.map((item: any) => `
          <tr>
            <td>${item.medicineName}</td>
            <td>${item.quantity}</td>
            <td>${item.dosage || '-'}</td>
            <td>${item.instructions || '-'}</td>
            <td>₵${item.price.toFixed(2)}</td>
            <td>₵${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="summary-section">
      <div class="summary-item">
        <span>Subtotal:</span>
        <strong>₵${prescription.subtotal.toFixed(2)}</strong>
      </div>
      <div class="summary-item">
        <span>Tax:</span>
        <strong>₵${prescription.tax.toFixed(2)}</strong>
      </div>
      <div class="summary-item">
        <span><strong>Total:</strong></span>
        <strong>₵${prescription.total.toFixed(2)}</strong>
      </div>
    </div>
    
    ${prescription.notes ? `<div class="notes"><strong>Notes:</strong> ${prescription.notes}</div>` : ''}
  `;
};

// Generate receipt HTML (thermal printer format)
const generateReceiptHTML = (receipt: any) => {
  return `
    <div style="font-family: monospace; width: 300px; margin: 0 auto; font-size: 12px;">
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
        <h2 style="margin: 0;">PHARMACARE</h2>
        <p style="margin: 0;">Management System</p>
        <p style="margin: 0;">Receipt #${receipt.id}</p>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div>Date: ${new Date().toLocaleDateString()}</div>
        <div>Time: ${new Date().toLocaleTimeString()}</div>
        <div>Cashier: ${receipt.cashier || 'System'}</div>
      </div>
      
      <div style="border-bottom: 1px dashed #000; margin-bottom: 10px;"></div>
      
      ${receipt.items.map((item: any) => `
        <div style="margin-bottom: 5px;">
          <div>${item.name}</div>
          <div style="display: flex; justify-content: space-between;">
            <span>${item.quantity} x ₵${item.price.toFixed(2)}</span>
            <span>₵${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        </div>
      `).join('')}
      
      <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Subtotal:</span>
        <span>₵${receipt.subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Tax:</span>
        <span>₵${receipt.tax.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
        <span>TOTAL:</span>
        <span>₵${receipt.total.toFixed(2)}</span>
      </div>
      
      <div style="text-align: center; margin-top: 15px; font-size: 10px;">
        <p>Thank you for your business!</p>
        <p>Keep this receipt for your records</p>
      </div>
    </div>
  `;
};

// Generate invoice HTML
const generateInvoiceHTML = (invoice: any) => {
  return `
    <div class="invoice-header">
      <h3>Invoice #${invoice.invoice_number}</h3>
      <div class="invoice-meta">
        <div><strong>Bill To:</strong> ${invoice.customerName}</div>
        <div><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</div>
        <div><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</div>
      </div>
    </div>
    
    ${generateTableHTML(invoice.items)}
    
    <div class="summary-section">
      <div class="summary-item">
        <span>Subtotal:</span>
        <strong>₵${invoice.subtotal.toFixed(2)}</strong>
      </div>
      <div class="summary-item">
        <span>Tax:</span>
        <strong>₵${invoice.tax.toFixed(2)}</strong>
      </div>
      <div class="summary-item">
        <span><strong>Total:</strong></span>
        <strong>₵${invoice.total.toFixed(2)}</strong>
      </div>
    </div>
  `;
};

// Generate generic report HTML
const generateGenericReportHTML = (data: any) => {
  if (data.summary) {
    let html = '<div class="summary-section"><h3>Summary</h3>';
    Object.entries(data.summary).forEach(([key, value]) => {
      html += `<div class="summary-item"><span>${formatHeader(key)}:</span><strong>${value}</strong></div>`;
    });
    html += '</div>';
    
    if (data.data && Array.isArray(data.data)) {
      html += generateTableHTML(data.data);
    }
    
    return html;
  }
  
  return '<p>No data available for this report</p>';
};

// Utility functions
const formatHeader = (header: string) => {
  return header.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
};

const formatCellValue = (value: any, header: string) => {
  if (value === null || value === undefined) return '-';
  
  // Format currency fields
  if (header.toLowerCase().includes('price') || 
      header.toLowerCase().includes('total') || 
      header.toLowerCase().includes('subtotal') ||
      header.toLowerCase().includes('tax')) {
    if (typeof value === 'number') {
      return `₵${value.toFixed(2)}`;
    }
  }
  
  // Format date fields
  if (header.toLowerCase().includes('date') || 
      header.toLowerCase().includes('created') || 
      header.toLowerCase().includes('updated')) {
    if (value) {
      return new Date(value).toLocaleDateString();
    }
  }
  
  return value.toString();
};

const generateReportId = () => {
  return 'RPT-' + Date.now().toString(36).toUpperCase();
};

// Main export function that handles all formats
export const exportData = (data: any, options: ExportOptions) => {
  const { format } = options;
  
  try {
    console.log(`Exporting data in ${format} format:`, { data, options });
    
    switch (format) {
      case 'pdf':
        generatePDF(data, options);
        break;
      case 'csv':
        if (Array.isArray(data)) {
          exportToCSV(data, options);
        } else {
          console.error('CSV export requires array data');
          alert('CSV export requires array data. Please try a different format.');
        }
        break;
      case 'excel':
        if (Array.isArray(data)) {
          exportToExcel(data, options);
        } else {
          console.error('Excel export requires array data');
          alert('Excel export requires array data. Please try a different format.');
        }
        break;
      case 'json':
        exportToJSON(data, options);
        break;
      default:
        console.error('Unsupported export format:', format);
        alert(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error in exportData:', error);
    alert('Error exporting data. Please try again.');
  }
};

// Specialized export functions for different modules
export const exportInventoryReport = (medicines: any[], options: Partial<ExportOptions> = {}) => {
  const exportOptions: ExportOptions = {
    title: 'Medicine Inventory Report',
    subtitle: `Total items: ${medicines.length}`,
    filename: 'inventory_report',
    format: 'pdf',
    ...options
  };
  
  exportData(medicines, exportOptions);
};

export const exportSalesReport = (sales: any[], options: Partial<ExportOptions> = {}) => {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const exportOptions: ExportOptions = {
    title: 'Sales Report',
    subtitle: `Total Revenue: ₵${totalRevenue.toFixed(2)}`,
    filename: 'sales_report',
    format: 'pdf',
    ...options
  };
  
  exportData(sales, exportOptions);
};

export const exportPrescription = (prescription: any, options: Partial<ExportOptions> = {}) => {
  const prescriptionData = {
    type: 'prescription',
    ...prescription
  };
  
  const exportOptions: ExportOptions = {
    title: `Prescription #${prescription.prescription_number}`,
    filename: `prescription_${prescription.prescription_number}`,
    format: 'pdf',
    ...options
  };
  
  exportData(prescriptionData, exportOptions);
};

export const printReceipt = (receipt: any) => {
  const receiptData = {
    type: 'receipt',
    ...receipt
  };
  
  const exportOptions: ExportOptions = {
    title: 'Payment Receipt',
    filename: `receipt_${receipt.id}`,
    format: 'pdf',
    includeHeader: false
  };
  
  exportData(receiptData, exportOptions);
};

export const exportPatientReport = (patients: any[], options: Partial<ExportOptions> = {}) => {
  const exportOptions: ExportOptions = {
    title: 'Patient Report',
    subtitle: `Total patients: ${patients.length}`,
    filename: 'patient_report',
    format: 'pdf',
    ...options
  };
  
  exportData(patients, exportOptions);
};