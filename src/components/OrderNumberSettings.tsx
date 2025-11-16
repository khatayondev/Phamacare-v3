/**
 * Order Number Settings Component
 * Admin panel for viewing and managing order number system
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  FileText, 
  ShoppingCart, 
  Calendar, 
  Hash, 
  RefreshCw, 
  Download, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { 
  getTodayStats, 
  previewNextNumbers, 
  exportCounterData, 
  importCounterData,
  resetCounters 
} from "../utils/orderNumberGenerator";

export function OrderNumberSettings() {
  const [stats, setStats] = useState(getTodayStats());
  const [nextNumbers, setNextNumbers] = useState(previewNextNumbers());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats(getTodayStats());
      setNextNumbers(previewNextNumbers());
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    // Refresh data every 10 seconds
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = exportCounterData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-counters-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const jsonData = event.target?.result as string;
          if (importCounterData(jsonData)) {
            refreshData();
            alert('Counter data imported successfully!');
          } else {
            alert('Failed to import counter data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    resetCounters();
    refreshData();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return 'Invalid Date';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl tracking-tight">Order Number System</h2>
          <p className="text-muted-foreground">
            Manage and monitor unique order numbering
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Today's Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Orders Today</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {formatDate(stats.date)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.totalPrescriptions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Patient prescriptions with RX prefix
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Walk-in Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Quick sales with ORD prefix
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Available Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Next Available Numbers
          </CardTitle>
          <CardDescription>
            These numbers will be assigned to the next orders created
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Next Prescription</span>
              </div>
              <Badge className="font-mono text-base bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">
                {nextNumbers.nextPrescription}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingCart className="h-4 w-4 text-green-500" />
                <span>Next Walk-in Order</span>
              </div>
              <Badge className="font-mono text-base bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                {nextNumbers.nextOrder}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>Number Format</CardTitle>
          <CardDescription>
            Understanding the order numbering system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Prescription Format:</strong> RX-YYYYMMDD-XXXX
                </div>
                <div className="text-sm text-muted-foreground">
                  Example: <code className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">RX-20241115-0001</code>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  • RX = Prescription prefix<br/>
                  • 20241115 = Date (Nov 15, 2024)<br/>
                  • 0001 = Sequential number for the day
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Walk-in Order Format:</strong> ORD-YYYYMMDD-XXXX
                </div>
                <div className="text-sm text-muted-foreground">
                  Example: <code className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded">ORD-20241115-0042</code>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  • ORD = Order prefix<br/>
                  • 20241115 = Date (Nov 15, 2024)<br/>
                  • 0042 = Sequential number for the day
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-500/5 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-900">Key Features:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Unique numbers guaranteed - no duplicates</li>
                  <li>Date-based tracking for easy organization</li>
                  <li>Sequential numbering resets daily at midnight</li>
                  <li>Separate counters for prescriptions and walk-in orders</li>
                  <li>Persistent storage - survives page refreshes</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Counter Management</CardTitle>
          <CardDescription>
            Backup, restore, or reset order counters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </Button>
            <Button 
              variant="outline" 
              onClick={handleImport}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Backup
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReset}
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reset Counters
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Resetting counters will start numbering from 0001 again. 
              This may cause confusion with existing orders. Only reset if you understand the implications.
              Always export a backup before resetting.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
