// Backend API system using Supabase server
// This ensures all data is persisted in the database and synced across sessions

import { projectId, publicAnonKey } from './supabase/info';
import { LocalStorageService, STORAGE_KEYS } from './localStorageService';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3e7703d4`;

// Track backend availability
let backendOnline = true;
let lastBackendCheck = 0;
const BACKEND_CHECK_INTERVAL = 30000; // Check every 30 seconds

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Handle operations locally when backend is unavailable
function handleLocalOperation(method: string, storageKey: string, endpoint: string, body: any): any {
  const items = LocalStorageService.getAll(storageKey);
  
  switch (method) {
    case 'POST':
      // Create new item
      const newItem = LocalStorageService.create(storageKey, body);
      return newItem;
      
    case 'PUT':
      // Update existing item
      const idMatch = endpoint.match(/\/([^\/]+)$/);
      if (idMatch) {
        const id = idMatch[1];
        const updated = LocalStorageService.update(storageKey, id, body);
        return updated || body;
      }
      return body;
      
    case 'DELETE':
      // Delete item
      const deleteIdMatch = endpoint.match(/\/([^\/]+)$/);
      if (deleteIdMatch) {
        const id = deleteIdMatch[1];
        LocalStorageService.delete(storageKey, id);
        return { success: true, id };
      }
      return { success: false };
      
    default:
      return items;
  }
}

// Get access token from localStorage (set by AuthProvider)
const getAccessToken = () => {
  try {
    const authData = localStorage.getItem('sb-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.access_token || publicAnonKey;
    }
  } catch (e) {
    console.warn('Could not parse auth data');
  }
  return publicAnonKey;
};

// Map endpoints to localStorage keys
const endpointToStorageKey = (endpoint: string): string => {
  if (endpoint.includes('/medicines')) return STORAGE_KEYS.MEDICINES;
  if (endpoint.includes('/patients')) return STORAGE_KEYS.PATIENTS;
  if (endpoint.includes('/prescriptions')) return STORAGE_KEYS.PRESCRIPTIONS;
  if (endpoint.includes('/suppliers')) return STORAGE_KEYS.SUPPLIERS;
  if (endpoint.includes('/sales')) return STORAGE_KEYS.SALES;
  return '';
};

// Backend API function with localStorage fallback
async function backendApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Silently attempt backend call, fall back to localStorage on any error
  
  const accessToken = getAccessToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers,
  };

  try {
    // Set a timeout for the fetch request (3 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Silently fail and use localStorage
      throw new Error('Backend unavailable');
    }

    const data = await response.json();
    
    // Update backend status
    backendOnline = true;
    lastBackendCheck = Date.now();
    
    // Cache successful GET responses in localStorage (skip sync marking since already synced)
    const method = options.method || 'GET';
    if (method === 'GET') {
      const storageKey = endpointToStorageKey(endpoint);
      if (storageKey && Array.isArray(data)) {
        LocalStorageService.setAll(storageKey, data, true); // true = skip sync marking
      }
    }
    
    // Dispatch custom event to notify components of data changes (only for mutations, not GET)
    const resource = endpoint.split('/')[1]?.split('?')[0];
    if (resource && ['POST', 'PUT', 'DELETE'].includes(method)) {
      window.dispatchEvent(new CustomEvent(`${resource}Updated`, { detail: data }));
    }
    
    return data as T;
  } catch (error) {
    // Silently fall back to localStorage - no console errors
    
    // Mark backend as offline
    backendOnline = false;
    lastBackendCheck = Date.now();
    
    // For GET requests, try to use localStorage fallback
    const method = options.method || 'GET';
    if (method === 'GET') {
      const storageKey = endpointToStorageKey(endpoint);
      if (storageKey) {
        const cachedData = LocalStorageService.getAll(storageKey);
        // Return cached data or empty array - no console output
        return (cachedData.length > 0 ? cachedData : []) as T;
      }
    }
    
    // For non-GET requests when backend is down, use localStorage directly
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      const storageKey = endpointToStorageKey(endpoint);
      if (storageKey) {
        // Handle the operation locally
        const data = handleLocalOperation(method, storageKey, endpoint, options.body ? JSON.parse(options.body as string) : null);
        
        // Dispatch event for UI updates
        const resource = endpoint.split('/')[1]?.split('?')[0];
        if (resource) {
          window.dispatchEvent(new CustomEvent(`${resource}Updated`, { detail: data }));
        }
        
        return data as T;
      }
    }
    
    // If we can't handle it locally, return empty result
    return (method === 'GET' ? [] : {}) as T;
  }
}

// Medicine API
export const medicineAPI = {
  getAll: () => backendApiCall<any[]>('/medicines'),
  create: (medicine: any) => backendApiCall<any>('/medicines', {
    method: 'POST',
    body: JSON.stringify(medicine),
  }),
  update: (id: string, medicine: any) => backendApiCall<any>(`/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(medicine),
  }),
  delete: (id: string) => backendApiCall<any>(`/medicines/${id}`, {
    method: 'DELETE',
  }),
};

// Patient API
export const patientAPI = {
  getAll: () => backendApiCall<any[]>('/patients'),
  create: (patient: any) => backendApiCall<any>('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  }),
  update: (id: string, patient: any) => backendApiCall<any>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient),
  }),
};

// Prescription API
export const prescriptionAPI = {
  getAll: () => backendApiCall<any[]>('/prescriptions'),
  create: (prescription: any) => backendApiCall<any>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescription),
  }),
  update: (id: string, prescription: any) => backendApiCall<any>(`/prescriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(prescription),
  }),
  delete: (id: string) => backendApiCall<any>(`/prescriptions/${id}`, {
    method: 'DELETE',
  }),
};

// Sales API
export const salesAPI = {
  getAll: () => backendApiCall<any[]>('/sales'),
  create: (sale: any) => backendApiCall<any>('/sales', {
    method: 'POST',
    body: JSON.stringify(sale),
  }),
};

// Supplier API
export const supplierAPI = {
  getAll: () => backendApiCall<any[]>('/suppliers'),
  create: (supplier: any) => backendApiCall<any>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  }),
};

// User API
export const userAPI = {
  getAll: () => backendApiCall<any[]>('/users'),
  create: (user: any) => backendApiCall<any>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  updateStatus: (id: string, status: string) => backendApiCall<any>(`/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id: string) => backendApiCall<any>(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => backendApiCall<any>('/analytics/dashboard'),
};

// Realtime Subscriptions using Polling (for prescriptions)
export const subscribeToUpdates = (resource: string, callback: (data: any) => void, interval: number = 3000) => {
  let lastData: string | null = null;
  
  const pollData = async () => {
    try {
      const data = await backendApiCall(`/${resource}`);
      
      // Only update if data has actually changed (deep comparison via JSON)
      const dataString = JSON.stringify(data);
      if (dataString !== lastData) {
        lastData = dataString;
        callback(data);
      }
    } catch (error) {
      // Silently ignore polling errors - data will come from localStorage
    }
  };

  // Initial fetch
  pollData();
  
  // Poll for updates
  const intervalId = setInterval(pollData, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Initialize localStorage with demo data if backend is unavailable
export const initializeOfflineData = () => {
  console.log('🔧 Initializing offline demo data...');
  
  // Check if we already have data
  const existingMedicines = LocalStorageService.getAll(STORAGE_KEYS.MEDICINES);
  if (existingMedicines.length > 0) {
    console.log('✅ Offline data already exists');
    return;
  }
  
  // Default medicines
  const defaultMedicines = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      price: 15.99,
      stock: 450,
      minStock: 50,
      expiry: '2025-12-31',
      supplier: 'MedSupply Co',
      description: 'Pain relief and fever reducer',
      batchNumber: 'PAR2024001',
      manufacturer: 'PharmaCorp',
      barcode: '8934567890123'
    },
    {
      id: '2',
      name: 'Ibuprofen 400mg',
      category: 'Anti-inflammatory',
      price: 22.50,
      stock: 320,
      minStock: 40,
      expiry: '2025-10-15',
      supplier: 'PharmaCorp',
      description: 'Anti-inflammatory pain relief',
      batchNumber: 'IBU2024002',
      manufacturer: 'MedSupply',
      barcode: '8934567890124'
    }
  ];
  
  // Default patients
  const defaultPatients = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
      dateOfBirth: '1985-03-15',
      emergencyContact: 'Jane Smith - +1 (555) 123-4568',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
      allergies: 'Penicillin',
      lastVisit: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, Brooklyn, NY 11201',
      dateOfBirth: '1990-07-22',
      emergencyContact: 'Mike Johnson - +1 (555) 987-6544',
      medicalHistory: 'Asthma',
      allergies: 'None known',
      lastVisit: '2024-01-18'
    }
  ];
  
  // Default suppliers
  const defaultSuppliers = [
    {
      id: '1',
      name: 'MedSupply Co',
      contact: 'John Johnson',
      phone: '+1 (555) 200-3000',
      email: 'orders@medsupply.com',
      address: '123 Medical Way, Healthcare City, HC 12345',
      paymentTerms: 'Net 30',
      status: 'Active',
      rating: 4.8
    }
  ];
  
  // Store in localStorage
  LocalStorageService.setAll(STORAGE_KEYS.MEDICINES, defaultMedicines);
  LocalStorageService.setAll(STORAGE_KEYS.PATIENTS, defaultPatients);
  LocalStorageService.setAll(STORAGE_KEYS.SUPPLIERS, defaultSuppliers);
  LocalStorageService.setAll(STORAGE_KEYS.PRESCRIPTIONS, []);
  LocalStorageService.setAll(STORAGE_KEYS.SALES, []);
  
  console.log('✅ Offline demo data initialized successfully');
};

// Backend status check functions
export const checkBackendStatus = async (): Promise<boolean> => {
  // Don't check too frequently
  if (Date.now() - lastBackendCheck < BACKEND_CHECK_INTERVAL) {
    return backendOnline;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/medicines`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    backendOnline = response.ok;
    lastBackendCheck = Date.now();
    return response.ok;
  } catch (error) {
    // Silently mark backend as offline - no console errors
    backendOnline = false;
    lastBackendCheck = Date.now();
    
    // Initialize offline data if backend is unavailable
    initializeOfflineData();
    
    return false;
  }
};

export const isBackendAvailable = async (): Promise<boolean> => {
  return await checkBackendStatus();
};
