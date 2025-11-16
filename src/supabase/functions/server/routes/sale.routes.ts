import { Hono } from "npm:hono";
import { SaleController } from '../controllers/sale.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const saleRoutes = new Hono();

/**
 * Sales Management Routes
 * All routes require authentication
 * Access varies by role
 */

// Apply authentication middleware to all routes
saleRoutes.use('*', AuthController.authenticateUser);

// Sales operations - different access levels
saleRoutes.get('/', AuthController.requireAnyRole(['Admin', 'Pharmacist', 'Accountant']), SaleController.getAll);
saleRoutes.post('/', AuthController.requireAnyRole(['Admin', 'Pharmacist']), SaleController.create);
saleRoutes.get('/summary', AuthController.requireAnyRole(['Admin', 'Accountant']), SaleController.getSummary);
saleRoutes.get('/date-range', AuthController.requireAnyRole(['Admin', 'Accountant']), SaleController.getByDateRange);
saleRoutes.get('/:id', AuthController.requireAnyRole(['Admin', 'Pharmacist', 'Accountant']), SaleController.getById);
saleRoutes.patch('/:id/status', AuthController.requireAnyRole(['Admin', 'Accountant']), SaleController.updateStatus);

export { saleRoutes };