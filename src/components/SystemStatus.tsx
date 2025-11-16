import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Activity, Users, ShoppingCart, DollarSign } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  prescriptions: 'healthy' | 'warning' | 'error';
  payments: 'healthy' | 'warning' | 'error';
  inventory: 'healthy' | 'warning' | 'error';
  users: 'healthy' | 'warning' | 'error';
}

interface SystemStats {
  totalPrescriptions: number;
  pendingPayments: number;
  lowStockItems: number;
  activeUsers: number;
  todayRevenue: number;
}

export function SystemStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SystemStatus>({
    database: 'healthy',
    prescriptions: 'healthy',
    payments: 'healthy',
    inventory: 'healthy',
    users: 'healthy'
  });
  const [stats, setStats] = useState<SystemStats>({
    totalPrescriptions: 0,
    pendingPayments: 0,
    lowStockItems: 0,
    activeUsers: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = () => {
    try {
      // Check prescriptions
      const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const pendingPrescriptions = prescriptions.filter((p: any) => p.status === 'Pending');
      
      // Check payments  
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const todayPayments = payments.filter((p: any) => 
        p.created_at.startsWith(new Date().toISOString().split('T')[0])
      );
      
      // Check inventory
      const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
      const lowStock = medicines.filter((m: any) => m.stock <= m.minStock);
      
      // Check users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const activeUsers = users.filter((u: any) => u.status === 'approved' || u.status === 'Active');
      
      // Calculate revenue
      const todayRevenue = todayPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
      
      // Update stats
      setStats({
        totalPrescriptions: prescriptions.length,
        pendingPayments: pendingPrescriptions.length,
        lowStockItems: lowStock.length,
        activeUsers: activeUsers.length,
        todayRevenue: todayRevenue
      });
      
      // Update status based on thresholds
      setStatus({
        database: 'healthy',
        prescriptions: pendingPrescriptions.length > 10 ? 'warning' : 'healthy',
        payments: pendingPrescriptions.length > 5 ? 'warning' : 'healthy',
        inventory: lowStock.length > 0 ? 'warning' : 'healthy',
        users: activeUsers.length === 0 ? 'error' : 'healthy'
      });
      
    } catch (error) {
      console.error('Error checking system status:', error);
      setStatus({
        database: 'error',
        prescriptions: 'error',
        payments: 'error',
        inventory: 'error',
        users: 'error'
      });
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const overallStatus = Object.values(status).includes('error') 
    ? 'error' 
    : Object.values(status).includes('warning') 
    ? 'warning' 
    : 'healthy';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {getStatusIcon(overallStatus)}
            <span className="ml-2">System Status</span>
          </span>
          {getStatusBadge(overallStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* System Health */}
          <div className="space-y-3">
            <h4 className="font-medium">System Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(status.database)}
                  <span className="ml-2">Database</span>
                </span>
                {getStatusBadge(status.database)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(status.prescriptions)}
                  <span className="ml-2">Prescriptions</span>
                </span>
                {getStatusBadge(status.prescriptions)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(status.payments)}
                  <span className="ml-2">Payments</span>
                </span>
                {getStatusBadge(status.payments)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(status.inventory)}
                  <span className="ml-2">Inventory</span>
                </span>
                {getStatusBadge(status.inventory)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(status.users)}
                  <span className="ml-2">User Accounts</span>
                </span>
                {getStatusBadge(status.users)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <h4 className="font-medium">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
                  Total Prescriptions
                </span>
                <span className="font-medium">{stats.totalPrescriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 text-yellow-600 mr-2" />
                  Pending Payments
                </span>
                <span className="font-medium">{stats.pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  Low Stock Items
                </span>
                <span className="font-medium">{stats.lowStockItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="h-4 w-4 text-green-600 mr-2" />
                  Active Users
                </span>
                <span className="font-medium">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 text-purple-600 mr-2" />
                  Today's Revenue
                </span>
                <span className="font-medium">₵{stats.todayRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(stats.lowStockItems > 0 || stats.pendingPayments > 5) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-orange-600 mb-2">System Alerts</h4>
            <div className="space-y-1 text-sm">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center text-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.lowStockItems} medicine{stats.lowStockItems > 1 ? 's' : ''} running low on stock
                </div>
              )}
              {stats.pendingPayments > 5 && (
                <div className="flex items-center text-yellow-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.pendingPayments} payments pending processing
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()} | User: {user?.name} ({user?.role})
        </div>
      </CardContent>
    </Card>
  );
}