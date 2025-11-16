/**
 * Utility Exports
 * Central export point for all utility functions and services
 */

// API Services
export * from './api';
export * from './backendApi';

// Storage & Data Management
export * from './localStorageService';
export * from './dashboardCache';

// Context Providers
export { CurrencyProvider, useCurrency, AVAILABLE_CURRENCIES, type Currency } from './currencyContext';

// Audit & Logging
export * from './audit';

// Export Utilities
export * from './exportUtils';

// Mobile Utilities
export * from './mobileUtils';

// Order Number Management
export * from './orderNumberGenerator';

// Supabase Configuration
export { projectId, publicAnonKey } from './supabase/info';
