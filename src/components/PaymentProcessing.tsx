import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Search, CreditCard, DollarSign, Clock, CheckCircle, Eye, Loader2, Receipt } from "lucide-react";
import { ThermalPrinter } from "./ThermalPrinter";
import { prescriptionAPI, subscribeToUpdates } from "../utils/backendApi";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";
import { formatOrderDate, parseOrderNumber } from "../utils/orderNumberGenerator";

interface PendingBill {
  id: string;
  prescription_number: string;
  patientName: string;
  patientPhone: string;
  pharmacistName: string;
  items: Array<{
    medicineName: string;
    quantity: number;
    price: number;
    dosage?: string;
    instructions?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: "Pending" | "Paid" | "Dispensed";
  notes?: string;
  created_at: string;
  paid_at?: string;
  payment_method?: string;
  received_amount?: number;
  change_amount?: number;
}

export function PaymentProcessing() {
  const { user } = useAuth();
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<PendingBill | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Listen for new prescriptions - INSTANT UPDATE
  useEffect(() => {
    console.log('🎯 PaymentProcessing: Setting up event listeners');
    
    const handlePrescriptionCreated = (event: CustomEvent) => {
      const newPrescription = event.detail;
      console.log('🚀 PaymentProcessing: New prescription received!', newPrescription);
      console.log('🚀 PaymentProcessing: Current pendingBills length before update:', pendingBills.length);
      
      // Add the new prescription immediately to the pending bills
      setPendingBills(prevBills => {
        console.log('🚀 PaymentProcessing: Previous bills:', prevBills.length);
        
        // Check if prescription already exists to avoid duplicates
        const exists = prevBills.some(bill => bill.id === newPrescription.id);
        if (exists) {
          console.log('🚀 PaymentProcessing: Prescription already exists, skipping');
          return prevBills;
        }
        
        // Add new prescription to the beginning of the list for immediate visibility
        const updatedBills = [newPrescription, ...prevBills];
        console.log('🚀 PaymentProcessing: Updated bills count:', updatedBills.length);
        return updatedBills;
      });
    };

    const handlePrescriptionsUpdated = () => {
      console.log('🔄 PaymentProcessing: Prescriptions updated - refreshing data');
      fetchPendingBills(); // Full refresh when data is updated elsewhere
    };
    
    // Set up real-time polling for cross-session updates (every 10 seconds)
    // Note: Polling only updates state when data actually changes
    const cleanup = subscribeToUpdates('prescriptions', (data) => {
      const pendingOnly = data.filter((p: any) => p.status === 'Pending');
      setPendingBills(pendingOnly);
    }, 10000);

    // Test listener to verify events are working
    const handleTestEvent = (event: CustomEvent) => {
      console.log('🧪 PaymentProcessing: Test event received!', event.detail);
    };

    console.log('🎯 PaymentProcessing: Adding event listeners...');
    window.addEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
    window.addEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
    window.addEventListener('testEvent', handleTestEvent as EventListener);
    
    return () => {
      console.log('🎯 PaymentProcessing: Removing event listeners...');
      window.removeEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
      window.removeEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
      window.removeEventListener('testEvent', handleTestEvent as EventListener);
      cleanup(); // Stop polling
    };
  }, []);

  const [paymentData, setPaymentData] = useState({
    paymentMethod: "",
    receivedAmount: "",
    notes: ""
  });

  useEffect(() => {
    fetchPendingBills();
  }, []);

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending bills via API...');
      
      // Use the prescription API to get all prescriptions
      const prescriptions = await prescriptionAPI.getAll();
      console.log('Fetched prescriptions:', prescriptions);
      
      // Also check localStorage directly for debugging
      const directStorageData = localStorage.getItem('prescriptions');
      console.log('Direct localStorage prescriptions:', directStorageData);
      
      if (prescriptions && prescriptions.length > 0) {
        console.log('Setting pending bills:', prescriptions);
        setPendingBills(prescriptions);
      } else {
        // Add some demo data if no prescriptions exist
        const demoBills: PendingBill[] = [
          {
            id: crypto.randomUUID(),
            prescription_number: "RX-DEMO-001",
            patientName: "John Smith",
            patientPhone: "+1 (555) 123-4567",
            pharmacistName: "Dr. Sarah Johnson",
            items: [
              {
                medicineName: "Paracetamol 500mg",
                quantity: 2,
                price: 23.96,
                dosage: "500mg",
                instructions: "Take 1 tablet twice daily after meals"
              }
            ],
            subtotal: 47.92,
            tax: 3.84,
            total: 51.76,
            status: "Pending",
            notes: "Demo prescription for testing",
            created_at: new Date().toISOString()
          }
        ];
        setPendingBills(demoBills);
        localStorage.setItem('prescriptions', JSON.stringify(demoBills));
      }
    } catch (error) {
      console.error('Error fetching pending bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedBill) return;

    try {
      setIsProcessing(true);
      
      const receivedAmount = parseFloat(paymentData.receivedAmount);
      const changeAmount = receivedAmount - selectedBill.total;

      const updatedBill: PendingBill = {
        ...selectedBill,
        status: "Paid",
        paid_at: new Date().toISOString(),
        payment_method: paymentData.paymentMethod,
        received_amount: receivedAmount,
        change_amount: changeAmount
      };

      // Update the bill status
      const updatedBills = pendingBills.map(bill => 
        bill.id === selectedBill.id ? updatedBill : bill
      );
      
      setPendingBills(updatedBills);
      
      // Save updated bills to localStorage
      localStorage.setItem('prescriptions', JSON.stringify(updatedBills));

      // Add audit log
      addAuditLog(
        'Payment Processed',
        `Payment of ₵${receivedAmount.toFixed(2)} processed for ${selectedBill.prescription_number} (${selectedBill.patientName}) - Method: ${paymentData.paymentMethod}${changeAmount > 0 ? `, Change: ₵${changeAmount.toFixed(2)}` : ''}`,
        user?.name,
        'Payment'
      );

      setIsPaymentDialogOpen(false);
      setPaymentData({
        paymentMethod: "",
        receivedAmount: "",
        notes: ""
      });
      setSelectedBill(null);

      // Dispatch event to invalidate dashboard cache
      window.dispatchEvent(new CustomEvent('paymentProcessed', { 
        detail: updatedBill 
      }));

    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBills = (pendingBills || []).filter(bill =>
    bill?.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill?.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill?.patientPhone?.includes(searchTerm)
  );

  const pendingPaymentBills = filteredBills.filter(bill => bill?.status === "Pending");
  const paidBills = filteredBills.filter(bill => bill?.status === "Paid");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "destructive";
      case "Paid": return "default";
      case "Dispensed": return "secondary";
      default: return "outline";
    }
  };

  const calculateChange = () => {
    if (!selectedBill || !paymentData.receivedAmount) return 0;
    const received = parseFloat(paymentData.receivedAmount);
    const change = received - selectedBill.total;
    return change > 0 ? change : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading payment queue...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingPaymentBills.length}
            </div>
            <p className="text-xs text-muted-foreground">Bills awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₵{pendingPaymentBills.reduce((sum, bill) => sum + (bill?.total || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total pending collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today's Collections</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₵{paidBills
                .filter(bill => bill?.paid_at && bill.paid_at.split('T')[0] === new Date().toISOString().split('T')[0])
                .reduce((sum, bill) => sum + (bill?.total || 0), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Payments received today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed Today</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paidBills.filter(bill => 
                bill?.paid_at && bill.paid_at.split('T')[0] === new Date().toISOString().split('T')[0]
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Transactions completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Payments Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, phone, or prescription ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Pharmacist</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(pendingPaymentBills || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                        <p className="text-muted-foreground">No pending payments</p>
                        <p className="text-sm text-muted-foreground">All bills have been processed</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (pendingPaymentBills || []).map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.prescription_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bill.patientName}</p>
                          <p className="text-sm text-muted-foreground">{bill.patientPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{bill.pharmacistName}</TableCell>
                      <TableCell>{bill.items?.length || 0} items</TableCell>
                      <TableCell className="font-bold text-lg">₵{bill.total.toFixed(2)}</TableCell>
                      <TableCell>{new Date(bill.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedBill(bill)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Prescription Details - {bill.prescription_number}</DialogTitle>
                                <DialogDescription>
                                  Review prescription details before processing payment.
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBill && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Patient Information</h4>
                                      <p><strong>Name:</strong> {selectedBill.patientName}</p>
                                      <p><strong>Phone:</strong> {selectedBill.patientPhone}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Prescription Details</h4>
                                      <p><strong>Pharmacist:</strong> {selectedBill.pharmacistName}</p>
                                      <p><strong>Created:</strong> {new Date(selectedBill.created_at).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Prescribed Medicines</h4>
                                    <div className="border rounded-lg">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Medicine</TableHead>
                                            <TableHead>Dosage</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Instructions</TableHead>
                                            <TableHead>Amount</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {(selectedBill.items || []).map((item, index) => (
                                            <TableRow key={index}>
                                              <TableCell>{item.medicineName}</TableCell>
                                              <TableCell>{item.dosage}</TableCell>
                                              <TableCell>{item.quantity}</TableCell>
                                              <TableCell className="max-w-48 text-xs">{item.instructions}</TableCell>
                                              <TableCell>₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      <div className="p-4 border-t">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                          <span>Total Amount:</span>
                                          <span>₵{selectedBill.total.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {selectedBill.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2">Notes</h4>
                                      <p className="text-sm text-muted-foreground">{selectedBill.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setPaymentData({
                                    paymentMethod: "",
                                    receivedAmount: bill.total.toString(),
                                    notes: ""
                                  });
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Process Payment
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Process Payment</DialogTitle>
                                <DialogDescription>
                                  Process payment for {selectedBill?.patientName}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBill && (
                                <div className="space-y-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span>Patient:</span>
                                      <span className="font-medium">{selectedBill.patientName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>Total Amount:</span>
                                      <span className="font-bold text-xl">₵{selectedBill.total.toFixed(2)}</span>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                                        <SelectItem value="insurance">Insurance</SelectItem>
                                        <SelectItem value="mobile">Mobile Payment</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="receivedAmount">Amount Received</Label>
                                    <Input 
                                      id="receivedAmount"
                                      type="number"
                                      step="0.01"
                                      value={paymentData.receivedAmount}
                                      onChange={(e) => setPaymentData({...paymentData, receivedAmount: e.target.value})}
                                    />
                                  </div>

                                  {paymentData.paymentMethod === "cash" && parseFloat(paymentData.receivedAmount) > selectedBill.total && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <span>Change to Return:</span>
                                        <span className="font-bold text-green-700">₵{calculateChange().toFixed(2)}</span>
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <Label htmlFor="paymentNotes">Notes (Optional)</Label>
                                    <Textarea 
                                      id="paymentNotes"
                                      placeholder="Any additional notes about this payment..."
                                      value={paymentData.notes}
                                      onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                                    />
                                  </div>

                                  <Button 
                                    className="w-full" 
                                    onClick={handleProcessPayment}
                                    disabled={isProcessing || !paymentData.paymentMethod || !paymentData.receivedAmount || parseFloat(paymentData.receivedAmount) < selectedBill.total}
                                  >
                                    {isProcessing ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      "Complete Payment"
                                    )}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Completed Payments */}
      {(paidBills || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(paidBills || []).slice(0, 10).map((bill) => (
                    <TableRow key={bill?.id}>
                      <TableCell className="font-medium">{bill?.prescription_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bill?.patientName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{bill?.patientPhone || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>₵{(bill?.total || 0).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{bill?.payment_method || 'N/A'}</TableCell>
                      <TableCell>
                        {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <ThermalPrinter 
                          receiptData={{
                            id: bill?.prescription_number || 'N/A',
                            customerName: bill?.patientName || 'Unknown',
                            customerPhone: bill?.patientPhone || 'N/A',
                            items: (bill?.items || []).map(item => ({
                              medicineName: item?.medicineName || 'Unknown',
                              quantity: item?.quantity || 0,
                              price: item?.price || 0,
                              instructions: item?.instructions // Include usage instructions
                            })),
                            total: bill?.total || 0,
                            paymentMethod: bill?.payment_method || "cash",
                            date: bill?.paid_at || bill?.created_at || new Date().toISOString()
                          }}
                          onPrintSuccess={() => console.log('Receipt printed successfully')}
                          onPrintError={(error) => console.error('Print error:', error)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}