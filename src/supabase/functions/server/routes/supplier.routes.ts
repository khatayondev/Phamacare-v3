import { Hono } from "npm:hono";
import { SupplierController } from '../controllers/supplier.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const supplierRoutes = new Hono();

/**
 * Supplier Management Routes
 * All routes require authentication
 * Admin role required for most operations
 */

// Apply authentication middleware to all routes
supplierRoutes.use('*', AuthController.authenticateUser);

// Apply role-based access control (Admin only)
supplierRoutes.use('*', AuthController.requireRole('Admin'));

// Supplier CRUD operations
supplierRoutes.get('/', SupplierController.getAll);
supplierRoutes.post('/', SupplierController.create);
supplierRoutes.get('/search', SupplierController.search);
supplierRoutes.get('/status/:status', SupplierController.getByStatus);
supplierRoutes.get('/:id', SupplierController.getById);
supplierRoutes.put('/:id', SupplierController.update);
supplierRoutes.delete('/:id', SupplierController.delete);

// Special supplier operations
supplierRoutes.patch('/:id/rating', SupplierController.updateRating);

export { supplierRoutes };