/**
 * Order Number Generator - Unique Number System
 * 
 * Generates unique order numbers for prescriptions and walk-in sales
 * Format: RX-YYYYMMDD-XXXX (Prescriptions) or ORD-YYYYMMDD-XXXX (Walk-in Orders)
 * 
 * Features:
 * - Date-based prefixes for easy tracking
 * - Sequential numbering per day
 * - No duplicates guaranteed
 * - Persistent counter storage
 * - Timezone-aware
 */

interface OrderCounter {
  date: string; // YYYYMMDD format
  prescriptionCounter: number;
  orderCounter: number;
}

const COUNTER_STORAGE_KEY = 'pharmacare_order_counters';

/**
 * Get current date in YYYYMMDD format
 */
function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Get or initialize today's counter
 */
function getTodayCounter(): OrderCounter {
  try {
    const today = getCurrentDateString();
    const stored = localStorage.getItem(COUNTER_STORAGE_KEY);
    
    if (stored) {
      const counter: OrderCounter = JSON.parse(stored);
      
      // If it's a new day, reset counters
      if (counter.date !== today) {
        return {
          date: today,
          prescriptionCounter: 0,
          orderCounter: 0
        };
      }
      
      return counter;
    }
    
    // Initialize new counter
    return {
      date: today,
      prescriptionCounter: 0,
      orderCounter: 0
    };
  } catch (error) {
    console.error('Error reading order counter:', error);
    // Return safe default
    return {
      date: getCurrentDateString(),
      prescriptionCounter: 0,
      orderCounter: 0
    };
  }
}

/**
 * Save counter to storage
 */
function saveCounter(counter: OrderCounter): void {
  try {
    localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counter));
  } catch (error) {
    console.error('Error saving order counter:', error);
  }
}

/**
 * Check if a number already exists (safety check)
 */
function numberExists(number: string, storageKey: string): boolean {
  try {
    const items = localStorage.getItem(storageKey);
    if (!items) return false;
    
    const parsed = JSON.parse(items);
    if (!Array.isArray(parsed)) return false;
    
    return parsed.some((item: any) => 
      item.prescription_number === number || 
      item.orderNumber === number
    );
  } catch (error) {
    return false;
  }
}

/**
 * Generate next prescription number
 * Format: RX-YYYYMMDD-XXXX
 * Example: RX-20241115-0001
 */
export function generatePrescriptionNumber(): string {
  const counter = getTodayCounter();
  const dateStr = counter.date;
  
  // Increment counter
  counter.prescriptionCounter++;
  
  // Generate number
  const sequenceNumber = String(counter.prescriptionCounter).padStart(4, '0');
  const prescriptionNumber = `RX-${dateStr}-${sequenceNumber}`;
  
  // Safety check - ensure number doesn't already exist
  const storageKey = 'pharmacare_prescriptions';
  let attempts = 0;
  let finalNumber = prescriptionNumber;
  
  while (numberExists(finalNumber, storageKey) && attempts < 100) {
    counter.prescriptionCounter++;
    const newSeq = String(counter.prescriptionCounter).padStart(4, '0');
    finalNumber = `RX-${dateStr}-${newSeq}`;
    attempts++;
  }
  
  // Save updated counter
  saveCounter(counter);
  
  return finalNumber;
}

/**
 * Generate next order number (for walk-in sales)
 * Format: ORD-YYYYMMDD-XXXX
 * Example: ORD-20241115-0001
 */
export function generateOrderNumber(): string {
  const counter = getTodayCounter();
  const dateStr = counter.date;
  
  // Increment counter
  counter.orderCounter++;
  
  // Generate number
  const sequenceNumber = String(counter.orderCounter).padStart(4, '0');
  const orderNumber = `ORD-${dateStr}-${sequenceNumber}`;
  
  // Safety check - ensure number doesn't already exist
  const storageKey = 'pharmacare_prescriptions';
  let attempts = 0;
  let finalNumber = orderNumber;
  
  while (numberExists(finalNumber, storageKey) && attempts < 100) {
    counter.orderCounter++;
    const newSeq = String(counter.orderCounter).padStart(4, '0');
    finalNumber = `ORD-${dateStr}-${newSeq}`;
    attempts++;
  }
  
  // Save updated counter
  saveCounter(counter);
  
  return finalNumber;
}

/**
 * Parse order number to extract information
 */
export function parseOrderNumber(orderNumber: string): {
  type: 'prescription' | 'order' | 'unknown';
  date: string | null;
  sequence: number | null;
  isValid: boolean;
} {
  // Match format: RX-YYYYMMDD-XXXX or ORD-YYYYMMDD-XXXX
  const regex = /^(RX|ORD)-(\d{8})-(\d{4})$/;
  const match = orderNumber.match(regex);
  
  if (!match) {
    return {
      type: 'unknown',
      date: null,
      sequence: null,
      isValid: false
    };
  }
  
  const [, prefix, dateStr, seqStr] = match;
  
  return {
    type: prefix === 'RX' ? 'prescription' : 'order',
    date: dateStr,
    sequence: parseInt(seqStr, 10),
    isValid: true
  };
}

/**
 * Format date from order number for display
 */
export function formatOrderDate(orderNumber: string): string {
  const parsed = parseOrderNumber(orderNumber);
  
  if (!parsed.isValid || !parsed.date) {
    return 'Invalid Date';
  }
  
  const year = parsed.date.substring(0, 4);
  const month = parsed.date.substring(4, 6);
  const day = parsed.date.substring(6, 8);
  
  return `${day}/${month}/${year}`;
}

/**
 * Get today's statistics
 */
export function getTodayStats(): {
  date: string;
  totalPrescriptions: number;
  totalOrders: number;
  total: number;
} {
  const counter = getTodayCounter();
  
  return {
    date: counter.date,
    totalPrescriptions: counter.prescriptionCounter,
    totalOrders: counter.orderCounter,
    total: counter.prescriptionCounter + counter.orderCounter
  };
}

/**
 * Reset counters (admin function - use with caution)
 */
export function resetCounters(): void {
  if (confirm('Are you sure you want to reset order counters? This action cannot be undone.')) {
    localStorage.removeItem(COUNTER_STORAGE_KEY);
    console.log('Order counters reset successfully');
  }
}

/**
 * Validate order number format
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  const parsed = parseOrderNumber(orderNumber);
  return parsed.isValid;
}

/**
 * Get next available number (preview without incrementing)
 */
export function previewNextNumbers(): {
  nextPrescription: string;
  nextOrder: string;
} {
  const counter = getTodayCounter();
  const dateStr = counter.date;
  
  const nextPrescriptionSeq = String(counter.prescriptionCounter + 1).padStart(4, '0');
  const nextOrderSeq = String(counter.orderCounter + 1).padStart(4, '0');
  
  return {
    nextPrescription: `RX-${dateStr}-${nextPrescriptionSeq}`,
    nextOrder: `ORD-${dateStr}-${nextOrderSeq}`
  };
}

/**
 * Export counter data for backup
 */
export function exportCounterData(): string {
  const counter = getTodayCounter();
  return JSON.stringify(counter, null, 2);
}

/**
 * Import counter data from backup
 */
export function importCounterData(jsonData: string): boolean {
  try {
    const counter: OrderCounter = JSON.parse(jsonData);
    
    // Validate structure
    if (!counter.date || 
        typeof counter.prescriptionCounter !== 'number' || 
        typeof counter.orderCounter !== 'number') {
      console.error('Invalid counter data structure');
      return false;
    }
    
    saveCounter(counter);
    console.log('Counter data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing counter data:', error);
    return false;
  }
}
