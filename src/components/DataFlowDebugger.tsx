import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RefreshCw, Bug, Database, Zap } from "lucide-react";
import { prescriptionAPI } from "../utils/backendApi";

export function DataFlowDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [eventCount, setEventCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    addLog("DataFlowDebugger mounted");

    // Listen for all prescription events
    const handlePrescriptionCreated = (event: CustomEvent) => {
      setEventCount(prev => prev + 1);
      addLog(`🚀 prescriptionCreated event received: ${JSON.stringify(event.detail)}`);
      refreshData();
    };

    const handlePrescriptionsUpdated = (event: CustomEvent) => {
      addLog(`📊 prescriptionsUpdated event received`);
      refreshData();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'prescriptions') {
        addLog(`💾 localStorage changed for prescriptions`);
        refreshData();
      }
    };

    window.addEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
    window.addEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Initial data load
    refreshData();

    return () => {
      window.removeEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
      window.removeEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshData = async () => {
    try {
      // Get direct localStorage data
      const directData = localStorage.getItem('prescriptions');
      const parsedDirectData = directData ? JSON.parse(directData) : null;
      setLocalStorageData(parsedDirectData);
      addLog(`📁 localStorage has ${parsedDirectData?.length || 0} prescriptions`);

      // Get API data
      const apiResult = await prescriptionAPI.getAll();
      setApiData(apiResult);
      addLog(`🔄 API returned ${apiResult?.length || 0} prescriptions`);

      // Compare data
      if (JSON.stringify(parsedDirectData) === JSON.stringify(apiResult)) {
        addLog("✅ localStorage and API data match");
      } else {
        addLog("❌ localStorage and API data DO NOT match");
        addLog(`📊 localStorage: ${JSON.stringify(parsedDirectData)?.substring(0, 100)}...`);
        addLog(`🔄 API: ${JSON.stringify(apiResult)?.substring(0, 100)}...`);
      }
    } catch (error) {
      addLog(`❌ Error refreshing data: ${error}`);
    }
  };

  const createTestPrescription = async () => {
    try {
      const testData = {
        id: `test-${Date.now()}`,
        prescription_number: `RX-DEBUG-${Date.now()}`,
        patientId: "debug-patient",
        patientName: "Debug Patient",
        patientPhone: "+233 555 DEBUG",
        pharmacistId: "debug-pharmacist", 
        pharmacistName: "Debug Pharmacist",
        items: [{
          medicineId: "debug-med",
          medicineName: "Debug Medicine",
          quantity: 1,
          price: 10.00,
          dosage: "1 tablet",
          instructions: "For debugging"
        }],
        subtotal: 10.00,
        tax: 0.80,
        total: 10.80,
        status: "Pending",
        notes: "Created by debugger",
        created_at: new Date().toISOString()
      };

      addLog(`🧪 Creating test prescription: ${testData.prescription_number}`);
      
      // Create via API
      const result = await prescriptionAPI.create(testData);
      addLog(`✅ API create returned: ${JSON.stringify(result)}`);
      
      // Manually dispatch event (in case API doesn't)
      window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
        detail: result 
      }));
      addLog(`📡 Manually dispatched prescriptionCreated event`);
      
    } catch (error) {
      addLog(`❌ Error creating test prescription: ${error}`);
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('prescriptions');
    setLocalStorageData(null);
    setApiData(null);
    addLog("🗑️ Cleared all prescription data");
    refreshData();
  };

  const testEventSystem = () => {
    const testData = { id: 'test-event', message: 'Testing event system' };
    window.dispatchEvent(new CustomEvent('prescriptionCreated', { detail: testData }));
    addLog("🧪 Fired test prescriptionCreated event");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-600" />
          Data Flow Debugger
          {eventCount > 0 && (
            <Badge variant="secondary">{eventCount} events</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button onClick={createTestPrescription} variant="outline" size="sm">
            <Zap className="h-3 w-3 mr-1" />
            Test Create
          </Button>
          <Button onClick={testEventSystem} variant="outline" size="sm">
            📡 Test Events
          </Button>
          <Button onClick={clearAllData} variant="destructive" size="sm">
            🗑️ Clear All
          </Button>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">localStorage</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {localStorageData?.length || 0} items
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">API Data</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              {apiData?.length || 0} items
            </div>
          </div>
        </div>

        {/* Recent Data */}
        {(localStorageData?.length > 0 || apiData?.length > 0) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Prescriptions:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {(apiData || localStorageData || []).slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                  <span>{item.prescription_number}</span>
                  <span>{item.patientName}</span>
                  <span>₵{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Debug Logs:</h4>
          <div className="max-h-48 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}