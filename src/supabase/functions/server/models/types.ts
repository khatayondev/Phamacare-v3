/**
 * PharmaCare Management System - Core Data Models
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the pharmacy management system backend API.
 */

// === Core Entity Models ===

export interface Medicine {
  id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  expiry: string;
  supplier: string;
  description?: string;
  batchNumber?: string;
  manufacturer?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
  lastVisit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id?: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  patientId?: string;
  prescriptionId?: string;
  items: SaleItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  date: string;
  processedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dosage?: string;
  instructions?: string;
}

export interface Supplier {
  id?: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  country?: string;
  paymentTerms: string;
  status: SupplierStatus;
  rating?: number;
  totalOrders?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  lastLogin?: string;
  createdDate: string;
  updatedAt?: string;
  permissions?: string[];
}

export interface Prescription {
  id?: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  prescribedBy?: string;
  items: PrescriptionItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: PrescriptionStatus;
  dateCreated: string;
  dateUpdated?: string;
  notes?: string;
  createdBy?: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// === Authentication & Authorization ===

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user?: AuthUser;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  error?: string;
  message?: string;
}

// === API Response Types ===

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Analytics & Reporting ===

export interface DashboardAnalytics {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  todaySales: number;
  monthlySales: number;
  totalPatients: number;
  totalMedicines: number;
  lowStockCount: number;
  expiringSoonCount: number;
  pendingPrescriptions: number;
  completedPayments: number;
  lowStockItems: Medicine[];
  expiringSoon: Medicine[];
  topSellingMedicines: Array<{
    medicine: Medicine;
    totalSold: number;
    revenue: number;
  }>;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  entityType: EntityType;
  entityId: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastChecked: string;
  services: {
    database: ServiceStatus;
    auth: ServiceStatus;
    storage: ServiceStatus;
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    errorRate: number;
  };
}

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: string;
  message?: string;
}

// === Enumerations ===

export type UserRole = 'Admin' | 'Pharmacist' | 'Accountant';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'approved' | 'rejected';

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'insurance';

export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded' | 'partially_refunded';

export type PrescriptionStatus = 'draft' | 'pending_payment' | 'paid' | 'dispensed' | 'cancelled';

export type SupplierStatus = 'active' | 'inactive' | 'suspended' | 'blacklisted';

export type ActivityType = 
  | 'user_login' 
  | 'user_logout' 
  | 'medicine_added' 
  | 'medicine_updated' 
  | 'medicine_deleted'
  | 'patient_added' 
  | 'patient_updated' 
  | 'prescription_created' 
  | 'prescription_updated'
  | 'sale_completed' 
  | 'payment_processed' 
  | 'stock_updated' 
  | 'supplier_added'
  | 'user_created' 
  | 'user_approved' 
  | 'system_backup' 
  | 'system_maintenance';

export type EntityType = 'user' | 'medicine' | 'patient' | 'prescription' | 'sale' | 'supplier' | 'system';

// === Validation & Constraints ===

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: (value: any) => boolean | string;
}

export interface MedicineCategory {
  id: string;
  name: string;
  description?: string;
  requiresPrescription: boolean;
  taxRate?: number;
}

// === Audit & Compliance ===

export interface AuditLog {
  id: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  userId: string;
  userName: string;
  changes?: Record<string, { before: any; after: any }>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplianceReport {
  reportId: string;
  generatedBy: string;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalPrescriptions: number;
    totalSales: number;
    controlledSubstances: number;
    auditableEvents: number;
  };
  violations?: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }>;
}