import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert } from './ui/alert';
import { Printer, Receipt, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { addAuditLog } from '../utils/audit';
import { useAuth } from './AuthProvider';
import { formatOrderDate, parseOrderNumber } from '../utils/orderNumberGenerator';

interface ReceiptData {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    medicineName: string;
    quantity: number;
    price: number;
    instructions?: string;
  }>;
  total: number;
  paymentMethod: string;
  date: string;
}

interface ThermalPrinterProps {
  receiptData: ReceiptData;
  onPrintSuccess?: () => void;
  onPrintError?: (error: string) => void;
}

// ESC/POS commands for thermal printers
const ESC = '\x1B';
const COMMANDS = {
  INIT: `${ESC}@`,           // Initialize printer
  ALIGN_CENTER: `${ESC}a1`,  // Center alignment
  ALIGN_LEFT: `${ESC}a0`,    // Left alignment
  BOLD_ON: `${ESC}E1`,       // Bold text on
  BOLD_OFF: `${ESC}E0`,      // Bold text off
  DOUBLE_HEIGHT: `${ESC}!0x10`, // Double height
  NORMAL_SIZE: `${ESC}!0`,   // Normal size
  CUT_PAPER: `${ESC}d3${ESC}i`, // Cut paper
  LINE_FEED: '\n',
  DRAWER_KICK: `${ESC}p048` // Open cash drawer
};

export function ThermalPrinter({ receiptData, onPrintSuccess, onPrintError }: ThermalPrinterProps) {
  const { user } = useAuth();
  const [printing, setPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const formatReceiptText = (data: ReceiptData): string => {
    const date = new Date(data.date).toLocaleString();
    const line = '--------------------------------';
    
    let receipt = '';
    
    // Header
    receipt += COMMANDS.INIT;
    receipt += COMMANDS.ALIGN_CENTER;
    receipt += COMMANDS.BOLD_ON;
    receipt += COMMANDS.DOUBLE_HEIGHT;
    receipt += 'PHARMACARE\n';
    receipt += COMMANDS.NORMAL_SIZE;
    receipt += 'Pharmacy Management System\n';
    receipt += COMMANDS.BOLD_OFF;
    receipt += line + '\n';
    
    // Order details
    receipt += COMMANDS.ALIGN_LEFT;
    receipt += COMMANDS.BOLD_ON;
    receipt += `Receipt #: ${data.id}\n`;
    receipt += COMMANDS.BOLD_OFF;
    receipt += `Date: ${date}\n`;
    receipt += `Customer: ${data.customerName}\n`;
    receipt += `Phone: ${data.customerPhone}\n`;
    receipt += line + '\n';
    
    // Items
    receipt += COMMANDS.BOLD_ON;
    receipt += 'ITEMS:\n';
    receipt += COMMANDS.BOLD_OFF;
    
    data.items.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      const itemLine = `${item.medicineName}\n`;
      const priceLine = `  ${item.quantity} x ₵${item.price.toFixed(2)} = ₵${itemTotal}\n`;
      receipt += itemLine;
      receipt += priceLine;
      
      // Add usage instructions if available
      if (item.instructions) {
        receipt += `  📋 ${item.instructions}\n`;
      }
    });
    
    receipt += line + '\n';
    
    // Total
    receipt += COMMANDS.BOLD_ON;
    receipt += COMMANDS.ALIGN_CENTER;
    receipt += `TOTAL: ₵${data.total.toFixed(2)}\n`;
    receipt += COMMANDS.ALIGN_LEFT;
    receipt += COMMANDS.BOLD_OFF;
    receipt += `Payment: ${data.paymentMethod}\n`;
    receipt += line + '\n';
    
    // Footer
    receipt += COMMANDS.ALIGN_CENTER;
    receipt += 'Thank you for your business!\n';
    receipt += 'Feel better soon!\n';
    receipt += '\n';
    receipt += 'For support: support@pharmacare.com\n';
    receipt += line + '\n';
    
    // Cut paper and open drawer
    receipt += COMMANDS.CUT_PAPER;
    receipt += COMMANDS.DRAWER_KICK;
    
    return receipt;
  };

  const printToThermalPrinter = async (receiptText: string): Promise<void> => {
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported. Please use Chrome/Edge browser.');
      }

      // Request a port
      const port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x0519 }, // Star Micronics
          { usbVendorId: 0x154f }, // Generic thermal printers
        ]
      });

      // Open the port
      await port.open({ baudRate: 9600 });

      // Get writer
      const writer = port.writable.getWriter();

      // Convert string to bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(receiptText);

      // Write data
      await writer.write(data);

      // Release writer and close port
      writer.releaseLock();
      await port.close();

    } catch (error: any) {
      // Fallback to browser printing for regular printers
      await printToBrowserPrinter(receiptText);
    }
  };

  const printToBrowserPrinter = async (receiptText: string): Promise<void> => {
    // Create a formatted HTML version for regular printers
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptData.id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            width: 300px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item { margin: 5px 0; }
          .item-name { font-weight: bold; }
          .item-price { margin-left: 20px; }
          .total { font-size: 14px; font-weight: bold; text-align: center; }
          @media print {
            body { margin: 0; padding: 10px; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="center bold large">PHARMACARE</div>
        <div class="center">Pharmacy Management System</div>
        <div class="line"></div>
        
        <div class="bold">Receipt #: ${receiptData.id}</div>
        <div>Date: ${new Date(receiptData.date).toLocaleString()}</div>
        <div>Customer: ${receiptData.customerName}</div>
        <div>Phone: ${receiptData.customerPhone}</div>
        <div class="line"></div>
        
        <div class="bold">ITEMS:</div>
        ${receiptData.items.map(item => `
          <div class="item">
            <div class="item-name">${item.medicineName}</div>
            <div class="item-price">${item.quantity} x $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
        <div class="line"></div>
        
        <div class="total">TOTAL: $${receiptData.total.toFixed(2)}</div>
        <div>Payment: ${receiptData.paymentMethod}</div>
        <div class="line"></div>
        
        <div class="center">Thank you for your business!</div>
        <div class="center">Feel better soon!</div>
        <br>
        <div class="center">For support: support@pharmacare.com</div>
        <div class="line"></div>
      </body>
      </html>
    `;

    // Open new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      throw new Error('Unable to open print window. Please check popup blocker settings.');
    }
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);
      setPrintStatus('idle');
      setErrorMessage('');

      const receiptText = formatReceiptText(receiptData);
      
      // Try thermal printer first, fallback to browser printing
      await printToThermalPrinter(receiptText);
      
      setPrintStatus('success');
      
      // Add audit log for successful receipt printing
      addAuditLog(
        'Receipt Printed',
        `Receipt #${receiptData.id} printed for ${receiptData.customerName} - Total: ₵${receiptData.total.toFixed(2)} (${receiptData.items.length} items)`,
        user?.name,
        'Printing'
      );
      
      onPrintSuccess?.();
      
    } catch (error: any) {
      console.error('Print error:', error);
      setErrorMessage(error.message || 'Failed to print receipt');
      setPrintStatus('error');
      onPrintError?.(error.message || 'Failed to print receipt');
    } finally {
      setPrinting(false);
    }
  };

  const PreviewReceipt = () => (
    <div className="font-mono text-xs bg-gray-50 p-4 rounded border max-w-80 mx-auto">
      <div className="text-center font-bold text-lg mb-2">PHARMACARE</div>
      <div className="text-center text-sm mb-2">Pharmacy Management System</div>
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      <div className="space-y-1">
        <div><strong>Receipt #:</strong> {receiptData.id}</div>
        <div><strong>Date:</strong> {new Date(receiptData.date).toLocaleString()}</div>
        <div><strong>Customer:</strong> {receiptData.customerName}</div>
        <div><strong>Phone:</strong> {receiptData.customerPhone}</div>
      </div>
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      <div className="font-bold mb-2">ITEMS:</div>
      {receiptData.items.map((item, index) => (
        <div key={index} className="mb-2">
          <div className="font-semibold">{item.medicineName}</div>
          <div className="ml-4 text-gray-600">
            {item.quantity} x ${item.price.toFixed(2)} = ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      ))}
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      <div className="text-center font-bold text-lg">TOTAL: ${receiptData.total.toFixed(2)}</div>
      <div><strong>Payment:</strong> {receiptData.paymentMethod}</div>
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      <div className="text-center space-y-1">
        <div>Thank you for your business!</div>
        <div>Feel better soon!</div>
        <div className="text-xs text-gray-500 mt-2">support@pharmacare.com</div>
      </div>
    </div>
  );

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Print Receipt
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Receipt
            </DialogTitle>
            <DialogDescription>
              Print receipt for order {receiptData.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {printStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <div className="text-red-800 text-sm">{errorMessage}</div>
              </Alert>
            )}
            
            {printStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <div className="text-green-800 text-sm">Receipt printed successfully!</div>
              </Alert>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Receipt Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewReceipt />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                onClick={handlePrint} 
                disabled={printing}
                className="flex-1"
              >
                {printing ? (
                  <>
                    <Printer className="h-4 w-4 mr-2 animate-pulse" />
                    Printing...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Settings className="h-3 w-3" />
                <span>Supports thermal printers via USB/Serial</span>
              </div>
              <div>• For thermal printers: Connect via USB and grant serial port access</div>
              <div>• For regular printers: Uses standard browser printing</div>
              <div>• Receipt will be formatted for 80mm thermal paper</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper hook for printing receipts
export function useThermalPrinter() {
  const [isSupported, setIsSupported] = useState(false);

  const checkSupport = () => {
    const supported = 'serial' in navigator || 'print' in window;
    setIsSupported(supported);
    return supported;
  };

  const printReceipt = async (receiptData: ReceiptData) => {
    // This would typically be called from a ThermalPrinter component
    // but can be used directly if needed
    console.log('Printing receipt:', receiptData);
  };

  return {
    isSupported,
    checkSupport,
    printReceipt
  };
}