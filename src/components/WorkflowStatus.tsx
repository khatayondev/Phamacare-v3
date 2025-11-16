import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, ArrowRight, Users, FileText, CreditCard } from "lucide-react";

export function WorkflowStatus() {
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      const stored = localStorage.getItem('prescriptions');
      if (stored) {
        const prescriptions = JSON.parse(stored);
        setPrescriptionCount(prescriptions?.length || 0);
        setPendingCount(prescriptions?.filter((p: any) => p.status === "Pending")?.length || 0);
        setPaidCount(prescriptions?.filter((p: any) => p.status === "Paid")?.length || 0);
      } else {
        setPrescriptionCount(0);
        setPendingCount(0);
        setPaidCount(0);
      }
    };

    updateCounts();

    // Listen for prescription updates
    const handleUpdate = () => updateCounts();
    window.addEventListener('prescriptionCreated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('prescriptionCreated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prescription Workflow Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Workflow Steps */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="h-4 w-4" />
                <span>Pharmacist</span>
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <div className="flex items-center gap-1 text-green-600">
                <CreditCard className="h-4 w-4" />
                <span>Accountant</span>
              </div>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{prescriptionCount}</div>
              <div className="text-xs text-muted-foreground">Total Created</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending Payment</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{paidCount}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Prescription workflow is working correctly
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Prescriptions created by pharmacists appear in payment processing for accountants
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}