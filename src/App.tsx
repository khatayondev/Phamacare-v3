import { useState, useEffect } from "react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { 
  LayoutDashboard, 
  Pill, 
  Users, 
  ShoppingCart, 
  FileText, 
  Settings,
  Menu,
  X,
  Truck,
  UserCheck,
  BarChart3,
  TrendingUp,
  LogOut
} from "lucide-react";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { CurrencyProvider } from "./utils/currencyContext";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { DashboardOverview } from "./components/DashboardOverview";
import { MedicineInventory } from "./components/MedicineInventory";
import { PatientManagement } from "./components/PatientManagement";
import { PrescriptionManagement } from "./components/PrescriptionManagement";
import { PaymentProcessing } from "./components/PaymentProcessing";
import { SalesManagement } from "./components/SalesManagement";
import { SupplierManagement } from "./components/SupplierManagement";
import { ReportsAnalytics } from "./components/ReportsAnalytics";
import { SettingsManagement } from "./components/SettingsManagement";
import { NotificationSystem } from "./components/NotificationSystem";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { BackendStatusIndicator } from "./components/BackendStatusIndicator";
import { SyncIndicator } from "./components/SyncIndicator";

type ViewType = "dashboard" | "inventory" | "patients" | "prescriptions" | "payments" | "sales" | "suppliers" | "reports" | "settings";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Pharmacist", "Accountant"] },
  { id: "inventory", label: "Medicine Inventory", icon: Pill, roles: ["Admin", "Pharmacist"] },
  { id: "patients", label: "Patient Management", icon: Users, roles: ["Admin", "Pharmacist"] },
  { id: "prescriptions", label: "Prescriptions & Bills", icon: FileText, roles: ["Admin", "Pharmacist"] },
  { id: "payments", label: "Payment Processing", icon: ShoppingCart, roles: ["Admin", "Accountant"] },
  { id: "sales", label: "Sales Overview", icon: TrendingUp, roles: ["Admin"] },
  { id: "suppliers", label: "Supplier Management", icon: Truck, roles: ["Admin"] },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3, roles: ["Admin"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["Admin"] },
];

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, loading, signOut } = useAuth();

  // Listen for navigation events from quick actions
  useEffect(() => {
    const handleNavigateToView = (event: CustomEvent) => {
      const view = event.detail;
      if (view === "walk-in-sale" || view === "print-bill") {
        setCurrentView("prescriptions");
      } else if (view === "print-receipt") {
        setCurrentView("payments");
      } else if (view === "user-management" || view === "all-transactions") {
        // Handle special admin views within settings
        setCurrentView("settings");
        // Also dispatch event to switch to the correct tab
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('switchSettingsTab', { detail: view }));
        }, 100);
      } else {
        setCurrentView(view as ViewType);
      }
    };

    window.addEventListener('navigateToView', handleNavigateToView as EventListener);
    return () => {
      window.removeEventListener('navigateToView', handleNavigateToView as EventListener);
    };
  }, []);

  // Filter navigation based on user role
  const navigation = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleSignOut = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview />;
      case "inventory":
        return <MedicineInventory />;
      case "patients":
        return <PatientManagement />;
      case "prescriptions":
        return <PrescriptionManagement />;
      case "payments":
        return <PaymentProcessing />;
      case "sales":
        return <SalesManagement />;
      case "suppliers":
        return <SupplierManagement />;
      case "reports":
        return <ReportsAnalytics />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/health-haven-logo.svg"
              alt="Health Haven Pharmacy"
              className="h-12 w-12 object-contain animate-pulse"
            />
          </div>
          <h2 className="text-lg font-semibold mb-2">Health Haven Pharmacy</h2>
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
      
      {/* Notification System */}
      <NotificationSystem />
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? Any unsaved changes may be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Top header - Mobile Optimized */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden -ml-2 h-10 w-10 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo - Always visible on desktop, visible after menu on mobile */}
            <div className="flex items-center space-x-2">
              <img 
                src="/health-haven-logo.svg"
                alt="Health Haven Pharmacy"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain"
              />
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-foreground">Health Haven Pharmacy</h1>
                <p className="hidden lg:block text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* System Status Indicators - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <BackendStatusIndicator />
              <SyncIndicator />
            </div>
            
            {/* User profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
                <span className="text-sm sm:text-base font-semibold text-white">{user?.name?.charAt(0)}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-foreground">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Optimized */}
      <div className={`fixed left-0 top-0 h-screen w-72 sm:w-64 bg-white border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <img 
              src="/health-haven-logo.svg"
              alt="Health Haven Pharmacy"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Health Haven Pharmacy</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info Card - Mobile Only */}
        <div className="lg:hidden mx-4 mt-4 p-4 bg-gradient-to-br from-blue-50 to-primary/5 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center shadow-md">
              <span className="text-lg font-semibold text-white">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
              <div className="flex items-center mt-1 space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 px-3 sm:px-4 py-4 pb-24">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as ViewType);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 font-medium touch-manipulation ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground active:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-sm sm:text-base">{item.label}</span>
                {/* Add notification badge for certain items if needed */}
                {item.id === 'prescriptions' && (
                  <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Log Out button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-border">
          <button
            onClick={confirmLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 font-medium text-red-600 hover:bg-red-50 active:bg-red-100 touch-manipulation"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Log Out</span>
          </button>
        </div>
      </div>

      {/* Main content - Mobile Optimized */}
      <div className="pt-16 sm:pt-20 lg:ml-64 min-h-screen">
        {/* Page content */}
        <main className="p-3 sm:p-4 md:p-6 pb-20 sm:pb-6">
          {renderCurrentView()}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2 max-w-screen-sm mx-auto">
            {navigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as ViewType);
                  }}
                  className={`flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-lg min-w-[60px] transition-all touch-manipulation ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-400 active:bg-gray-100'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    {item.id === 'prescriptions' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthFlow() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  if (user) {
    return <AppContent />;
  }

  return isLogin ? (
    <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AuthFlow />
        </AuthProvider>
      </CurrencyProvider>
    </TooltipProvider>
  );
}