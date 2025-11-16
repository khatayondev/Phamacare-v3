import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Pill, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  FileText,
  Receipt,
  CheckCircle,
  RefreshCw,
  ArrowUpRight,
  Clock,
  Bell,
  Download,
  Activity
} from "lucide-react";
import { analyticsAPI } from "../utils/backendApi";
import { useAuth } from "./AuthProvider";
import { getDashboardCache, saveDashboardCache, getDashboardCacheAge, invalidateDashboardCache } from "../utils/dashboardCache";
import { toast } from "sonner@2.0.3";

interface DashboardData {
  totalRevenue?: number;
  todayRevenue?: number;
  totalSales?: number;
  todaySales?: number;
  totalPatients?: number;
  totalMedicines?: number;
  lowStockItems?: Array<{
    name: string;
    stock: number;
    expiryDate: string;
  }>;
  expiringSoon?: Array<{
    name: string;
    expiryDate: string;
  }>;
  recentSales?: Array<{
    id: string;
    customerName: string;
    total: number;
    date: string;
  }>;
}

export function DashboardOverview() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number | null>(null);

  // Mock monthly revenue data for the chart
  const monthlyRevenue = [
    { month: 'Jan', amount: 8500 },
    { month: 'Feb', amount: 9200 },
    { month: 'Mar', amount: 7800 },
    { month: 'Apr', amount: 10500 },
    { month: 'May', amount: 12200 },
    { month: 'Jun', amount: 15000 },
    { month: 'Jul', amount: 11800 },
    { month: 'Aug', amount: 13500 },
    { month: 'Sep', amount: 14200 },
    { month: 'Oct', amount: 12800 },
    { month: 'Nov', amount: 13900 },
    { month: 'Dec', amount: 15200 }
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'New Prescription',
      user: 'Sarah Johnson',
      description: 'created prescription PQ-4491C',
      time: 'Just Now',
      icon: '💊',
      color: 'bg-green-500'
    },
    {
      id: 2,
      type: 'Payment Reminder',
      user: 'Invoice JL-3432B',
      description: 'reminder was sent to Chester Corp',
      time: 'Friday, 12:26PM',
      icon: '🔔',
      color: 'bg-yellow-500'
    }
  ];

  useEffect(() => {
    loadDashboardData();
    
    const handleDataUpdated = () => {
      console.log('📢 Data updated, invalidating dashboard cache');
      invalidateDashboardCache();
      loadDashboardData(true);
    };

    window.addEventListener('prescriptionCreated', handleDataUpdated as EventListener);
    window.addEventListener('medicinesUpdated', handleDataUpdated as EventListener);
    window.addEventListener('patientsUpdated', handleDataUpdated as EventListener);
    window.addEventListener('paymentProcessed', handleDataUpdated as EventListener);

    return () => {
      window.removeEventListener('prescriptionCreated', handleDataUpdated as EventListener);
      window.removeEventListener('medicinesUpdated', handleDataUpdated as EventListener);
      window.removeEventListener('patientsUpdated', handleDataUpdated as EventListener);
      window.removeEventListener('paymentProcessed', handleDataUpdated as EventListener);
    };
  }, []);

  const loadDashboardData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedData = getDashboardCache();
        if (cachedData) {
          console.log('✅ Loading dashboard from cache');
          setDashboardData(cachedData);
          setCacheAge(getDashboardCacheAge());
          setLoading(false);
          setError(null);
          return;
        }
      }

      console.log('🌐 Fetching fresh dashboard data from API');
      setLoading(true);
      const data = await analyticsAPI.getDashboard();
      
      saveDashboardCache(data);
      setDashboardData(data);
      setCacheAge(0);
      setError(null);
      
      if (forceRefresh) {
        toast.success('Dashboard refreshed successfully');
      }
    } catch (err) {
      // Silently handle error - data comes from localStorage
      // Don't show error toast or set error state since offline mode is normal
      setError('');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Working in Offline Mode</h3>
                <p className="text-muted-foreground mb-4">
                  The backend server is currently unavailable. The system is using local demo data. 
                  All changes will be saved locally on this device.
                </p>
                <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                  <h4 className="text-sm font-semibold mb-2 text-foreground">To connect to the backend:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Ensure your Supabase Edge Function is deployed</li>
                    <li>Check that the project ID matches: <code className="bg-gray-100 px-1 rounded text-xs">yknhljtmfcoulvxwifva</code></li>
                    <li>Verify the server is running at: <code className="bg-gray-100 px-1 rounded text-xs break-all">https://yknhljtmfcoulvxwifva.supabase.co/functions/v1/make-server-3e7703d4</code></li>
                  </ol>
                </div>
                <Button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Checking Connection...' : 'Try Again'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Show demo data if available */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Demo Mode</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">₵0</div>
                <p className="text-xs text-muted-foreground">Backend connection required</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount));

  return (
    <div className="space-y-6">
      {/* Top Stats Cards - Invoice Style with Circular Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Total Revenue</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                ₵{(dashboardData.totalRevenue || 216000).toLocaleString()}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-green-600 font-semibold">+84%</span>
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Prescriptions</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                {dashboardData.totalSales || 2221}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-green-600 font-semibold">+131</span>
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Patients</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                {dashboardData.totalPatients || 1423}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-green-600 font-semibold">+91</span>
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Stock Health</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                {dashboardData.totalMedicines ? Math.round((dashboardData.totalMedicines - (dashboardData.lowStockItems?.length || 0)) / dashboardData.totalMedicines * 100) : 92}%
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-red-600 font-semibold">-3%</span>
                <ArrowUpRight className="h-3 w-3 text-red-600 rotate-90" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Chart, Promo Card, and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-3xl font-bold text-foreground mb-1">
                ₵ {monthlyRevenue[5].amount.toLocaleString()}
              </div>
            </div>
            
            {/* Bar Chart */}
            <div className="flex items-end justify-between h-48 space-x-3">
              {monthlyRevenue.map((data, index) => {
                const height = (data.amount / maxRevenue) * 100;
                const isActive = index === 5; // June is active
                
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary' 
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      {/* Tooltip */}
                      {isActive && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                          ₵{data.amount.toLocaleString()}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 font-medium">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Promotional Card - Modern Blue Gradient */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400 rounded-full opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-300 rounded-full opacity-20 -mr-8 -mb-8"></div>
          
          <CardContent className="p-6 relative z-10">
            <Badge className="bg-white/20 text-white hover:bg-white/30 mb-4 font-semibold">
              NEW
            </Badge>
            
            <h3 className="text-xl font-bold mb-3 leading-tight">
              We have added new inventory features!
            </h3>
            
            <p className="text-sm text-blue-50 mb-6 leading-relaxed">
              New templates focused on helping you improve your pharmacy operations
            </p>
            
            <Button 
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
              onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: 'inventory' }))}
            >
              Explore Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Activities and Recent Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${activity.color} rounded-full border-2 border-white`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {activity.user} <span className="font-normal text-muted-foreground">{activity.description}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions Table */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">NO</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">Date Created</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">Patient</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">Amount</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentSales?.slice(0, 3).map((sale, index) => (
                    <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-sm font-medium text-foreground">PQ-{4490 + index}C</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-sm font-medium text-foreground">{sale.customerName}</td>
                      <td className="py-3 text-sm font-semibold text-foreground text-right">₵ {sale.total.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 font-semibold text-xs">
                          PAID
                        </Badge>
                      </td>
                    </tr>
                  )) || (
                    <>
                      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 text-sm font-medium text-foreground">PQ-4491C</td>
                        <td className="py-3 text-sm text-muted-foreground">3 Jul, 2020</td>
                        <td className="py-3 text-sm font-medium text-foreground">Daniel Padilla</td>
                        <td className="py-3 text-sm font-semibold text-foreground text-right">₵ 2,450</td>
                        <td className="py-3 text-right">
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-50 font-semibold text-xs">
                            PAID
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 text-sm font-medium text-foreground">IN-9911J</td>
                        <td className="py-3 text-sm text-muted-foreground">21 May, 2021</td>
                        <td className="py-3 text-sm font-medium text-foreground">Christina Jacobs</td>
                        <td className="py-3 text-sm font-semibold text-foreground text-right">₵ 14,810</td>
                        <td className="py-3 text-right">
                          <Badge className="bg-red-50 text-red-700 hover:bg-red-50 font-semibold text-xs">
                            OVERDUE
                          </Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 text-sm font-medium text-foreground">UV-2313A</td>
                        <td className="py-3 text-sm text-muted-foreground">14 Apr, 2020</td>
                        <td className="py-3 text-sm font-medium text-foreground">Elizabeth Bailey</td>
                        <td className="py-3 text-sm font-semibold text-foreground text-right">₵ 450</td>
                        <td className="py-3 text-right">
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-50 font-semibold text-xs">
                            PAID
                          </Badge>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
