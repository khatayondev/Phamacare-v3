import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Activity, 
  Users, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Server,
  Wifi,
  HardDrive
} from "lucide-react";

interface SystemMetrics {
  uptime: string;
  activeUsers: number;
  totalSessions: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  lastBackup: string;
  totalTransactions: number;
  errorRate: number;
}

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: "0h 0m",
    activeUsers: 0,
    totalSessions: 0,
    databaseConnections: 5,
    memoryUsage: 68,
    cpuUsage: 23,
    diskUsage: 45,
    networkLatency: 42,
    lastBackup: new Date().toISOString(),
    totalTransactions: 0,
    errorRate: 0.2
  });

  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    // Calculate system uptime
    const startTime = localStorage.getItem('systemStartTime');
    if (!startTime) {
      localStorage.setItem('systemStartTime', Date.now().toString());
    }

    const updateMetrics = () => {
      const now = Date.now();
      const start = parseInt(localStorage.getItem('systemStartTime') || now.toString());
      const uptimeMs = now - start;
      const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
      const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

      // Get current user count
      const currentUser = localStorage.getItem('currentUser');
      const activeUsers = currentUser ? 1 : 0;

      // Get total sessions from audit logs
      const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      const loginEvents = auditLogs.filter((log: any) => log.action === 'User Login');
      const totalSessions = loginEvents.length;

      // Get total transactions
      const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const totalTransactions = prescriptions.length + payments.length;

      // Simulate dynamic metrics
      const cpuUsage = Math.floor(Math.random() * 30) + 15; // 15-45%
      const memoryUsage = Math.floor(Math.random() * 20) + 60; // 60-80%
      const networkLatency = Math.floor(Math.random() * 30) + 30; // 30-60ms

      setMetrics({
        uptime: `${hours}h ${minutes}m`,
        activeUsers,
        totalSessions,
        databaseConnections: 5,
        memoryUsage,
        cpuUsage,
        diskUsage: 45,
        networkLatency,
        lastBackup: new Date().toISOString(),
        totalTransactions,
        errorRate: 0.2
      });

      // Determine system status
      if (cpuUsage > 80 || memoryUsage > 90 || networkLatency > 100) {
        setSystemStatus('critical');
      } else if (cpuUsage > 60 || memoryUsage > 75 || networkLatency > 80) {
        setSystemStatus('warning');
      } else {
        setSystemStatus('healthy');
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getStatusColor(systemStatus)}`}>
              {getStatusIcon(systemStatus)}
              <span className="font-semibold capitalize">{systemStatus}</span>
            </div>
            <Badge variant={systemStatus === 'healthy' ? 'default' : systemStatus === 'warning' ? 'secondary' : 'destructive'}>
              All Systems Operational
            </Badge>
            <div className="text-sm text-muted-foreground">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}</div>
            <p className="text-xs text-muted-foreground">Since last restart</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">All time logins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{metrics.cpuUsage}%</div>
            <Progress value={metrics.cpuUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {metrics.cpuUsage < 50 ? 'Normal' : metrics.cpuUsage < 80 ? 'Moderate' : 'High'} load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
            <Progress value={metrics.memoryUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {metrics.memoryUsage < 70 ? 'Normal' : metrics.memoryUsage < 85 ? 'Moderate' : 'High'} usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{metrics.diskUsage}%</div>
            <Progress value={metrics.diskUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {metrics.diskUsage < 60 ? 'Normal' : metrics.diskUsage < 80 ? 'Moderate' : 'High'} usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.networkLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.networkLatency < 50 ? 'Excellent' : metrics.networkLatency < 100 ? 'Good' : 'Slow'} response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.errorRate < 1 ? 'Excellent' : metrics.errorRate < 5 ? 'Good' : 'High'} error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Database Connections:</strong> {metrics.databaseConnections} active</p>
              <p><strong>Last Backup:</strong> {new Date(metrics.lastBackup).toLocaleString()}</p>
              <p><strong>System Version:</strong> Health Haven Pharmacy v1.0.0</p>
            </div>
            <div>
              <p><strong>Environment:</strong> Production</p>
              <p><strong>Region:</strong> Ghana West</p>
              <p><strong>Timezone:</strong> GMT+0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}