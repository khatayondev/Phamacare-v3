import { Hono } from "npm:hono";
import { PatientController } from '../controllers/patient.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const patientRoutes = new Hono();

/**
 * Patient Management Routes
 * All routes require authentication
 * Admin and Pharmacist roles have full access
 */

// Apply authentication middleware to all routes
patientRoutes.use('*', AuthController.authenticateUser);

// Apply role-based access control
patientRoutes.use('*', AuthController.requireAnyRole(['Admin', 'Pharmacist']));

// Patient CRUD operations
patientRoutes.get('/', PatientController.getAll);
patientRoutes.post('/', PatientController.create);
patientRoutes.get('/search', PatientController.search);
patientRoutes.get('/:id', PatientController.getById);
patientRoutes.put('/:id', PatientController.update);
patientRoutes.delete('/:id', AuthController.requireRole('Admin'), PatientController.delete);

// Special patient operations
patientRoutes.patch('/:id/visit', PatientController.updateLastVisit);

export { patientRoutes };