// Persistent API system using localStorage for cross-role data sync
// This ensures all data is shared across different user roles and sessions

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize localStorage with default data if not present
const initializeData = () => {
  const defaultData = {
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        category: "Pain Relief",
        price: 15.99,
        stock: 150,
        supplier: "PharmaCorp",
        batchNumber: "PAR2024001",
        expiryDate: "2025-12-31",
        description: "Pain and fever relief medication"
      },
      {
        id: "med-2", 
        name: "Ibuprofen 400mg",
        category: "Pain Relief",
        price: 22.50,
        stock: 75,
        supplier: "MediSupply",
        batchNumber: "IBU2024002",
        expiryDate: "2025-08-15",
        description: "Anti-inflammatory pain relief"
      },
      {
        id: "med-3",
        name: "Vitamin D3 1000IU",
        category: "Vitamins",
        price: 35.99,
        stock: 8, // Low stock for testing
        supplier: "VitaHealth",
        batchNumber: "VTD2024003",
        expiryDate: "2024-12-31", // Expiring soon for testing
        description: "Vitamin D supplement"
      },
      {
        id: "med-4",
        name: "Amoxicillin 250mg",
        category: "Antibiotics",
        price: 28.75,
        stock: 45,
        supplier: "PharmaCorp",
        batchNumber: "AMX2024001",
        expiryDate: "2025-06-30",
        description: "Broad-spectrum antibiotic"
      }
    ],
    patients: [
      {
        id: "pat-1",
        name: "John Smith",
        phone: "+233 555 123 4567",
        email: "john.smith@email.com",
        address: "123 Accra Main St, Accra, Ghana",
        dateOfBirth: "1985-03-15",
        emergencyContact: "Mary Smith - +233 555 987 6543",
        medicalHistory: "Hypertension, controlled with medication",
        allergies: "Penicillin",
        lastVisit: "2024-09-20"
      },
      {
        id: "pat-2",
        name: "Sarah Johnson", 
        phone: "+233 555 987 6543",
        email: "sarah.johnson@email.com",
        address: "456 Kumasi Oak Ave, Kumasi, Ghana",
        dateOfBirth: "1992-07-22",
        emergencyContact: "James Johnson - +233 555 123 4567",
        medicalHistory: "No significant medical history",
        allergies: "None known",
        lastVisit: "2024-09-18"
      },
      {
        id: "pat-3",
        name: "Emmanuel Asante",
        phone: "+233 244 555 0123",
        email: "emmanuel.asante@email.com",
        address: "789 Cape Coast Road, Cape Coast, Ghana",
        dateOfBirth: "1978-11-12",
        emergencyContact: "Grace Asante - +233 244 555 0124",
        medicalHistory: "Diabetes Type 2",
        allergies: "None known",
        lastVisit: "2024-09-22"
      }
    ],
    sales: [],
    suppliers: [
      {
        id: "sup-1",
        name: "PharmaCorp Ghana",
        contactPerson: "Dr. Michael Osei",
        phone: "+233 302 123 456",
        email: "orders@pharmacorp.com.gh",
        address: "Industrial Area, Tema, Ghana"
      },
      {
        id: "sup-2",
        name: "MediSupply Ltd",
        contactPerson: "Akosua Mensah",
        phone: "+233 501 987 654",
        email: "supply@medisupply.gh",
        address: "Ring Road, Accra, Ghana"
      }
    ],
    users: [],
    prescriptions: []
  };

  // Initialize each data type if not present
  Object.keys(defaultData).forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify((defaultData as any)[key]));
    }
  });
};

// Get data from localStorage
const getData = (resource: string) => {
  const data = localStorage.getItem(resource);
  return data ? JSON.parse(data) : [];
};

// Save data to localStorage and notify other components
const saveData = (resource: string, data: any[]) => {
  console.log(`💾 Saving ${resource} data:`, data);
  localStorage.setItem(resource, JSON.stringify(data));
  console.log(`📡 Dispatching ${resource}Updated event`);
  // Dispatch custom event to notify other components of data changes
  window.dispatchEvent(new CustomEvent(`${resource}Updated`, { detail: data }));
};

// Persistent API function using localStorage
async function persistentApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log(`Persistent API call: ${options.method || 'GET'} ${endpoint}`);
  
  // Initialize data on first call
  initializeData();
  
  // Simulate network delay
  await delay(300 + Math.random() * 200);

  const method = options.method || 'GET';
  const [, resource] = endpoint.split('/');

  try {
    switch (method) {
      case 'GET':
        if (endpoint === '/analytics/dashboard') {
          const medicines = getData('medicines');
          const patients = getData('patients');
          const prescriptions = getData('prescriptions');
          
          return {
            totalRevenue: 65840.50,
            todayRevenue: 2450.75,
            totalSales: 156,
            todaySales: 12,
            totalPatients: patients.length,
            totalMedicines: medicines.length,
            lowStockItems: medicines.filter((m: any) => m.stock < 20),
            expiringSoon: medicines.filter((m: any) => {
              const expiryDate = new Date(m.expiryDate);
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
              return expiryDate <= thirtyDaysFromNow;
            }),
            recentSales: [],
            pendingPrescriptions: prescriptions.filter((p: any) => p.status === 'Pending').length
          } as T;
        }
        return getData(resource) as T;

      case 'POST':
        console.log(`🔄 POST ${endpoint} - Creating new ${resource}`);
        const currentData = getData(resource);
        console.log(`📊 Current ${resource} data:`, currentData);
        const bodyData = JSON.parse(options.body as string);
        console.log(`📥 New ${resource} data:`, bodyData);
        const newItem = {
          // Use provided id if available, otherwise generate one
          id: bodyData.id || `${resource.slice(0, 3)}-${Date.now()}`,
          ...bodyData,
          created_at: bodyData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log(`✨ Final ${resource} item:`, newItem);
        const updatedData = [...currentData, newItem];
        console.log(`📈 Updated ${resource} array:`, updatedData);
        saveData(resource, updatedData);
        console.log(`✅ Successfully created ${resource}:`, newItem);
        return newItem as T;

      case 'PUT':
        const putData = getData(resource);
        const updateId = endpoint.split('/')[2];
        const updateData = JSON.parse(options.body as string);
        const updateIndex = putData.findIndex((item: any) => item.id === updateId);
        
        if (updateIndex !== -1) {
          putData[updateIndex] = { 
            ...putData[updateIndex], 
            ...updateData, 
            updated_at: new Date().toISOString() 
          };
          saveData(resource, putData);
          return putData[updateIndex] as T;
        }
        throw new Error('Item not found');

      case 'DELETE':
        const deleteData = getData(resource);
        const deleteId = endpoint.split('/')[2];
        const deleteIndex = deleteData.findIndex((item: any) => item.id === deleteId);
        
        if (deleteIndex !== -1) {
          const deleted = deleteData.splice(deleteIndex, 1)[0];
          saveData(resource, deleteData);
          return deleted as T;
        }
        throw new Error('Item not found');

      default:
        throw new Error(`Method ${method} not supported`);
    }
  } catch (error) {
    console.error(`Persistent API error for ${endpoint}:`, error);
    throw error;
  }
}

// Medicine API
export const medicineAPI = {
  getAll: () => persistentApiCall<any[]>('/medicines'),
  create: (medicine: any) => persistentApiCall<any>('/medicines', {
    method: 'POST',
    body: JSON.stringify(medicine),
  }),
  update: (id: string, medicine: any) => persistentApiCall<any>(`/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(medicine),
  }),
  delete: (id: string) => persistentApiCall<any>(`/medicines/${id}`, {
    method: 'DELETE',
  }),
};

// Patient API
export const patientAPI = {
  getAll: () => persistentApiCall<any[]>('/patients'),
  create: (patient: any) => persistentApiCall<any>('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  }),
  update: (id: string, patient: any) => persistentApiCall<any>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient),
  }),
};

// Prescription API
export const prescriptionAPI = {
  getAll: () => persistentApiCall<any[]>('/prescriptions'),
  create: (prescription: any) => persistentApiCall<any>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescription),
  }),
  update: (id: string, prescription: any) => persistentApiCall<any>(`/prescriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(prescription),
  }),
};

// Sales API
export const salesAPI = {
  getAll: () => persistentApiCall<any[]>('/sales'),
  create: (sale: any) => persistentApiCall<any>('/sales', {
    method: 'POST',
    body: JSON.stringify(sale),
  }),
};

// Supplier API
export const supplierAPI = {
  getAll: () => persistentApiCall<any[]>('/suppliers'),
  create: (supplier: any) => persistentApiCall<any>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  }),
};

// User API
export const userAPI = {
  getAll: () => persistentApiCall<any[]>('/users'),
  create: (user: any) => persistentApiCall<any>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => persistentApiCall<any>('/analytics/dashboard'),
};