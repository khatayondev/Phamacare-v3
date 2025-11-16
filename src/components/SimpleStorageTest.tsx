import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { TestTube, Database, Zap } from "lucide-react";

export function SimpleStorageTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [storageData, setStorageData] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const checkStorage = () => {
    const data = localStorage.getItem('prescriptions');
    const parsed = data ? JSON.parse(data) : null;
    setStorageData(parsed || []);
    addLog(`Storage check: ${parsed ? parsed.length : 0} items found`);
    if (parsed && parsed.length > 0) {
      addLog(`Latest item: ${JSON.stringify(parsed[0])}`);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('prescriptions');
    setStorageData([]);
    addLog('Cleared localStorage');
  };

  const addDirectToStorage = () => {
    const newItem = {
      id: `direct-${Date.now()}`,
      prescription_number: `RX-DIRECT-${Date.now()}`,
      patientName: "Direct Test Patient",
      total: 25.00,
      status: "Pending",
      created_at: new Date().toISOString()
    };

    // Get existing data
    const existing = localStorage.getItem('prescriptions');
    const existingData = existing ? JSON.parse(existing) : [];
    
    // Add new item
    const newData = [newItem, ...existingData];
    
    // Save back
    localStorage.setItem('prescriptions', JSON.stringify(newData));
    
    addLog(`Added item directly to storage: ${newItem.prescription_number}`);
    
    // Fire event manually
    window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
      detail: newItem 
    }));
    addLog('Fired prescriptionCreated event');
    
    checkStorage();
  };

  const testEventOnly = () => {
    const testEvent = {
      id: 'event-test',
      prescription_number: 'RX-EVENT-TEST',
      patientName: 'Event Test Patient',
      total: 10.00,
      status: 'Pending'
    };

    window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
      detail: testEvent 
    }));
    addLog('Fired test event without storage');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          Simple Storage Test
          {storageData.length > 0 && (
            <Badge variant="secondary">{storageData.length} items</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={checkStorage} variant="outline" size="sm">
            <Database className="h-3 w-3 mr-1" />
            Check Storage
          </Button>
          <Button onClick={addDirectToStorage} size="sm">
            <Zap className="h-3 w-3 mr-1" />
            Add Direct
          </Button>
          <Button onClick={testEventOnly} variant="outline" size="sm">
            📡 Fire Event
          </Button>
          <Button onClick={clearStorage} variant="destructive" size="sm">
            🗑️ Clear
          </Button>
        </div>

        {/* Current Storage Data */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">Current Storage</span>
          </div>
          <div className="text-lg font-bold text-blue-700">
            {storageData.length} items in localStorage
          </div>
          {storageData.length > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              Latest: {storageData[0]?.prescription_number}
            </div>
          )}
        </div>

        {/* Recent Items */}
        {storageData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Items:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {storageData.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                  <span>{item.prescription_number}</span>
                  <span>{item.patientName}</span>
                  <span>₵{item.total}</span>
                  <Badge size="sm" variant={item.status === 'Pending' ? 'destructive' : 'default'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Activity Log:</h4>
          <div className="max-h-32 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500">No activity yet...</div>
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