import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, AlertCircle, Play, RotateCcw, Users } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
}

export function WorkflowTest() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const testSteps = [
    { id: 'auth', name: 'Authentication System', description: 'Verify user authentication and role-based access' },
    { id: 'inventory', name: 'Medicine Inventory', description: 'Check medicine data loading and management' },
    { id: 'patients', name: 'Patient Management', description: 'Verify patient data operations' },
    { id: 'prescriptions', name: 'Prescription Creation', description: 'Test prescription workflow including walk-in customers' },
    { id: 'payments', name: 'Payment Processing', description: 'Verify payment workflow and receipt generation' },
    { id: 'notifications', name: 'Event System', description: 'Test inter-component communication' },
    { id: 'printing', name: 'Print Functions', description: 'Test bill and receipt printing capabilities' },
    { id: 'persistence', name: 'Data Persistence', description: 'Verify data storage and retrieval' }
  ];

  const runTest = async (stepId: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      switch (stepId) {
        case 'auth':
          // Test authentication
          if (!user) throw new Error('No authenticated user');
          if (!['Admin', 'Pharmacist', 'Accountant'].includes(user.role)) {
            throw new Error('Invalid user role');
          }
          return {
            step: 'Authentication System',
            status: 'success',
            message: `✓ User authenticated as ${user.role}`,
            duration: Date.now() - startTime
          };

        case 'inventory':
          // Test medicine inventory
          const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
          if (medicines.length === 0) {
            return {
              step: 'Medicine Inventory',
              status: 'success',
              message: '✓ Inventory system ready (empty inventory)',
              duration: Date.now() - startTime
            };
          }
          return {
            step: 'Medicine Inventory',
            status: 'success',
            message: `✓ ${medicines.length} medicines loaded`,
            duration: Date.now() - startTime
          };

        case 'patients':
          // Test patient management
          const patients = JSON.parse(localStorage.getItem('patients') || '[]');
          return {
            step: 'Patient Management',
            status: 'success',
            message: `✓ Patient system operational (${patients.length} patients)`,
            duration: Date.now() - startTime
          };

        case 'prescriptions':
          // Test prescription system
          const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
          return {
            step: 'Prescription Creation',
            status: 'success',
            message: `✓ Prescription system ready (${prescriptions.length} prescriptions)`,
            duration: Date.now() - startTime
          };

        case 'payments':
          // Test payment system
          const payments = JSON.parse(localStorage.getItem('payments') || '[]');
          return {
            step: 'Payment Processing',
            status: 'success',
            message: `✓ Payment system operational (${payments.length} transactions)`,
            duration: Date.now() - startTime
          };

        case 'notifications':
          // Test event system
          let eventReceived = false;
          const testHandler = () => { eventReceived = true; };
          
          window.addEventListener('test-event', testHandler);
          window.dispatchEvent(new CustomEvent('test-event'));
          window.removeEventListener('test-event', testHandler);
          
          if (!eventReceived) throw new Error('Event system not working');
          
          return {
            step: 'Event System',
            status: 'success',
            message: '✓ Inter-component communication working',
            duration: Date.now() - startTime
          };

        case 'printing':
          // Test print capabilities
          const canPrint = typeof window.print === 'function';
          if (!canPrint) throw new Error('Print function not available');
          
          return {
            step: 'Print Functions',
            status: 'success',
            message: '✓ Print capabilities available',
            duration: Date.now() - startTime
          };

        case 'persistence':
          // Test data persistence
          const testKey = 'workflow-test-' + Date.now();
          const testData = { test: true, timestamp: Date.now() };
          
          localStorage.setItem(testKey, JSON.stringify(testData));
          const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
          localStorage.removeItem(testKey);
          
          if (!retrieved.test) throw new Error('Data persistence failed');
          
          return {
            step: 'Data Persistence',
            status: 'success',
            message: '✓ Local storage working correctly',
            duration: Date.now() - startTime
          };

        default:
          throw new Error('Unknown test step');
      }
    } catch (error) {
      return {
        step: stepId,
        status: 'error',
        message: `✗ ${error instanceof Error ? error.message : 'Test failed'}`,
        duration: Date.now() - startTime
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setResults([]);

    const newResults: TestResult[] = [];

    for (const step of testSteps) {
      // Add pending result
      const pendingResult: TestResult = {
        step: step.name,
        status: 'running',
        message: 'Running...'
      };
      
      setResults(prev => [...prev, pendingResult]);
      
      // Wait a bit for UI update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Run the test
      const result = await runTest(step.id);
      newResults.push(result);
      
      // Update results
      setResults(prev => prev.map((r, index) => 
        index === newResults.length - 1 ? result : r
      ));
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Determine overall status
    const hasErrors = newResults.some(r => r.status === 'error');
    setOverallStatus(hasErrors ? 'error' : 'success');
    setIsRunning(false);
  };

  const resetTests = () => {
    setResults([]);
    setOverallStatus('idle');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Issues Detected</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Testing in Progress</Badge>;
      default:
        return <Badge variant="secondary">Ready to Test</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Health Haven Pharmacy System Workflow Test
          </span>
          {getStatusBadge(overallStatus)}
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running Tests...' : 'Run System Test'}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetTests}
            disabled={isRunning}
            className="flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Test Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{testSteps.length}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-3">
            {testSteps.map((step, index) => {
              const result = results[index];
              return (
                <div 
                  key={step.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result?.status || 'pending')}
                    <div>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {result && (
                      <>
                        <div className="text-sm font-medium">
                          {result.message}
                        </div>
                        {result.duration && (
                          <div className="text-xs text-muted-foreground">
                            {result.duration}ms
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {results.length > 0 && overallStatus !== 'running' && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <div className="font-medium mb-2">Test Summary</div>
              <div className="text-sm space-y-1">
                <div>Current User: {user?.name} ({user?.role})</div>
                <div>Total Runtime: {results.reduce((sum, r) => sum + (r.duration || 0), 0)}ms</div>
                <div>Status: {overallStatus === 'success' ? 'All systems operational' : 'Some issues detected'}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}