import { Hono } from "npm:hono";
import { UserController } from '../controllers/user.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const userRoutes = new Hono();

/**
 * User Management Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
userRoutes.use('*', AuthController.authenticateUser);

// User operations with different access levels
userRoutes.get('/', AuthController.requireRole('Admin'), UserController.getAll);
userRoutes.post('/', AuthController.requireRole('Admin'), UserController.create);
userRoutes.get('/pending', AuthController.requireRole('Admin'), UserController.getPending);
userRoutes.get('/:id', AuthController.requireAnyRole(['Admin']), UserController.getById);
userRoutes.put('/:id/status', AuthController.requireRole('Admin'), UserController.updateStatus);
userRoutes.put('/:id/profile', UserController.updateProfile); // Users can update their own profile
userRoutes.delete('/:id', AuthController.requireRole('Admin'), UserController.remove);

// Special user operations
userRoutes.patch('/last-login', UserController.updateLastLogin); // Any authenticated user can update their last login

export { userRoutes };