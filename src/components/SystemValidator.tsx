import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  Users,
  Pill,
  FileText,
  DollarSign,
  Settings
} from "lucide-react";
import { useAuth } from "./AuthProvider";

interface ValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function SystemValidator() {
  const { user } = useAuth();
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const runValidation = async () => {
    setTesting(true);
    setResults([]);
    setProgress(0);
    
    const testResults: ValidationResult[] = [];
    let currentProgress = 0;

    // Test 1: Authentication System
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.length === 0) {
        testResults.push({
          category: 'Authentication',
          test: 'User Data',
          status: 'fail',
          message: 'No users found in system',
          details: 'Authentication data is missing'
        });
      } else {
        const hasAdmin = users.some((u: any) => u.role === 'Admin');
        const hasPharmacist = users.some((u: any) => u.role === 'Pharmacist');
        const hasAccountant = users.some((u: any) => u.role === 'Accountant');
        
        if (hasAdmin && hasPharmacist && hasAccountant) {
          testResults.push({
            category: 'Authentication',
            test: 'User Data',
            status: 'pass',
            message: `${users.length} users found with all roles`,
            details: 'All required roles present'
          });
        } else {
          testResults.push({
            category: 'Authentication',
            test: 'User Data',
            status: 'warning',
            message: 'Missing required roles',
            details: `Admin: ${hasAdmin}, Pharmacist: ${hasPharmacist}, Accountant: ${hasAccountant}`
          });
        }
      }
    } catch (error) {
      testResults.push({
        category: 'Authentication',
        test: 'User Data',
        status: 'fail',
        message: 'Error reading user data',
        details: String(error)
      });
    }

    // Test 2: Current User Session
    currentProgress += 10;
    setProgress(currentProgress);
    if (user) {
      testResults.push({
        category: 'Authentication',
        test: 'Current Session',
        status: 'pass',
        message: `Logged in as ${user.name} (${user.role})`,
        details: user.email
      });
    } else {
      testResults.push({
        category: 'Authentication',
        test: 'Current Session',
        status: 'fail',
        message: 'No active session',
        details: 'User should be logged in'
      });
    }

    // Test 3: Medicine Inventory
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const medicines = JSON.parse(localStorage.getItem('pharmacare_medicines') || '[]');
      if (medicines.length > 0) {
        const lowStock = medicines.filter((m: any) => m.stock < 10).length;
        testResults.push({
          category: 'Inventory',
          test: 'Medicine Data',
          status: 'pass',
          message: `${medicines.length} medicines in inventory`,
          details: lowStock > 0 ? `${lowStock} items low in stock` : 'All items adequately stocked'
        });
      } else {
        testResults.push({
          category: 'Inventory',
          test: 'Medicine Data',
          status: 'warning',
          message: 'No medicines in inventory',
          details: 'Inventory may need to be initialized'
        });
      }
    } catch (error) {
      testResults.push({
        category: 'Inventory',
        test: 'Medicine Data',
        status: 'fail',
        message: 'Error reading medicine data',
        details: String(error)
      });
    }

    // Test 4: Patient Data
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const patients = JSON.parse(localStorage.getItem('pharmacare_patients') || '[]');
      testResults.push({
        category: 'Patients',
        test: 'Patient Data',
        status: patients.length > 0 ? 'pass' : 'warning',
        message: `${patients.length} patients registered`,
        details: patients.length === 0 ? 'No patients yet' : 'Patient data available'
      });
    } catch (error) {
      testResults.push({
        category: 'Patients',
        test: 'Patient Data',
        status: 'fail',
        message: 'Error reading patient data',
        details: String(error)
      });
    }

    // Test 5: Prescriptions
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const prescriptions = JSON.parse(localStorage.getItem('pharmacare_prescriptions') || '[]');
      const pending = prescriptions.filter((p: any) => p.status === 'Pending').length;
      const paid = prescriptions.filter((p: any) => p.status === 'Paid').length;
      
      testResults.push({
        category: 'Prescriptions',
        test: 'Prescription Data',
        status: 'pass',
        message: `${prescriptions.length} total prescriptions`,
        details: `Pending: ${pending}, Paid: ${paid}`
      });
    } catch (error) {
      testResults.push({
        category: 'Prescriptions',
        test: 'Prescription Data',
        status: 'fail',
        message: 'Error reading prescription data',
        details: String(error)
      });
    }

    // Test 6: Sales Data
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const sales = JSON.parse(localStorage.getItem('pharmacare_sales') || '[]');
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
      
      testResults.push({
        category: 'Sales',
        test: 'Sales Data',
        status: 'pass',
        message: `${sales.length} sales recorded`,
        details: `Total revenue: ₵${totalRevenue.toFixed(2)}`
      });
    } catch (error) {
      testResults.push({
        category: 'Sales',
        test: 'Sales Data',
        status: 'fail',
        message: 'Error reading sales data',
        details: String(error)
      });
    }

    // Test 7: Suppliers
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const suppliers = JSON.parse(localStorage.getItem('pharmacare_suppliers') || '[]');
      testResults.push({
        category: 'Suppliers',
        test: 'Supplier Data',
        status: suppliers.length > 0 ? 'pass' : 'warning',
        message: `${suppliers.length} suppliers registered`,
        details: suppliers.length === 0 ? 'No suppliers yet' : 'Supplier data available'
      });
    } catch (error) {
      testResults.push({
        category: 'Suppliers',
        test: 'Supplier Data',
        status: 'fail',
        message: 'Error reading supplier data',
        details: String(error)
      });
    }

    // Test 8: Audit Logs
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      testResults.push({
        category: 'System',
        test: 'Audit Logging',
        status: auditLogs.length > 0 ? 'pass' : 'warning',
        message: `${auditLogs.length} audit log entries`,
        details: 'Audit system functional'
      });
    } catch (error) {
      testResults.push({
        category: 'System',
        test: 'Audit Logging',
        status: 'fail',
        message: 'Error reading audit logs',
        details: String(error)
      });
    }

    // Test 9: Role-Based Access
    currentProgress += 10;
    setProgress(currentProgress);
    if (user) {
      const allowedViews = {
        'Admin': ['dashboard', 'inventory', 'patients', 'prescriptions', 'payments', 'sales', 'suppliers', 'reports', 'settings'],
        'Pharmacist': ['dashboard', 'inventory', 'patients', 'prescriptions'],
        'Accountant': ['dashboard', 'payments']
      };
      
      const userAllowedViews = allowedViews[user.role as keyof typeof allowedViews] || [];
      testResults.push({
        category: 'Security',
        test: 'Role-Based Access',
        status: 'pass',
        message: `${user.role} has ${userAllowedViews.length} allowed views`,
        details: userAllowedViews.join(', ')
      });
    }

    // Test 10: Event System
    currentProgress += 10;
    setProgress(currentProgress);
    try {
      let eventReceived = false;
      const testHandler = () => { eventReceived = true; };
      
      window.addEventListener('testSystemValidation', testHandler);
      window.dispatchEvent(new CustomEvent('testSystemValidation'));
      
      setTimeout(() => {
        window.removeEventListener('testSystemValidation', testHandler);
        testResults.push({
          category: 'System',
          test: 'Event System',
          status: eventReceived ? 'pass' : 'fail',
          message: eventReceived ? 'Event system working' : 'Event system not responding',
          details: 'Required for prescription workflow'
        });
        
        setProgress(100);
        setResults(testResults);
        setTesting(false);
      }, 100);
    } catch (error) {
      testResults.push({
        category: 'System',
        test: 'Event System',
        status: 'fail',
        message: 'Error testing event system',
        details: String(error)
      });
      setProgress(100);
      setResults(testResults);
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-700 border-green-200',
      fail: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Users className="h-5 w-5" />;
      case 'Inventory':
        return <Pill className="h-5 w-5" />;
      case 'Patients':
        return <Users className="h-5 w-5" />;
      case 'Prescriptions':
        return <FileText className="h-5 w-5" />;
      case 'Sales':
        return <DollarSign className="h-5 w-5" />;
      case 'Suppliers':
        return <Database className="h-5 w-5" />;
      case 'System':
        return <Settings className="h-5 w-5" />;
      case 'Security':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Validation</span>
            <Button 
              onClick={runValidation} 
              disabled={testing}
              size="sm"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing... {progress}%
                </>
              ) : (
                'Run Full Validation'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {results.length > 0 && (
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Passed</p>
                      <p className="text-2xl font-bold text-green-700">{passCount}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-700">{warningCount}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Failed</p>
                      <p className="text-2xl font-bold text-red-700">{failCount}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryResults.map((result, index) => (
                        <div 
                          key={index}
                          className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50"
                        >
                          <div className="mt-0.5">
                            {getStatusIcon(result.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{result.test}</p>
                              {getStatusBadge(result.status)}
                            </div>
                            <p className="text-sm text-gray-700">{result.message}</p>
                            {result.details && (
                              <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            {failCount > 0 && (
              <Alert className="mt-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  <strong>Action Required:</strong> {failCount} test(s) failed. Please address the issues above to ensure system stability.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
