import { Hono } from "npm:hono";
import { AnalyticsController } from '../controllers/analytics.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const analyticsRoutes = new Hono();

/**
 * Analytics and Reporting Routes
 * All routes require authentication
 * Different access levels based on role
 */

// Apply authentication middleware to all routes
analyticsRoutes.use('*', AuthController.authenticateUser);

// Dashboard analytics - available to all authenticated users
analyticsRoutes.get('/dashboard', AnalyticsController.getDashboard);

// Sales analytics - Admin and Accountant access
analyticsRoutes.get('/sales', AuthController.requireAnyRole(['Admin', 'Accountant']), AnalyticsController.getSalesAnalytics);

// Inventory analytics - Admin and Pharmacist access
analyticsRoutes.get('/inventory', AuthController.requireAnyRole(['Admin', 'Pharmacist']), AnalyticsController.getInventoryAnalytics);

// Patient analytics - Admin and Pharmacist access
analyticsRoutes.get('/patients', AuthController.requireAnyRole(['Admin', 'Pharmacist']), AnalyticsController.getPatientAnalytics);

// Supplier analytics - Admin only
analyticsRoutes.get('/suppliers', AuthController.requireRole('Admin'), AnalyticsController.getSupplierAnalytics);

// System analytics - Admin only
analyticsRoutes.get('/system', AuthController.requireRole('Admin'), AnalyticsController.getSystemAnalytics);

export { analyticsRoutes };