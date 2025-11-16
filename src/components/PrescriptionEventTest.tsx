import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertCircle, CheckCircle, Zap, Database, Eye } from "lucide-react";
import { prescriptionAPI } from "../utils/backendApi";

export function PrescriptionEventTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [eventsReceived, setEventsReceived] = useState<any[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any[]>([]);
  const [apiData, setApiData] = useState<any[]>([]);
  const [testRunning, setTestRunning] = useState(false);

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${type.toUpperCase()}: ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    // Listen for prescription events
    const handlePrescriptionCreated = (event: CustomEvent) => {
      addResult(`✅ Received prescriptionCreated event!`, 'success');
      addResult(`Event detail: ${JSON.stringify(event.detail)}`, 'info');
      setEventsReceived(prev => [event.detail, ...prev.slice(0, 4)]);
      refreshDataSources();
    };

    const handlePrescriptionsUpdated = (event: CustomEvent) => {
      addResult(`📊 Received prescriptionsUpdated event`, 'info');
      refreshDataSources();
    };

    window.addEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
    window.addEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);

    // Initial data load
    refreshDataSources();

    return () => {
      window.removeEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
      window.removeEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
    };
  }, []);

  const refreshDataSources = async () => {
    try {
      // Check localStorage directly
      const localData = localStorage.getItem('prescriptions');
      const parsedLocalData = localData ? JSON.parse(localData) : [];
      setLocalStorageData(parsedLocalData);

      // Check API data
      const apiResult = await prescriptionAPI.getAll();
      setApiData(apiResult || []);

      addResult(`📁 localStorage: ${parsedLocalData.length} items`, 'info');
      addResult(`🔄 API: ${(apiResult || []).length} items`, 'info');
    } catch (error) {
      addResult(`❌ Error refreshing data: ${error}`, 'error');
    }
  };

  const runFullTest = async () => {
    setTestRunning(true);
    addResult('🧪 Starting comprehensive prescription flow test...', 'info');
    
    try {
      // Step 1: Clear existing data
      addResult('🗑️ Step 1: Clearing existing data...', 'info');
      localStorage.removeItem('prescriptions');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 2: Create test prescription via API
      addResult('📝 Step 2: Creating test prescription via API...', 'info');
      const testPrescription = {
        id: `test-${Date.now()}`,
        prescription_number: `RX-TEST-${Date.now()}`,
        patientId: "test-patient-123",
        patientName: "Test Patient",
        patientPhone: "+233 555 TEST",
        pharmacistId: "test-pharmacist",
        pharmacistName: "Test Pharmacist",
        items: [{
          medicineId: "test-med-1",
          medicineName: "Test Medicine",
          quantity: 2,
          price: 15.50,
          dosage: "1 tablet twice daily",
          instructions: "Take with food"
        }],
        subtotal: 31.00,
        tax: 2.48,
        total: 33.48,
        status: "Pending",
        notes: "Test prescription for debugging",
        created_at: new Date().toISOString()
      };

      addResult(`Creating prescription: ${testPrescription.prescription_number}`, 'info');
      
      // Step 3: Use API to create prescription
      const createdPrescription = await prescriptionAPI.create(testPrescription);
      addResult(`✅ API created prescription: ${JSON.stringify(createdPrescription)}`, 'success');

      // Step 4: Check if data was saved to localStorage
      await new Promise(resolve => setTimeout(resolve, 200));
      const storedData = localStorage.getItem('prescriptions');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        addResult(`✅ Found ${parsed.length} prescriptions in localStorage`, 'success');
        addResult(`Latest prescription: ${parsed[0]?.prescription_number}`, 'info');
      } else {
        addResult(`❌ No data found in localStorage!`, 'error');
      }

      // Step 5: Manually fire event to test listeners
      addResult('📡 Step 5: Manually firing prescriptionCreated event...', 'info');
      window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
        detail: createdPrescription 
      }));

      // Step 6: Final data verification
      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshDataSources();
      
      addResult('🎉 Test completed! Check results above.', 'success');

    } catch (error) {
      addResult(`❌ Test failed: ${error}`, 'error');
    } finally {
      setTestRunning(false);
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('prescriptions');
    setLocalStorageData([]);
    setApiData([]);
    setEventsReceived([]);
    setTestResults([]);
    addResult('🗑️ Cleared all test data', 'info');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Prescription Event Flow Test
          {eventsReceived.length > 0 && (
            <Badge variant="default">{eventsReceived.length} events</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={runFullTest} 
            disabled={testRunning}
            className="flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            {testRunning ? 'Testing...' : 'Run Full Test'}
          </Button>
          <Button onClick={refreshDataSources} variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            Refresh Data
          </Button>
          <Button onClick={clearAllData} variant="destructive" size="sm">
            🗑️ Clear All
          </Button>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Database className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-blue-700">{localStorageData.length}</div>
            <div className="text-xs text-muted-foreground">localStorage</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="font-bold text-green-700">{apiData.length}</div>
            <div className="text-xs text-muted-foreground">API Data</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Zap className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-purple-700">{eventsReceived.length}</div>
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
        </div>

        {/* Recent Events */}
        {eventsReceived.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Events:</h4>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {eventsReceived.map((event, index) => (
                <div key={index} className="text-xs p-2 bg-purple-50 rounded flex justify-between">
                  <span>{event.prescription_number}</span>
                  <span>{event.patientName}</span>
                  <span>₵{event.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results Log */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Test Results:</h4>
          <div className="max-h-48 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs space-y-1">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No test results yet. Click "Run Full Test" to start.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={
                  result.includes('ERROR') ? 'text-red-400' :
                  result.includes('SUCCESS') ? 'text-green-400' :
                  'text-gray-300'
                }>{result}</div>
              ))
            )}
          </div>
        </div>

        {/* Current Data Preview */}
        {(localStorageData.length > 0 || apiData.length > 0) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Current Data Preview:</h4>
            <div className="text-xs bg-gray-50 p-3 rounded">
              <div><strong>localStorage:</strong> {JSON.stringify(localStorageData.slice(0, 1), null, 2)}</div>
              <div className="mt-2"><strong>API:</strong> {JSON.stringify(apiData.slice(0, 1), null, 2)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}