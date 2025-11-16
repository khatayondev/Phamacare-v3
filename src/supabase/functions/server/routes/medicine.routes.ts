import { Hono } from "npm:hono";
import { MedicineController } from '../controllers/medicine.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const medicineRoutes = new Hono();

/**
 * Medicine Management Routes
 * All routes require authentication
 * Admin and Pharmacist roles have full access
 */

// Apply authentication middleware to all routes
medicineRoutes.use('*', AuthController.authenticateUser);

// Apply role-based access control
medicineRoutes.use('*', AuthController.requireAnyRole(['Admin', 'Pharmacist']));

// Medicine CRUD operations
medicineRoutes.get('/', MedicineController.getAll);
medicineRoutes.post('/', MedicineController.create);
medicineRoutes.put('/:id', MedicineController.update);
medicineRoutes.delete('/:id', AuthController.requireRole('Admin'), MedicineController.delete);

// Special medicine queries
medicineRoutes.get('/low-stock', MedicineController.getLowStock);
medicineRoutes.get('/expiring', MedicineController.getExpiring);

export { medicineRoutes };