import { Context } from "npm:hono";
import { DataService } from '../services/data.service.ts';
import { Medicine } from '../models/types.ts';

export class MedicineController {
  /**
   * Get all medicines
   */
  static async getAll(c: Context) {
    try {
      const medicines = await DataService.getAll<Medicine>('medicines');
      return c.json(medicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return c.json({ error: 'Failed to fetch medicines' }, 500);
    }
  }

  /**
   * Create new medicine
   */
  static async create(c: Context) {
    try {
      const medicineData = await c.req.json() as Medicine;

      // Validate required fields
      const requiredFields = ['name', 'category', 'price', 'stock', 'minStock', 'expiry', 'supplier'];
      const missingFields = requiredFields.filter(field => !medicineData[field as keyof Medicine]);
      
      if (missingFields.length > 0) {
        return c.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, 400);
      }

      // Validate data types and values
      if (typeof medicineData.price !== 'number' || medicineData.price <= 0) {
        return c.json({ error: 'Price must be a positive number' }, 400);
      }

      if (typeof medicineData.stock !== 'number' || medicineData.stock < 0) {
        return c.json({ error: 'Stock must be a non-negative number' }, 400);
      }

      if (typeof medicineData.minStock !== 'number' || medicineData.minStock < 0) {
        return c.json({ error: 'Minimum stock must be a non-negative number' }, 400);
      }

      // Validate expiry date
      const expiryDate = new Date(medicineData.expiry);
      if (isNaN(expiryDate.getTime())) {
        return c.json({ error: 'Invalid expiry date format' }, 400);
      }

      if (expiryDate <= new Date()) {
        return c.json({ error: 'Expiry date must be in the future' }, 400);
      }

      const newMedicine = await DataService.create<Medicine>('medicines', {
        ...medicineData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return c.json(newMedicine, 201);
    } catch (error) {
      console.error('Error creating medicine:', error);
      return c.json({ error: 'Failed to create medicine' }, 500);
    }
  }

  /**
   * Update medicine
   */
  static async update(c: Context) {
    try {
      const id = c.req.param('id');
      const updateData = await c.req.json() as Partial<Medicine>;

      // Validate numeric fields if provided
      if (updateData.price !== undefined) {
        if (typeof updateData.price !== 'number' || updateData.price <= 0) {
          return c.json({ error: 'Price must be a positive number' }, 400);
        }
      }

      if (updateData.stock !== undefined) {
        if (typeof updateData.stock !== 'number' || updateData.stock < 0) {
          return c.json({ error: 'Stock must be a non-negative number' }, 400);
        }
      }

      if (updateData.minStock !== undefined) {
        if (typeof updateData.minStock !== 'number' || updateData.minStock < 0) {
          return c.json({ error: 'Minimum stock must be a non-negative number' }, 400);
        }
      }

      // Validate expiry date if provided
      if (updateData.expiry) {
        const expiryDate = new Date(updateData.expiry);
        if (isNaN(expiryDate.getTime())) {
          return c.json({ error: 'Invalid expiry date format' }, 400);
        }

        if (expiryDate <= new Date()) {
          return c.json({ error: 'Expiry date must be in the future' }, 400);
        }
      }

      const updatedMedicine = await DataService.update<Medicine>('medicines', id, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedMedicine) {
        return c.json({ error: 'Medicine not found' }, 404);
      }
      
      return c.json(updatedMedicine);
    } catch (error) {
      console.error('Error updating medicine:', error);
      return c.json({ error: 'Failed to update medicine' }, 500);
    }
  }

  /**
   * Delete medicine
   */
  static async delete(c: Context) {
    try {
      const id = c.req.param('id');
      
      const deleted = await DataService.delete('medicines', id);
      
      if (!deleted) {
        return c.json({ error: 'Medicine not found' }, 404);
      }
      
      return c.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return c.json({ error: 'Failed to delete medicine' }, 500);
    }
  }

  /**
   * Get low stock medicines
   */
  static async getLowStock(c: Context) {
    try {
      const medicines = await DataService.getAll<Medicine>('medicines');
      const lowStockItems = medicines.filter(medicine => medicine.stock <= medicine.minStock);
      
      return c.json(lowStockItems);
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
      return c.json({ error: 'Failed to fetch low stock medicines' }, 500);
    }
  }

  /**
   * Get expiring medicines
   */
  static async getExpiring(c: Context) {
    try {
      const medicines = await DataService.getAll<Medicine>('medicines');
      const daysThreshold = parseInt(c.req.query('days') || '30');
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
      
      const expiringItems = medicines.filter(medicine => {
        const expiryDate = new Date(medicine.expiry);
        return expiryDate <= thresholdDate;
      });
      
      return c.json(expiringItems);
    } catch (error) {
      console.error('Error fetching expiring medicines:', error);
      return c.json({ error: 'Failed to fetch expiring medicines' }, 500);
    }
  }
}