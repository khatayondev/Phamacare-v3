import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FileText, Clock, CheckCircle, ArrowRight } from "lucide-react";

interface TestPrescription {
  id: string;
  prescription_number: string;
  patientName: string;
  total: number;
  status: "Pending" | "Paid";
  created_at: string;
}

export function PrescriptionFlowTest() {
  const [prescriptions, setPrescriptions] = useState<TestPrescription[]>([]);

  useEffect(() => {
    // Load prescriptions from localStorage
    const loadPrescriptions = () => {
      const stored = localStorage.getItem('prescriptions');
      if (stored) {
        setPrescriptions(JSON.parse(stored));
      }
    };

    loadPrescriptions();

    // Listen for prescription updates
    const handleStorageChange = () => {
      loadPrescriptions();
    };

    const handlePrescriptionCreated = () => {
      loadPrescriptions();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('prescriptionCreated', handlePrescriptionCreated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('prescriptionCreated', handlePrescriptionCreated);
    };
  }, []);

  const clearAllPrescriptions = () => {
    localStorage.removeItem('prescriptions');
    setPrescriptions([]);
    console.log('Cleared all prescriptions from localStorage');
  };

  const debugStorage = () => {
    const stored = localStorage.getItem('prescriptions');
    console.log('Current localStorage prescriptions:', stored);
    console.log('Parsed:', stored ? JSON.parse(stored) : null);
  };

  const createTestPrescription = () => {
    const testPrescription = {
      id: crypto.randomUUID(),
      prescription_number: `RX-TEST-${Date.now()}`,
      patientId: "test-patient",
      patientName: "Test Patient",
      patientPhone: "+1 (555) 000-0000",
      pharmacistId: "test-pharmacist",
      pharmacistName: "Test Pharmacist",
      items: [
        {
          medicineId: "test-med",
          medicineName: "Test Medicine",
          quantity: 1,
          price: 10.00,
          dosage: "1 tablet",
          instructions: "Take as needed"
        }
      ],
      subtotal: 10.00,
      tax: 0.80,
      total: 10.80,
      status: "Pending" as const,
      notes: "Test prescription for workflow verification",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    const updatedPrescriptions = [testPrescription, ...existingPrescriptions];
    
    localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
    setPrescriptions(updatedPrescriptions);
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
      detail: testPrescription 
    }));
  };

  const pendingCount = prescriptions.filter(p => p.status === "Pending").length;
  const paidCount = prescriptions.filter(p => p.status === "Paid").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prescription Flow Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{prescriptions.length}</div>
            <div className="text-xs text-muted-foreground">Total Prescriptions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending Payment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={createTestPrescription} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Create Test Prescription
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={debugStorage} variant="outline" size="sm">
              Debug Storage
            </Button>
            <Button onClick={clearAllPrescriptions} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Workflow Steps:</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Pharmacist creates prescription
            </span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Accountant processes payment
            </span>
          </div>
        </div>

        {prescriptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Prescriptions:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {prescriptions.slice(0, 5).map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>{prescription.prescription_number}</span>
                  <span>{prescription.patientName}</span>
                  <Badge variant={prescription.status === "Pending" ? "destructive" : "default"}>
                    {prescription.status}
                  </Badge>
                  <span>${prescription.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}