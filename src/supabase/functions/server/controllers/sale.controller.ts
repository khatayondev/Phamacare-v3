import { Context } from "npm:hono";
import { DataService } from '../services/data.service.ts';
import { Sale, Medicine } from '../models/types.ts';

export class SaleController {
  /**
   * Get all sales
   */
  static async getAll(c: Context) {
    try {
      const sales = await DataService.getAll<Sale>('sales');
      return c.json(sales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      return c.json({ error: 'Failed to fetch sales' }, 500);
    }
  }

  /**
   * Create new sale
   */
  static async create(c: Context) {
    try {
      const saleData = await c.req.json() as Sale;

      // Validate required fields
      const requiredFields = ['customerName', 'customerPhone', 'items', 'total', 'paymentMethod'];
      const missingFields = requiredFields.filter(field => !saleData[field as keyof Sale]);
      
      if (missingFields.length > 0) {
        return c.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, 400);
      }

      // Validate items array
      if (!Array.isArray(saleData.items) || saleData.items.length === 0) {
        return c.json({ error: 'Sale must include at least one item' }, 400);
      }

      // Validate each item
      for (const item of saleData.items) {
        if (!item.medicineId || !item.medicineName || !item.quantity || !item.price) {
          return c.json({ error: 'Each item must have medicineId, medicineName, quantity, and price' }, 400);
        }
        
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          return c.json({ error: 'Item quantity must be a positive number' }, 400);
        }
        
        if (typeof item.price !== 'number' || item.price <= 0) {
          return c.json({ error: 'Item price must be a positive number' }, 400);
        }
      }

      // Validate total
      if (typeof saleData.total !== 'number' || saleData.total <= 0) {
        return c.json({ error: 'Total must be a positive number' }, 400);
      }

      // Verify medicine availability and update stock
      const medicines = await DataService.getAll<Medicine>('medicines');
      const stockUpdates: Array<{ medicineId: string; quantity: number }> = [];

      for (const item of saleData.items) {
        const medicine = medicines.find((m: Medicine) => m.id === item.medicineId);
        
        if (!medicine) {
          return c.json({ error: `Medicine with ID ${item.medicineId} not found` }, 404);
        }
        
        if (medicine.stock < item.quantity) {
          return c.json({ 
            error: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}, Requested: ${item.quantity}` 
          }, 400);
        }

        stockUpdates.push({
          medicineId: item.medicineId,
          quantity: item.quantity
        });
      }

      // Update medicine stock
      await DataService.updateMedicineStock(stockUpdates);

      // Create the sale
      const newSale = await DataService.create<Sale>('sales', {
        ...saleData,
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        status: saleData.status || 'completed',
        createdAt: new Date().toISOString()
      });
      
      return c.json(newSale, 201);
    } catch (error) {
      console.error('Error creating sale:', error);
      return c.json({ error: 'Failed to create sale' }, 500);
    }
  }

  /**
   * Get sale by ID
   */
  static async getById(c: Context) {
    try {
      const id = c.req.param('id');
      const sales = await DataService.getAll<Sale>('sales');
      const sale = sales.find(s => s.id === id);
      
      if (!sale) {
        return c.json({ error: 'Sale not found' }, 404);
      }
      
      return c.json(sale);
    } catch (error) {
      console.error('Error fetching sale:', error);
      return c.json({ error: 'Failed to fetch sale' }, 500);
    }
  }

  /**
   * Update sale status
   */
  static async updateStatus(c: Context) {
    try {
      const id = c.req.param('id');
      const { status } = await c.req.json();

      const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return c.json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        }, 400);
      }

      const updatedSale = await DataService.update<Sale>('sales', id, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedSale) {
        return c.json({ error: 'Sale not found' }, 404);
      }
      
      return c.json(updatedSale);
    } catch (error) {
      console.error('Error updating sale status:', error);
      return c.json({ error: 'Failed to update sale status' }, 500);
    }
  }

  /**
   * Get sales by date range
   */
  static async getByDateRange(c: Context) {
    try {
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');

      if (!startDate || !endDate) {
        return c.json({ error: 'Both startDate and endDate are required' }, 400);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return c.json({ error: 'Invalid date format' }, 400);
      }

      if (start > end) {
        return c.json({ error: 'Start date must be before end date' }, 400);
      }

      const sales = await DataService.getAll<Sale>('sales');
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      });
      
      return c.json(filteredSales);
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      return c.json({ error: 'Failed to fetch sales by date range' }, 500);
    }
  }

  /**
   * Get sales summary/analytics
   */
  static async getSummary(c: Context) {
    try {
      const sales = await DataService.getAll<Sale>('sales');
      const today = new Date().toISOString().split('T')[0];
      
      const todaySales = sales.filter(sale => sale.date.split('T')[0] === today);
      const completedSales = sales.filter(sale => sale.status === 'completed');
      
      const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
      const todayRevenue = todaySales
        .filter(sale => sale.status === 'completed')
        .reduce((sum, sale) => sum + sale.total, 0);

      // Calculate average sale value
      const avgSaleValue = completedSales.length > 0 
        ? totalRevenue / completedSales.length 
        : 0;

      // Get top selling medicines
      const medicinesSold: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
      
      completedSales.forEach(sale => {
        sale.items.forEach(item => {
          if (medicinesSold[item.medicineId]) {
            medicinesSold[item.medicineId].quantity += item.quantity;
            medicinesSold[item.medicineId].revenue += item.quantity * item.price;
          } else {
            medicinesSold[item.medicineId] = {
              name: item.medicineName,
              quantity: item.quantity,
              revenue: item.quantity * item.price
            };
          }
        });
      });

      const topSellingMedicines = Object.entries(medicinesSold)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(([id, data]) => ({ medicineId: id, ...data }));

      return c.json({
        totalSales: sales.length,
        completedSales: completedSales.length,
        todaySales: todaySales.length,
        totalRevenue,
        todayRevenue,
        avgSaleValue,
        topSellingMedicines
      });
    } catch (error) {
      console.error('Error generating sales summary:', error);
      return c.json({ error: 'Failed to generate sales summary' }, 500);
    }
  }
}