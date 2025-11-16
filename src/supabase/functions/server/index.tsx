import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

// Types
interface Medicine {
  id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  expiry: string;
  supplier: string;
  description?: string;
  batchNumber?: string;
  manufacturer?: string;
  barcode?: string;
}

interface Prescription {
  id?: string;
  prescriptionNumber?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientType: 'registered' | 'walk-in';
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    price: number;
    instructions?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
}

interface Patient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
  lastVisit?: string;
}

interface Sale {
  id?: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
  prescriptionId?: string;
}

interface Supplier {
  id?: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  status: string;
  rating?: number;
}

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdDate: string;
}

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify auth token
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No authorization token provided', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return { error: 'Invalid authorization token', user: null };
    }
    return { error: null, user };
  } catch (error) {
    return { error: 'Failed to verify token', user: null };
  }
}

// Initialize default data
async function initializeDefaultData() {
  try {
    // Check if data already exists
    const existingData = await kv.get('medicines_initialized');
    if (existingData) return;

    // Initialize medicines (prices in Ghanaian cedis ₵)
    const defaultMedicines: Medicine[] = [
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
      },
      {
        id: '3',
        name: 'Vitamin D3 1000IU',
        category: 'Vitamins',
        price: 35.99,
        stock: 280,
        minStock: 30,
        expiry: '2026-03-20',
        supplier: 'VitaHealth',
        description: 'Vitamin D supplement',
        batchNumber: 'VTD2024003',
        manufacturer: 'VitaHealth',
        barcode: '8934567890125'
      },
      {
        id: '4',
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        price: 28.75,
        stock: 15,
        minStock: 25,
        expiry: '2025-08-10',
        supplier: 'MedSupply Co',
        description: 'Antibiotic for bacterial infections',
        batchNumber: 'AMX2024004',
        manufacturer: 'PharmaCorp',
        barcode: '8934567890126'
      },
      {
        id: '5',
        name: 'Cough Syrup',
        category: 'Respiratory',
        price: 42.50,
        stock: 5,
        minStock: 20,
        expiry: '2025-06-30',
        supplier: 'RemedyMed',
        description: 'Cough suppressant syrup',
        batchNumber: 'CSY2024005',
        manufacturer: 'RemedyMed',
        barcode: '8934567890127'
      }
    ];

    // Initialize patients
    const defaultPatients: Patient[] = [
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

    // Initialize suppliers
    const defaultSuppliers: Supplier[] = [
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
      },
      {
        id: '2',
        name: 'PharmaCorp',
        contact: 'Sarah Martinez',
        phone: '+1 (555) 300-4000',
        email: 'support@pharmacorp.com',
        address: '456 Pharma Street, Medicine Town, MT 67890',
        paymentTerms: 'Net 15',
        status: 'Active',
        rating: 4.9
      }
    ];

    // Initialize users and create auth accounts
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'John Admin',
        email: 'john@pharmacare.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-01-22 14:30',
        createdDate: '2024-01-01'
      },
      {
        id: '2',
        name: 'Sarah Pharmacist',
        email: 'sarah@pharmacare.com',
        role: 'Pharmacist',
        status: 'Active',
        lastLogin: '2024-01-22 09:15',
        createdDate: '2024-01-05'
      },
      {
        id: '3',
        name: 'Mike Accountant',
        email: 'mike@pharmacare.com',
        role: 'Accountant',
        status: 'Active',
        lastLogin: '2024-01-22 08:45',
        createdDate: '2024-01-08'
      }
    ];

    // Create default admin user in Supabase Auth if not exists
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'john@pharmacare.com',
        password: 'admin123',
        user_metadata: { 
          name: 'John Admin',
          role: 'Admin' 
        },
        email_confirm: true
      });
      
      if (error) {
        if (error.code === 'email_exists' || error.message.includes('already been registered')) {
          console.log('Default admin user already exists in auth system');
        } else {
          console.error('Error creating default admin user:', error);
        }
      } else {
        console.log('Default admin user created successfully');
      }
    } catch (error) {
      console.log('Error checking/creating admin user:', error);
    }

    // Store initial data
    await kv.set('medicines', defaultMedicines);
    await kv.set('patients', defaultPatients);
    await kv.set('suppliers', defaultSuppliers);
    await kv.set('users', defaultUsers);
    await kv.set('sales', []);
    await kv.set('prescriptions', []);
    await kv.set('medicines_initialized', true);

    console.log('Default data initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

// Initialize data on startup immediately
initializeDefaultData().catch((error) => {
  console.error('Failed to initialize default data:', error);
});

// AUTHENTICATION ROUTES
app.post('/make-server-3e7703d4/auth/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if user already exists in our KV store first
    const existingUsers = await kv.get('users') || [];
    if (existingUsers.some((u: User) => u.email === email)) {
      return c.json({ error: 'An account with this email already exists' }, 409);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { 
        name: name,
        role: role 
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      if (error.message.includes('email_exists') || error.code === 'email_exists') {
        return c.json({ error: 'An account with this email already exists' }, 409);
      }
      return c.json({ error: error.message }, 400);
    }

    // Also store user in our KV store for management
    const users = await kv.get('users') || [];
    const newUser = {
      id: data.user?.id,
      name: name,
      email: email,
      role: role,
      status: role === 'Accountant' ? 'pending' : 'approved', // Accountants need approval
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString()
    };
    users.push(newUser);
    await kv.set('users', users);

    return c.json({ message: 'User created successfully', user: newUser }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user account' }, 500);
  }
});

// MEDICINES ROUTES
app.get('/make-server-3e7703d4/medicines', async (c) => {
  try {
    const medicines = await kv.get('medicines') || [];
    return c.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return c.json({ error: 'Failed to fetch medicines' }, 500);
  }
});

app.post('/make-server-3e7703d4/medicines', async (c) => {
  try {
    const medicineData = await c.req.json() as Medicine;
    const medicines = await kv.get('medicines') || [];
    
    const newMedicine: Medicine = {
      ...medicineData,
      id: Date.now().toString()
    };
    
    medicines.push(newMedicine);
    await kv.set('medicines', medicines);
    
    return c.json(newMedicine, 201);
  } catch (error) {
    console.error('Error creating medicine:', error);
    return c.json({ error: 'Failed to create medicine' }, 500);
  }
});

app.put('/make-server-3e7703d4/medicines/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json() as Partial<Medicine>;
    const medicines = await kv.get('medicines') || [];
    
    const index = medicines.findIndex((m: Medicine) => m.id === id);
    if (index === -1) {
      return c.json({ error: 'Medicine not found' }, 404);
    }
    
    medicines[index] = { ...medicines[index], ...updateData };
    await kv.set('medicines', medicines);
    
    return c.json(medicines[index]);
  } catch (error) {
    console.error('Error updating medicine:', error);
    return c.json({ error: 'Failed to update medicine' }, 500);
  }
});

app.delete('/make-server-3e7703d4/medicines/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const medicines = await kv.get('medicines') || [];
    
    const filteredMedicines = medicines.filter((m: Medicine) => m.id !== id);
    await kv.set('medicines', filteredMedicines);
    
    return c.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return c.json({ error: 'Failed to delete medicine' }, 500);
  }
});

// PATIENTS ROUTES
app.get('/make-server-3e7703d4/patients', async (c) => {
  try {
    const patients = await kv.get('patients') || [];
    return c.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return c.json({ error: 'Failed to fetch patients' }, 500);
  }
});

app.post('/make-server-3e7703d4/patients', async (c) => {
  try {
    const patientData = await c.req.json() as Patient;
    const patients = await kv.get('patients') || [];
    
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      lastVisit: new Date().toISOString().split('T')[0]
    };
    
    patients.push(newPatient);
    await kv.set('patients', patients);
    
    return c.json(newPatient, 201);
  } catch (error) {
    console.error('Error creating patient:', error);
    return c.json({ error: 'Failed to create patient' }, 500);
  }
});

app.put('/make-server-3e7703d4/patients/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json() as Partial<Patient>;
    const patients = await kv.get('patients') || [];
    
    const index = patients.findIndex((p: Patient) => p.id === id);
    if (index === -1) {
      return c.json({ error: 'Patient not found' }, 404);
    }
    
    patients[index] = { ...patients[index], ...updateData };
    await kv.set('patients', patients);
    
    return c.json(patients[index]);
  } catch (error) {
    console.error('Error updating patient:', error);
    return c.json({ error: 'Failed to update patient' }, 500);
  }
});

// SALES ROUTES
app.get('/make-server-3e7703d4/sales', async (c) => {
  try {
    const sales = await kv.get('sales') || [];
    return c.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return c.json({ error: 'Failed to fetch sales' }, 500);
  }
});

app.post('/make-server-3e7703d4/sales', async (c) => {
  try {
    const saleData = await c.req.json() as Sale;
    const sales = await kv.get('sales') || [];
    const medicines = await kv.get('medicines') || [];
    
    // Update medicine stock
    for (const item of saleData.items) {
      const medicineIndex = medicines.findIndex((m: Medicine) => m.id === item.medicineId);
      if (medicineIndex !== -1) {
        medicines[medicineIndex].stock -= item.quantity;
      }
    }
    
    const newSale: Sale = {
      ...saleData,
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString()
    };
    
    sales.push(newSale);
    await kv.set('sales', sales);
    await kv.set('medicines', medicines);
    
    return c.json(newSale, 201);
  } catch (error) {
    console.error('Error creating sale:', error);
    return c.json({ error: 'Failed to create sale' }, 500);
  }
});

// SUPPLIERS ROUTES
app.get('/make-server-3e7703d4/suppliers', async (c) => {
  try {
    const suppliers = await kv.get('suppliers') || [];
    return c.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return c.json({ error: 'Failed to fetch suppliers' }, 500);
  }
});

app.post('/make-server-3e7703d4/suppliers', async (c) => {
  try {
    const supplierData = await c.req.json() as Supplier;
    const suppliers = await kv.get('suppliers') || [];
    
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      rating: 0
    };
    
    suppliers.push(newSupplier);
    await kv.set('suppliers', suppliers);
    
    return c.json(newSupplier, 201);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return c.json({ error: 'Failed to create supplier' }, 500);
  }
});

// PRESCRIPTIONS ROUTES
app.get('/make-server-3e7703d4/prescriptions', async (c) => {
  try {
    const prescriptions = await kv.get('prescriptions') || [];
    return c.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return c.json({ error: 'Failed to fetch prescriptions' }, 500);
  }
});

app.post('/make-server-3e7703d4/prescriptions', async (c) => {
  try {
    const prescriptionData = await c.req.json() as Prescription;
    const prescriptions = await kv.get('prescriptions') || [];
    const medicines = await kv.get('medicines') || [];
    
    // Generate prescription number
    const prescriptionNumber = `RX-${Date.now()}`;
    
    // Reserve stock for prescription items
    for (const item of prescriptionData.items) {
      const medicineIndex = medicines.findIndex((m: Medicine) => m.id === item.medicineId);
      if (medicineIndex !== -1) {
        // Check if enough stock
        if (medicines[medicineIndex].stock < item.quantity) {
          return c.json({ 
            error: `Insufficient stock for ${item.medicineName}. Available: ${medicines[medicineIndex].stock}, Required: ${item.quantity}. Please replenish stock or reduce quantity.` 
          }, 400);
        }
        // Reserve stock (deduct immediately to prevent overselling)
        medicines[medicineIndex].stock -= item.quantity;
      }
    }
    
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: `pres-${Date.now()}`,
      prescriptionNumber,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    prescriptions.push(newPrescription);
    await kv.set('prescriptions', prescriptions);
    await kv.set('medicines', medicines);
    
    // Broadcast event for real-time updates
    console.log(`New prescription created: ${prescriptionNumber}`);
    
    return c.json(newPrescription, 201);
  } catch (error) {
    console.error('Error creating prescription:', error);
    return c.json({ error: 'Failed to create prescription' }, 500);
  }
});

app.put('/make-server-3e7703d4/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json() as Partial<Prescription>;
    const prescriptions = await kv.get('prescriptions') || [];
    
    const index = prescriptions.findIndex((p: Prescription) => p.id === id);
    if (index === -1) {
      return c.json({ error: 'Prescription not found' }, 404);
    }
    
    // If updating to Paid status, record payment time
    if (updateData.status === 'Paid' && prescriptions[index].status !== 'Paid') {
      updateData.paidAt = new Date().toISOString();
    }
    
    // If cancelling, restore stock
    if (updateData.status === 'Cancelled' && prescriptions[index].status !== 'Cancelled') {
      const medicines = await kv.get('medicines') || [];
      for (const item of prescriptions[index].items) {
        const medicineIndex = medicines.findIndex((m: Medicine) => m.id === item.medicineId);
        if (medicineIndex !== -1) {
          medicines[medicineIndex].stock += item.quantity;
        }
      }
      await kv.set('medicines', medicines);
    }
    
    prescriptions[index] = { 
      ...prescriptions[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await kv.set('prescriptions', prescriptions);
    
    return c.json(prescriptions[index]);
  } catch (error) {
    console.error('Error updating prescription:', error);
    return c.json({ error: 'Failed to update prescription' }, 500);
  }
});

app.delete('/make-server-3e7703d4/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const prescriptions = await kv.get('prescriptions') || [];
    const medicines = await kv.get('medicines') || [];
    
    const prescriptionIndex = prescriptions.findIndex((p: Prescription) => p.id === id);
    if (prescriptionIndex === -1) {
      return c.json({ error: 'Prescription not found' }, 404);
    }
    
    const prescription = prescriptions[prescriptionIndex];
    
    // Restore stock if prescription wasn't paid
    if (prescription.status !== 'Paid') {
      for (const item of prescription.items) {
        const medicineIndex = medicines.findIndex((m: Medicine) => m.id === item.medicineId);
        if (medicineIndex !== -1) {
          medicines[medicineIndex].stock += item.quantity;
        }
      }
      await kv.set('medicines', medicines);
    }
    
    const filteredPrescriptions = prescriptions.filter((p: Prescription) => p.id !== id);
    await kv.set('prescriptions', filteredPrescriptions);
    
    return c.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return c.json({ error: 'Failed to delete prescription' }, 500);
  }
});

// ADMIN UTILITY ROUTES
app.post('/make-server-3e7703d4/admin/reset-stock', async (c) => {
  try {
    const medicines = await kv.get('medicines') || [];
    
    // Reset stock for all medicines to initial demo values
    for (const medicine of medicines) {
      if (medicine.name === 'Paracetamol 500mg') {
        medicine.stock = 450;
      } else if (medicine.name === 'Ibuprofen 400mg') {
        medicine.stock = 320;
      } else if (medicine.name === 'Amoxicillin 250mg') {
        medicine.stock = 200;
      } else if (medicine.name === 'Metformin 500mg') {
        medicine.stock = 180;
      } else if (medicine.name === 'Lisinopril 10mg') {
        medicine.stock = 150;
      } else if (medicine.name === 'Omeprazole 20mg') {
        medicine.stock = 250;
      } else if (medicine.name === 'Aspirin 75mg') {
        medicine.stock = 500;
      } else if (medicine.name === 'Vitamin D3') {
        medicine.stock = 300;
      }
    }
    
    await kv.set('medicines', medicines);
    
    return c.json({ message: 'Stock replenished successfully', medicines });
  } catch (error) {
    console.error('Error resetting stock:', error);
    return c.json({ error: 'Failed to reset stock' }, 500);
  }
});

// USERS ROUTES
app.get('/make-server-3e7703d4/users', async (c) => {
  try {
    const users = await kv.get('users') || [];
    return c.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.post('/make-server-3e7703d4/users', async (c) => {
  try {
    const userData = await c.req.json() as User;
    const users = await kv.get('users') || [];
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    await kv.set('users', users);
    
    return c.json(newUser, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// User approval/rejection routes (Admin only)
app.put('/make-server-3e7703d4/users/:id/status', async (c) => {
  try {
    const { error: authError, user: authUser } = await verifyAuth(c.req.raw);
    if (authError || !authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (authUser.user_metadata?.role !== 'Admin') {
      return c.json({ error: 'Only administrators can modify user status' }, 403);
    }

    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const users = await kv.get('users') || [];
    const userIndex = users.findIndex((u: any) => u.id === id);
    
    if (userIndex === -1) {
      return c.json({ error: 'User not found' }, 404);
    }

    users[userIndex].status = status;
    users[userIndex].updated_at = new Date().toISOString();
    
    await kv.set('users', users);
    
    return c.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user status:', error);
    return c.json({ error: 'Failed to update user status' }, 500);
  }
});

// Remove user route (Admin only)
app.delete('/make-server-3e7703d4/users/:id', async (c) => {
  try {
    const { error: authError, user: authUser } = await verifyAuth(c.req.raw);
    if (authError || !authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (authUser.user_metadata?.role !== 'Admin') {
      return c.json({ error: 'Only administrators can remove users' }, 403);
    }

    const id = c.req.param('id');
    
    // Prevent admin from removing themselves
    if (id === authUser.id) {
      return c.json({ error: 'Cannot remove your own account' }, 400);
    }

    const users = await kv.get('users') || [];
    const userToRemove = users.find((u: any) => u.id === id);
    
    if (!userToRemove) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Remove from KV store
    const filteredUsers = users.filter((u: any) => u.id !== id);
    await kv.set('users', filteredUsers);

    // Also remove from Supabase Auth if possible
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (authError) {
      console.warn('Could not remove user from auth system:', authError);
    }
    
    return c.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    return c.json({ error: 'Failed to remove user' }, 500);
  }
});

// ANALYTICS/REPORTS ROUTES
app.get('/make-server-3e7703d4/analytics/dashboard', async (c) => {
  try {
    const sales = await kv.get('sales') || [];
    const medicines = await kv.get('medicines') || [];
    const patients = await kv.get('patients') || [];
    
    // Calculate analytics
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s: Sale) => s.date.split('T')[0] === today);
    
    const totalRevenue = sales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
    const todayRevenue = todaySales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
    
    const lowStockItems = medicines.filter((m: Medicine) => m.stock <= m.minStock);
    const expiringSoon = medicines.filter((m: Medicine) => {
      const expiryDate = new Date(m.expiry);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    });
    
    return c.json({
      totalRevenue,
      todayRevenue,
      totalSales: sales.length,
      todaySales: todaySales.length,
      totalPatients: patients.length,
      totalMedicines: medicines.length,
      lowStockCount: lowStockItems.length,
      expiringSoonCount: expiringSoon.length,
      lowStockItems,
      expiringSoon
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

Deno.serve(app.fetch);