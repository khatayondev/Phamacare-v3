/**
 * Component Exports
 * Central export point for all application components
 */

// Core Authentication & Layout
export { AuthProvider, useAuth } from './AuthProvider';
export { LoginPage } from './LoginPage';
export { SignupPage } from './SignupPage';

// Main Dashboard Components
export { DashboardOverview } from './DashboardOverview';
export { MedicineInventory } from './MedicineInventory';
export { PatientManagement } from './PatientManagement';
export { PrescriptionManagement } from './PrescriptionManagement';
export { PaymentProcessing } from './PaymentProcessing';
export { SalesManagement } from './SalesManagement';
export { SupplierManagement } from './SupplierManagement';
export { ReportsAnalytics } from './ReportsAnalytics';
export { SettingsManagement } from './SettingsManagement';

// Settings Sub-Components
export { UserManagement } from './UserManagement';
export { AllTransactionsOverview } from './AllTransactionsOverview';

// System Components
export { NotificationSystem } from './NotificationSystem';
export { BackendStatusIndicator } from './BackendStatusIndicator';
export { SyncIndicator } from './SyncIndicator';
export { ThermalPrinter } from './ThermalPrinter';
export { OrderNumberDisplay, OrderNumberBadge } from './OrderNumberDisplay';
export { OrderNumberSettings } from './OrderNumberSettings';

// Monitoring & Status Components
export { CompletionStatus } from './CompletionStatus';
export { SystemHealthDashboard } from './SystemHealthDashboard';
export { SystemValidator } from './SystemValidator';

// Debug & Development Components (should only be used in development)
export { AuthDebugger } from './AuthDebugger';
export { CSSDebugger } from './CSSDebugger';
export { DataFlowDebugger } from './DataFlowDebugger';
export { SystemMonitoring } from './SystemMonitoring';
export { SystemStatus } from './SystemStatus';
export { WorkflowStatus } from './WorkflowStatus';

// Test Components (for development and testing only)
export { PaymentProcessingTest } from './PaymentProcessingTest';
export { PrescriptionEventTest } from './PrescriptionEventTest';
export { PrescriptionFlowTest } from './PrescriptionFlowTest';
export { ProductionReadyReport } from './ProductionReadyReport';
export { SimpleStorageTest } from './SimpleStorageTest';
export { WorkflowTest } from './WorkflowTest';
