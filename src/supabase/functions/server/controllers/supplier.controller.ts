import { Context } from "npm:hono";
import { DataService } from '../services/data.service.ts';
import { Supplier } from '../models/types.ts';

export class SupplierController {
  /**
   * Get all suppliers
   */
  static async getAll(c: Context) {
    try {
      const suppliers = await DataService.getAll<Supplier>('suppliers');
      return c.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return c.json({ error: 'Failed to fetch suppliers' }, 500);
    }
  }

  /**
   * Create new supplier
   */
  static async create(c: Context) {
    try {
      const supplierData = await c.req.json() as Supplier;

      // Validate required fields
      const requiredFields = ['name', 'contact', 'phone', 'email', 'address', 'paymentTerms'];
      const missingFields = requiredFields.filter(field => !supplierData[field as keyof Supplier]);
      
      if (missingFields.length > 0) {
        return c.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplierData.email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(supplierData.phone.replace(/[\s\-\(\)]/g, ''))) {
        return c.json({ error: 'Invalid phone number format' }, 400);
      }

      // Check for duplicate email or name
      const existingSuppliers = await DataService.getAll<Supplier>('suppliers');
      if (existingSuppliers.some(s => s.email === supplierData.email)) {
        return c.json({ error: 'A supplier with this email already exists' }, 409);
      }

      if (existingSuppliers.some(s => s.name.toLowerCase() === supplierData.name.toLowerCase())) {
        return c.json({ error: 'A supplier with this name already exists' }, 409);
      }

      const newSupplier = await DataService.create<Supplier>('suppliers', {
        ...supplierData,
        status: supplierData.status || 'Active',
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return c.json(newSupplier, 201);
    } catch (error) {
      console.error('Error creating supplier:', error);
      return c.json({ error: 'Failed to create supplier' }, 500);
    }
  }

  /**
   * Update supplier
   */
  static async update(c: Context) {
    try {
      const id = c.req.param('id');
      const updateData = await c.req.json() as Partial<Supplier>;

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return c.json({ error: 'Invalid email format' }, 400);
        }

        // Check for duplicate email (excluding current supplier)
        const existingSuppliers = await DataService.getAll<Supplier>('suppliers');
        const duplicateEmail = existingSuppliers.find(s => s.email === updateData.email && s.id !== id);
        if (duplicateEmail) {
          return c.json({ error: 'A supplier with this email already exists' }, 409);
        }
      }

      // Validate phone format if provided
      if (updateData.phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(updateData.phone.replace(/[\s\-\(\)]/g, ''))) {
          return c.json({ error: 'Invalid phone number format' }, 400);
        }
      }

      // Validate name if provided
      if (updateData.name) {
        const existingSuppliers = await DataService.getAll<Supplier>('suppliers');
        const duplicateName = existingSuppliers.find(s => 
          s.name.toLowerCase() === updateData.name!.toLowerCase() && s.id !== id
        );
        if (duplicateName) {
          return c.json({ error: 'A supplier with this name already exists' }, 409);
        }
      }

      // Validate rating if provided
      if (updateData.rating !== undefined) {
        if (typeof updateData.rating !== 'number' || updateData.rating < 0 || updateData.rating > 5) {
          return c.json({ error: 'Rating must be a number between 0 and 5' }, 400);
        }
      }

      // Validate status if provided
      if (updateData.status) {
        const validStatuses = ['Active', 'Inactive', 'Pending', 'Suspended'];
        if (!validStatuses.includes(updateData.status)) {
          return c.json({ 
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
          }, 400);
        }
      }

      const updatedSupplier = await DataService.update<Supplier>('suppliers', id, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedSupplier) {
        return c.json({ error: 'Supplier not found' }, 404);
      }
      
      return c.json(updatedSupplier);
    } catch (error) {
      console.error('Error updating supplier:', error);
      return c.json({ error: 'Failed to update supplier' }, 500);
    }
  }

  /**
   * Delete supplier
   */
  static async delete(c: Context) {
    try {
      const id = c.req.param('id');
      
      const deleted = await DataService.delete('suppliers', id);
      
      if (!deleted) {
        return c.json({ error: 'Supplier not found' }, 404);
      }
      
      return c.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return c.json({ error: 'Failed to delete supplier' }, 500);
    }
  }

  /**
   * Get supplier by ID
   */
  static async getById(c: Context) {
    try {
      const id = c.req.param('id');
      const suppliers = await DataService.getAll<Supplier>('suppliers');
      const supplier = suppliers.find(s => s.id === id);
      
      if (!supplier) {
        return c.json({ error: 'Supplier not found' }, 404);
      }
      
      return c.json(supplier);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return c.json({ error: 'Failed to fetch supplier' }, 500);
    }
  }

  /**
   * Search suppliers
   */
  static async search(c: Context) {
    try {
      const query = c.req.query('q')?.toLowerCase();
      
      if (!query || query.length < 2) {
        return c.json({ error: 'Search query must be at least 2 characters long' }, 400);
      }

      const suppliers = await DataService.getAll<Supplier>('suppliers');
      const filteredSuppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(query) ||
        supplier.contact.toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query) ||
        supplier.phone.includes(query)
      );
      
      return c.json(filteredSuppliers);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      return c.json({ error: 'Failed to search suppliers' }, 500);
    }
  }

  /**
   * Update supplier rating
   */
  static async updateRating(c: Context) {
    try {
      const id = c.req.param('id');
      const { rating } = await c.req.json();

      if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return c.json({ error: 'Rating must be a number between 0 and 5' }, 400);
      }

      const updatedSupplier = await DataService.update<Supplier>('suppliers', id, {
        rating,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedSupplier) {
        return c.json({ error: 'Supplier not found' }, 404);
      }
      
      return c.json({ 
        message: 'Supplier rating updated successfully',
        supplier: updatedSupplier 
      });
    } catch (error) {
      console.error('Error updating supplier rating:', error);
      return c.json({ error: 'Failed to update supplier rating' }, 500);
    }
  }

  /**
   * Get suppliers by status
   */
  static async getByStatus(c: Context) {
    try {
      const status = c.req.param('status');
      const validStatuses = ['Active', 'Inactive', 'Pending', 'Suspended'];
      
      if (!validStatuses.includes(status)) {
        return c.json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        }, 400);
      }

      const suppliers = await DataService.getAll<Supplier>('suppliers');
      const filteredSuppliers = suppliers.filter(supplier => supplier.status === status);
      
      return c.json(filteredSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers by status:', error);
      return c.json({ error: 'Failed to fetch suppliers by status' }, 500);
    }
  }
}