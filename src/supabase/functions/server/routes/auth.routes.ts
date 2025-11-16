import { Hono } from "npm:hono";
import { AuthController } from '../controllers/auth.controller.ts';

const authRoutes = new Hono();

/**
 * Authentication Routes
 */

// Public routes (no authentication required)
authRoutes.post('/signup', AuthController.signup);

export { authRoutes };