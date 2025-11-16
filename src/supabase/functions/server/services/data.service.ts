import * as kv from '../kv_store.tsx';
import { Medicine, Patient, Sale, Supplier, User, DashboardAnalytics } from '../models/types.ts';

export class DataService {
  /**
   * Initialize default system data
   */
  static async initializeDefaultData(): Promise<void> {
    try {
      // Check if data already exists
      const existingData = await kv.get('medicines_initialized');
      if (existingData) return;

      console.log('Initializing default system data...');

      // Initialize medicines
      const defaultMedicines: Medicine[] = [
        {
          id: '1',
          name: 'Paracetamol 500mg',
          category: 'Pain Relief',
          price: 1.50,
          stock: 450,
          minStock: 50,
          expiry: '2025-12-31',
          supplier: 'MedSupply Co',
          description: 'Pain relief and fever reducer',
          batchNumber: 'PAR2024001',
          manufacturer: 'PharmaCorp'
        },
        {
          id: '2',
          name: 'Ibuprofen 400mg',
          category: 'Anti-inflammatory',
          price: 2.25,
          stock: 320,
          minStock: 40,
          expiry: '2025-10-15',
          supplier: 'PharmaCorp',
          description: 'Anti-inflammatory pain relief',
          batchNumber: 'IBU2024002',
          manufacturer: 'MedSupply'
        },
        {
          id: '3',
          name: 'Vitamin D3 1000IU',
          category: 'Vitamins',
          price: 5.95,
          stock: 280,
          minStock: 30,
          expiry: '2026-03-20',
          supplier: 'VitaHealth',
          description: 'Vitamin D supplement',
          batchNumber: 'VTD2024003',
          manufacturer: 'VitaHealth'
        },
        {
          id: '4',
          name: 'Amoxicillin 250mg',
          category: 'Antibiotics',
          price: 2.80,
          stock: 15,
          minStock: 25,
          expiry: '2025-08-10',
          supplier: 'MedSupply Co',
          description: 'Antibiotic for bacterial infections',
          batchNumber: 'AMX2024004',
          manufacturer: 'PharmaCorp'
        },
        {
          id: '5',
          name: 'Cough Syrup',
          category: 'Respiratory',
          price: 8.50,
          stock: 5,
          minStock: 20,
          expiry: '2025-06-30',
          supplier: 'RemedyMed',
          description: 'Cough suppressant syrup',
          batchNumber: 'CSY2024005',
          manufacturer: 'RemedyMed'
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

      // Initialize users
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

      // Store initial data
      await kv.set('medicines', defaultMedicines);
      await kv.set('patients', defaultPatients);
      await kv.set('suppliers', defaultSuppliers);
      await kv.set('users', defaultUsers);
      await kv.set('sales', []);
      await kv.set('medicines_initialized', true);

      console.log('Default data initialized successfully');
    } catch (error) {
      console.error('Error initializing default data:', error);
      throw error;
    }
  }

  /**
   * Generate dashboard analytics
   */
  static async getDashboardAnalytics(): Promise<DashboardAnalytics> {
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
      
      return {
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
      };
    } catch (error) {
      console.error('Error generating dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Update medicine stock after sale
   */
  static async updateMedicineStock(saleItems: Array<{ medicineId: string; quantity: number }>): Promise<void> {
    try {
      const medicines = await kv.get('medicines') || [];
      
      for (const item of saleItems) {
        const medicineIndex = medicines.findIndex((m: Medicine) => m.id === item.medicineId);
        if (medicineIndex !== -1) {
          medicines[medicineIndex].stock -= item.quantity;
          if (medicines[medicineIndex].stock < 0) {
            medicines[medicineIndex].stock = 0;
          }
        }
      }
      
      await kv.set('medicines', medicines);
    } catch (error) {
      console.error('Error updating medicine stock:', error);
      throw error;
    }
  }

  /**
   * Generic CRUD operations
   */
  static async getAll<T>(collection: string): Promise<T[]> {
    try {
      return await kv.get(collection) || [];
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      throw error;
    }
  }

  static async create<T>(collection: string, item: T): Promise<T> {
    try {
      const items = await this.getAll(collection);
      const newItem = {
        ...item,
        id: Date.now().toString()
      };
      items.push(newItem);
      await kv.set(collection, items);
      return newItem;
    } catch (error) {
      console.error(`Error creating ${collection} item:`, error);
      throw error;
    }
  }

  static async update<T>(collection: string, id: string, updateData: Partial<T>): Promise<T | null> {
    try {
      const items = await this.getAll(collection);
      const index = items.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        return null;
      }
      
      items[index] = { ...items[index], ...updateData };
      await kv.set(collection, items);
      return items[index];
    } catch (error) {
      console.error(`Error updating ${collection} item:`, error);
      throw error;
    }
  }

  static async delete(collection: string, id: string): Promise<boolean> {
    try {
      const items = await this.getAll(collection);
      const filteredItems = items.filter((item: any) => item.id !== id);
      
      if (filteredItems.length === items.length) {
        return false; // Item not found
      }
      
      await kv.set(collection, filteredItems);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collection} item:`, error);
      throw error;
    }
  }
}