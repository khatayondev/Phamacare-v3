import { Context } from "npm:hono";
import { DataService } from '../services/data.service.ts';

export class AnalyticsController {
  /**
   * Get dashboard analytics
   */
  static async getDashboard(c: Context) {
    try {
      const analytics = await DataService.getDashboardAnalytics();
      return c.json(analytics);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return c.json({ error: 'Failed to fetch dashboard analytics' }, 500);
    }
  }

  /**
   * Get sales analytics by period
   */
  static async getSalesAnalytics(c: Context) {
    try {
      const period = c.req.query('period') || 'month'; // day, week, month, year
      const sales = await DataService.getAll('sales');
      
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return c.json({ error: 'Invalid period. Must be: day, week, month, or year' }, 400);
      }
      
      const periodSales = sales.filter((sale: any) => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= now;
      });
      
      const totalRevenue = periodSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      const avgSaleValue = periodSales.length > 0 ? totalRevenue / periodSales.length : 0;
      
      // Group sales by day for charts
      const salesByDay: { [key: string]: { count: number; revenue: number } } = {};
      
      periodSales.forEach((sale: any) => {
        const dayKey = sale.date.split('T')[0];
        if (salesByDay[dayKey]) {
          salesByDay[dayKey].count++;
          salesByDay[dayKey].revenue += sale.total;
        } else {
          salesByDay[dayKey] = { count: 1, revenue: sale.total };
        }
      });
      
      return c.json({
        period,
        totalSales: periodSales.length,
        totalRevenue,
        avgSaleValue,
        salesByDay
      });
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      return c.json({ error: 'Failed to fetch sales analytics' }, 500);
    }
  }

  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics(c: Context) {
    try {
      const medicines = await DataService.getAll('medicines');
      
      const totalValue = medicines.reduce((sum: number, medicine: any) => 
        sum + (medicine.stock * medicine.price), 0
      );
      
      const lowStockItems = medicines.filter((medicine: any) => 
        medicine.stock <= medicine.minStock
      );
      
      const expiringSoon = medicines.filter((medicine: any) => {
        const expiryDate = new Date(medicine.expiry);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      });
      
      // Category distribution
      const categoryDistribution: { [key: string]: { count: number; value: number } } = {};
      medicines.forEach((medicine: any) => {
        if (categoryDistribution[medicine.category]) {
          categoryDistribution[medicine.category].count++;
          categoryDistribution[medicine.category].value += medicine.stock * medicine.price;
        } else {
          categoryDistribution[medicine.category] = {
            count: 1,
            value: medicine.stock * medicine.price
          };
        }
      });
      
      return c.json({
        totalMedicines: medicines.length,
        totalInventoryValue: totalValue,
        lowStockCount: lowStockItems.length,
        expiringSoonCount: expiringSoon.length,
        categoryDistribution,
        lowStockItems: lowStockItems.slice(0, 10), // Limit to top 10
        expiringSoon: expiringSoon.slice(0, 10) // Limit to top 10
      });
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      return c.json({ error: 'Failed to fetch inventory analytics' }, 500);
    }
  }

  /**
   * Get patient analytics
   */
  static async getPatientAnalytics(c: Context) {
    try {
      const patients = await DataService.getAll('patients');
      const sales = await DataService.getAll('sales');
      
      // Age distribution
      const ageGroups: { [key: string]: number } = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
      };
      
      const now = new Date();
      patients.forEach((patient: any) => {
        const birthDate = new Date(patient.dateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();
        
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      });
      
      // Recent visits (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentVisits = patients.filter((patient: any) => {
        if (!patient.lastVisit) return false;
        const visitDate = new Date(patient.lastVisit);
        return visitDate >= thirtyDaysAgo;
      });
      
      // Patient purchase history
      const patientPurchases: { [key: string]: { count: number; total: number } } = {};
      
      sales.forEach((sale: any) => {
        const patientKey = `${sale.customerName}-${sale.customerPhone}`;
        if (patientPurchases[patientKey]) {
          patientPurchases[patientKey].count++;
          patientPurchases[patientKey].total += sale.total;
        } else {
          patientPurchases[patientKey] = { count: 1, total: sale.total };
        }
      });
      
      const topPatients = Object.entries(patientPurchases)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 10)
        .map(([key, data]) => {
          const [name, phone] = key.split('-');
          return { name, phone, ...data };
        });
      
      return c.json({
        totalPatients: patients.length,
        recentVisits: recentVisits.length,
        ageDistribution: ageGroups,
        topPatients
      });
    } catch (error) {
      console.error('Error fetching patient analytics:', error);
      return c.json({ error: 'Failed to fetch patient analytics' }, 500);
    }
  }

  /**
   * Get supplier analytics
   */
  static async getSupplierAnalytics(c: Context) {
    try {
      const suppliers = await DataService.getAll('suppliers');
      const medicines = await DataService.getAll('medicines');
      
      // Supplier distribution by status
      const statusDistribution: { [key: string]: number } = {};
      suppliers.forEach((supplier: any) => {
        statusDistribution[supplier.status] = (statusDistribution[supplier.status] || 0) + 1;
      });
      
      // Medicine count per supplier
      const supplierMedicines: { [key: string]: number } = {};
      medicines.forEach((medicine: any) => {
        supplierMedicines[medicine.supplier] = (supplierMedicines[medicine.supplier] || 0) + 1;
      });
      
      // Top suppliers by medicine count
      const topSuppliers = Object.entries(supplierMedicines)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, medicineCount: count }));
      
      // Average rating
      const ratingsSuppliers = suppliers.filter((s: any) => s.rating > 0);
      const avgRating = ratingsSuppliers.length > 0 
        ? ratingsSuppliers.reduce((sum: number, s: any) => sum + s.rating, 0) / ratingsSuppliers.length 
        : 0;
      
      return c.json({
        totalSuppliers: suppliers.length,
        statusDistribution,
        topSuppliers,
        avgRating: Math.round(avgRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching supplier analytics:', error);
      return c.json({ error: 'Failed to fetch supplier analytics' }, 500);
    }
  }

  /**
   * Get comprehensive system analytics
   */
  static async getSystemAnalytics(c: Context) {
    try {
      const [
        medicines,
        patients,
        sales,
        suppliers,
        users
      ] = await Promise.all([
        DataService.getAll('medicines'),
        DataService.getAll('patients'),
        DataService.getAll('sales'),
        DataService.getAll('suppliers'),
        DataService.getAll('users')
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const todaySales = sales.filter((sale: any) => sale.date.split('T')[0] === today);
      const monthSales = sales.filter((sale: any) => sale.date.slice(0, 7) === thisMonth);
      
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      const monthRevenue = monthSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      const todayRevenue = todaySales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      
      const activeUsers = users.filter((user: any) => user.status === 'approved' || user.status === 'Active');
      const pendingUsers = users.filter((user: any) => user.status === 'pending');
      
      return c.json({
        overview: {
          totalMedicines: medicines.length,
          totalPatients: patients.length,
          totalSales: sales.length,
          totalSuppliers: suppliers.length,
          totalUsers: users.length,
          activeUsers: activeUsers.length,
          pendingUsers: pendingUsers.length
        },
        revenue: {
          total: totalRevenue,
          thisMonth: monthRevenue,
          today: todayRevenue
        },
        sales: {
          total: sales.length,
          thisMonth: monthSales.length,
          today: todaySales.length
        },
        alerts: {
          lowStock: medicines.filter((m: any) => m.stock <= m.minStock).length,
          expiringSoon: medicines.filter((m: any) => {
            const expiryDate = new Date(m.expiry);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return expiryDate <= thirtyDaysFromNow;
          }).length,
          pendingUsers: pendingUsers.length
        }
      });
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      return c.json({ error: 'Failed to fetch system analytics' }, 500);
    }
  }
}