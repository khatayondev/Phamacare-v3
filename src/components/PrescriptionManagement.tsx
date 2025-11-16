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
import { Search, Plus, Eye, FileText, Clock, CheckCircle, Loader2, Minus, Printer, Receipt, UserPlus, Download, ChevronDown, Check, X, AlertTriangle } from "lucide-react";
import { medicineAPI, patientAPI, prescriptionAPI, subscribeToUpdates } from "../utils/backendApi";
import { useAuth } from "./AuthProvider";
import { useCurrency } from "../utils/currencyContext";
import { addAuditLog } from "../utils/audit";
import { exportPrescription, exportData } from "../utils/exportUtils";
import { toast } from "sonner@2.0.3";
import { generatePrescriptionNumber, generateOrderNumber, parseOrderNumber, formatOrderDate, isValidOrderNumber } from "../utils/orderNumberGenerator";

interface Prescription {
  id: string;
  prescription_number: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  pharmacistId: string;
  pharmacistName: string;
  items: Array<{
    medicineId: string;
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
  isWalkIn?: boolean;
  created_at: string;
  updated_at: string;
}

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
}

// Common medication instructions for dropdown
const COMMON_INSTRUCTIONS = [
  "Take 1 tablet twice daily after meals",
  "Take 1 tablet once daily before breakfast",
  "Take 2 tablets three times daily",
  "Take 1 tablet every 6 hours",
  "Take 1 tablet every 8 hours",
  "Take 1 tablet at bedtime",
  "Take 1 tablet as needed for pain",
  "Take 1 tablet as needed for fever",
  "Apply thin layer twice daily",
  "Apply as needed to affected area",
  "Apply every 6 hours",
  "Apply before meals",
  "Use 2 drops in each eye twice daily",
  "Use 3 drops in affected ear twice daily",
  "Dissolve 1 tablet under tongue",
  "Chew 1-2 tablets after meals",
  "Mix 1 sachet with water and drink",
  "Take 5ml (1 teaspoon) three times daily",
  "Take 10ml (2 teaspoons) twice daily",
  "Use before meals",
  "Use after meals",
  "Use on empty stomach",
  "Complete the full course",
  "Continue until symptoms improve"
];

// Interactive Instructions Selector Component
interface InstructionsSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

function InstructionsSelector({ value, onChange }: InstructionsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Filter instructions based on search term
  const filteredInstructions = COMMON_INSTRUCTIONS.filter(instruction =>
    instruction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current value is a custom instruction (not in common list)
  useEffect(() => {
    if (value && !COMMON_INSTRUCTIONS.includes(value)) {
      setIsCustomMode(true);
    }
  }, [value]);

  const handleSelectInstruction = (instruction: string) => {
    onChange(instruction);
    setIsOpen(false);
    setSearchTerm("");
    setIsCustomMode(false);
  };

  const handleCustomInput = (customValue: string) => {
    onChange(customValue);
    setIsCustomMode(true);
  };

  return (
    <div className="relative">
      {!isCustomMode ? (
        <div className="space-y-2">
          {/* Dropdown for common instructions */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between h-10 text-left font-normal"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={value ? "text-foreground" : "text-muted-foreground"}>
                {value || "Select common instruction..."}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            
            {isOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {/* Search box */}
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search instructions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                  />
                </div>
                
                {/* Instructions list */}
                <div className="py-1">
                  {filteredInstructions.length > 0 ? (
                    filteredInstructions.map((instruction, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center"
                        onClick={() => handleSelectInstruction(instruction)}
                      >
                        {value === instruction && <Check className="h-4 w-4 mr-2 text-primary" />}
                        <span className={value === instruction ? "ml-0" : "ml-6"}>{instruction}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No instructions found
                    </div>
                  )}
                </div>
                
                {/* Custom option */}
                <div className="border-t">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-accent transition-colors"
                    onClick={() => {
                      setIsCustomMode(true);
                      setIsOpen(false);
                    }}
                  >
                    + Write custom instruction
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick clear button */}
          {value && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Custom input mode */}
          <Input
            placeholder="Enter custom instructions..."
            value={value}
            onChange={(e) => handleCustomInput(e.target.value)}
            className="min-h-10"
          />
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCustomMode(false);
                setSearchTerm("");
              }}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              ← Back to common instructions
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Smart Medicine Search Component
interface SmartMedicineSearchProps {
  medicines: Medicine[];
  onSelect: (medicineId: string) => void;
  value: string;
  formatAmount: (amount: number) => string;
}

function SmartMedicineSearch({ medicines, onSelect, value, formatAmount }: SmartMedicineSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter(m => 
    m?.stock > 0 && (
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).slice(0, 10); // Limit to 10 results for performance

  // Update selected medicine when value changes
  useEffect(() => {
    if (value) {
      const medicine = medicines.find(m => m.id === value);
      setSelectedMedicine(medicine || null);
      setSearchTerm(medicine?.name || "");
    } else {
      setSelectedMedicine(null);
      setSearchTerm("");
    }
  }, [value, medicines]);

  const handleSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSearchTerm(medicine.name);
    onSelect(medicine.id);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedMedicine(null);
    setSearchTerm("");
    onSelect("");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search medicine by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              handleClear();
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredMedicines.length > 0 ? (
            <div className="py-1">
              {filteredMedicines.map((medicine) => (
                <button
                  key={medicine.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleSelect(medicine)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{medicine.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatAmount(medicine.price)}
                      </div>
                    </div>
                    {selectedMedicine?.id === medicine.id && (
                      <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No medicines found
            </div>
          )}
        </div>
      )}

      {/* Display selected medicine info */}
      {selectedMedicine && !isOpen && (
        <div className={`mt-2 p-2 border rounded-md text-sm ${
          selectedMedicine.stock <= 10 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span className={`font-medium ${selectedMedicine.stock <= 10 ? 'text-orange-900' : 'text-blue-900'}`}>
                {selectedMedicine.name}
              </span>
              <span className={`ml-2 ${selectedMedicine.stock <= 10 ? 'text-orange-700' : 'text-blue-700'}`}>
                ₵{selectedMedicine.price.toFixed(2)}
              </span>
            </div>
            <span className={`text-xs font-medium ${
              selectedMedicine.stock <= 0 ? 'text-red-600' : 
              selectedMedicine.stock <= 10 ? 'text-orange-600' : 
              'text-blue-600'
            }`}>
              Stock: {selectedMedicine.stock}
              {selectedMedicine.stock <= 10 && selectedMedicine.stock > 0 && ' ⚠️'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PrescriptionManagement() {
  const { user } = useAuth();
  const { formatAmount, currency } = useCurrency();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    isWalkIn: false,
    walkInCustomer: {
      name: "",
      phone: ""
    },
    notes: "",
    items: [] as Array<{
      medicineId: string;
      medicineName: string;
      quantity: number;
      price: number;
      dosage: string;
      instructions: string;
    }>
  });

  const [currentItem, setCurrentItem] = useState({
    medicineId: "",
    quantity: 1,
    dosage: "",
    instructions: ""
  });

  useEffect(() => {
    fetchData();

    // Listen for data updates from other components
    const handlePatientsUpdated = () => fetchData();
    const handleMedicinesUpdated = () => fetchData();
    const handlePrescriptionsUpdated = (event: CustomEvent) => {
      setPrescriptions(event.detail);
    };

    window.addEventListener('patientsUpdated', handlePatientsUpdated);
    window.addEventListener('medicinesUpdated', handleMedicinesUpdated);
    window.addEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
    
    // Set up real-time polling for prescription updates (every 10 seconds)
    // Note: Polling only updates state when data actually changes
    const cleanupPolling = subscribeToUpdates('prescriptions', (data) => {
      setPrescriptions(data);
    }, 10000);
    
    return () => {
      window.removeEventListener('patientsUpdated', handlePatientsUpdated);
      window.removeEventListener('medicinesUpdated', handleMedicinesUpdated);
      window.removeEventListener('prescriptionsUpdated', handlePrescriptionsUpdated as EventListener);
      cleanupPolling(); // Stop polling
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medicinesData, patientsData, prescriptionsData] = await Promise.all([
        medicineAPI.getAll(),
        patientAPI.getAll(),
        prescriptionAPI.getAll()
      ]);
      setMedicines(medicinesData);
      setPatients(patientsData);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItemToPrescription = () => {
    const medicine = medicines.find(m => m.id === currentItem.medicineId);
    if (!medicine) return;

    // Check if stock is sufficient
    if (medicine.stock < currentItem.quantity) {
      toast.error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stock} units. Please reduce quantity or replenish stock.`);
      return;
    }

    // Check if medicine is already in the prescription
    const existingItemIndex = newPrescription.items.findIndex(item => item.medicineId === medicine.id);
    
    if (existingItemIndex >= 0) {
      // Medicine already exists, check total quantity
      const existingQuantity = newPrescription.items[existingItemIndex].quantity;
      const totalQuantity = existingQuantity + currentItem.quantity;
      
      if (medicine.stock < totalQuantity) {
        toast.error(`Insufficient stock for ${medicine.name}. You already have ${existingQuantity} units in this prescription. Available: ${medicine.stock} units total.`);
        return;
      }
      
      // Update existing item
      setNewPrescription(prev => ({
        ...prev,
        items: prev.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: totalQuantity }
            : item
        )
      }));
      
      toast.success(`Updated ${medicine.name} quantity to ${totalQuantity} units`);
    } else {
      // Add new item
      const newItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: currentItem.quantity,
        price: medicine.price,
        dosage: "", // Keep for compatibility but don't use
        instructions: currentItem.instructions
      };

      setNewPrescription(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      
      toast.success(`Added ${medicine.name} to prescription`);
    }

    setCurrentItem({ 
      medicineId: "", 
      quantity: 1, 
      dosage: "", // Keep for compatibility 
      instructions: "" 
    });
  };

  const removeItemFromPrescription = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return (newPrescription.items || []).reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0);
  };

  const handleCreatePrescription = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation
      if (newPrescription.items.length === 0) {
        toast.error('Please add at least one medicine to the prescription');
        setIsSubmitting(false);
        return;
      }
      
      let patientName, patientPhone, patientId;
      
      if (newPrescription.isWalkIn) {
        // Walk-in customers don't require name/phone for quick sales
        patientName = newPrescription.walkInCustomer?.name || 'Walk-in Customer';
        patientPhone = newPrescription.walkInCustomer?.phone || 'N/A';
        patientId = `walk-in-${Date.now()}`;
      } else {
        const selectedPatient = patients.find(p => p.id === newPrescription.patientId);
        if (!selectedPatient) {
          toast.error('Please select a patient');
          setIsSubmitting(false);
          return;
        }
        patientName = selectedPatient.name;
        patientPhone = selectedPatient.phone;
        patientId = newPrescription.patientId;
      }

      const subtotal = calculateTotal();
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      const prescriptionData: Prescription = {
        id: crypto.randomUUID(),
        prescription_number: newPrescription.isWalkIn 
          ? generateOrderNumber() 
          : generatePrescriptionNumber(),
        patientId: patientId,
        patientName: patientName,
        patientPhone: patientPhone,
        pharmacistId: user?.id || "unknown",
        pharmacistName: user?.name || "Unknown Pharmacist",
        items: newPrescription.items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: "Pending",
        notes: newPrescription.notes,
        isWalkIn: newPrescription.isWalkIn,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any;

      // Save to persistent API
      console.log('Creating prescription:', prescriptionData);
      const createdPrescription = await prescriptionAPI.create(prescriptionData);
      console.log('Prescription created via API:', createdPrescription);
      
      // Add audit log
      addAuditLog(
        newPrescription.isWalkIn ? 'Walk-in Sale Created' : 'Prescription Created',
        `${newPrescription.isWalkIn ? 'Order' : 'Prescription'} ${prescriptionData.prescription_number} for ${patientName} - Total: ${currency.symbol}${total.toFixed(2)} (${prescriptionData.items.length} items)`,
        user?.name,
        'Prescription'
      );
      
      // Update local state immediately (optimistic update)
      const updatedPrescriptions = [createdPrescription, ...prescriptions];
      setPrescriptions(updatedPrescriptions);
      
      // Show success message
      toast.success(
        newPrescription.isWalkIn 
          ? `Order ${prescriptionData.prescription_number} created successfully!`
          : `Prescription ${prescriptionData.prescription_number} created successfully!`
      );
      
      // Only close dialog and reset form on SUCCESS
      setIsAddDialogOpen(false);
      setNewPrescription({
        patientId: "",
        isWalkIn: false,
        walkInCustomer: { name: "", phone: "" },
        notes: "",
        items: []
      });
      setCurrentItem({ medicineId: "", quantity: 1, dosage: "", instructions: "" });
      
      // Trigger a custom event to notify other components
      console.log('Dispatching prescriptionCreated event with:', createdPrescription);
      window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
        detail: createdPrescription 
      }));
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      
      // Parse error message from backend
      const errorMessage = error?.message || 'Failed to create prescription';
      
      // Check if it's a stock error
      if (errorMessage.includes('Insufficient stock')) {
        // Extract medicine name and stock details from error message
        const stockMatch = errorMessage.match(/Insufficient stock for (.+?)\. Available: (\d+), Required: (\d+)/);
        
        if (stockMatch) {
          const [, medicineName, available, required] = stockMatch;
          toast.error(
            `❌ Cannot Create: ${medicineName} has only ${available} units in stock, but you requested ${required} units. Please reduce the quantity or visit Medicine Inventory to replenish stock.`,
            { duration: 10000 }
          );
        } else {
          toast.error(`❌ ${errorMessage}`, { duration: 6000 });
        }
        
        // Refresh medicines to get updated stock levels
        await fetchData();
      } else {
        // Other errors
        toast.error(`❌ Error: ${errorMessage}. Please try again.`, { duration: 5000 });
      }
      
      // IMPORTANT: Dialog stays OPEN, form data is PRESERVED
      // User can now adjust quantities and submit again without losing work
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSimpleBill = (prescription: Prescription) => {
    const billContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${prescription.prescription_number}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            margin: 20px; 
            line-height: 1.6;
            text-align: center;
          }
          .header { 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
          }
          .bill-info {
            margin: 20px 0;
            font-size: 16px;
          }
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            border: 2px solid #000;
            padding: 15px;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #000;
            padding-top: 15px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PHARMACARE MANAGEMENT SYSTEM</h2>
          <h3>${(prescription as any).isWalkIn ? 'SALES BILL' : 'PRESCRIPTION BILL'}</h3>
        </div>
        
        <div class="bill-info">
          <div><strong>${(prescription as any).isWalkIn ? 'Order Number:' : 'Prescription Code:'}</strong> ${prescription.prescription_number}</div>
          <div><strong>Date:</strong> ${new Date(prescription.created_at).toLocaleDateString()}</div>
          <div><strong>Time:</strong> ${new Date(prescription.created_at).toLocaleTimeString()}</div>
          <div><strong>Customer:</strong> ${prescription.patientName}</div>
          <div><strong>Phone:</strong> ${prescription.patientPhone}</div>
          <div><strong>Pharmacist:</strong> ${prescription.pharmacistName}</div>
        </div>
        
        <div class="total-amount">
          <div>TOTAL AMOUNT</div>
          <div>${currency.symbol}${prescription.total.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          <p>Please present this bill to the accountant for payment processing.</p>
          <p>Keep this bill as proof of your ${(prescription as any).isWalkIn ? 'purchase' : 'prescription'}.</p>
          <p>Thank you for choosing Health Haven Pharmacy!</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      // Add audit log
      addAuditLog(
        'Bill Printed',
        `Printed bill for ${prescription.isWalkIn ? 'order' : 'prescription'} ${prescription.prescription_number} - ${prescription.patientName}`,
        user?.name,
        'Prescription'
      );
    }
  };

  const handlePrintOrderSlip = (prescription: Prescription) => {
    const orderSlipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Slip - ${prescription.prescription_number}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            margin: 20px; 
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .section { 
            margin-bottom: 20px; 
          }
          .label { 
            font-weight: bold; 
            display: inline-block; 
            width: 120px; 
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
          }
          .items-table th, .items-table td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #f0f0f0; 
            font-weight: bold; 
          }
          .total-section { 
            border-top: 2px solid #000; 
            padding-top: 10px; 
            text-align: right; 
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PHARMACARE MANAGEMENT SYSTEM</h2>
          <h3>PRESCRIPTION ORDER SLIP</h3>
        </div>
        
        <div class="section">
          <div><span class="label">Order Number:</span> ${prescription.prescription_number}</div>
          <div><span class="label">Date:</span> ${new Date(prescription.created_at).toLocaleDateString()}</div>
          <div><span class="label">Time:</span> ${new Date(prescription.created_at).toLocaleTimeString()}</div>
        </div>
        
        <div class="section">
          <h4>PATIENT INFORMATION</h4>
          <div><span class="label">Name:</span> ${prescription.patientName}</div>
          <div><span class="label">Phone:</span> ${prescription.patientPhone}</div>
        </div>
        
        <div class="section">
          <h4>PHARMACIST INFORMATION</h4>
          <div><span class="label">Name:</span> ${prescription.pharmacistName}</div>
        </div>
        
        <div class="section">
          <h4>PRESCRIPTION ITEMS</h4>
          <table class="items-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Dosage</th>
                <th>Instructions</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.items.map(item => `
                <tr>
                  <td>${item.medicineName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.dosage || 'N/A'}</td>
                  <td>${item.instructions || 'N/A'}</td>
                  <td>${currency.symbol}${item.price.toFixed(2)}</td>
                  <td>${currency.symbol}${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="total-section">
          <div><strong>Subtotal: ${currency.symbol}${prescription.subtotal.toFixed(2)}</strong></div>
          <div><strong>Tax (8%): ${currency.symbol}${prescription.tax.toFixed(2)}</strong></div>
          <div style="font-size: 18px; margin-top: 10px;"><strong>TOTAL: ${currency.symbol}${prescription.total.toFixed(2)}</strong></div>
        </div>
        
        ${prescription.notes ? `
          <div class="section">
            <h4>ADDITIONAL NOTES</h4>
            <p>${prescription.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Status: ${prescription.status}</p>
          <p>This is a computer-generated order slip.</p>
          <p>Please present this slip to the accountant for payment processing.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(orderSlipContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      // Add audit log
      addAuditLog(
        'Order Slip Printed',
        `Printed order slip for ${prescription.isWalkIn ? 'order' : 'prescription'} ${prescription.prescription_number} - ${prescription.patientName}`,
        user?.name,
        'Prescription'
      );
    }
  };

  const handleExportPrescription = (prescription: Prescription, format: 'pdf' | 'csv') => {
    exportPrescription(prescription, {
      format,
      filename: `prescription_${prescription.prescription_number}`,
      title: `Prescription ${prescription.prescription_number}`
    });

    // Add audit log
    addAuditLog(
      'Prescription Export',
      `Exported prescription ${prescription.prescription_number} in ${format.toUpperCase()} format - ${prescription.patientName}`,
      user?.name,
      'Prescription'
    );
  };

  const handleExportAllPrescriptions = (format: 'pdf' | 'csv' | 'excel') => {
    try {
      console.log('Starting prescriptions export:', format);
      
      // Prepare data for export
      const exportData = filteredPrescriptions.map(prescription => ({
        'Prescription/Order Number': prescription.prescription_number,
        'Patient Name': prescription.patientName,
        'Patient Phone': prescription.patientPhone,
        'Pharmacist': prescription.pharmacistName,
        [`Subtotal (${currency.symbol})`]: prescription.subtotal.toFixed(2),
        [`Tax (${currency.symbol})`]: prescription.tax.toFixed(2),
        [`Total (${currency.symbol})`]: prescription.total.toFixed(2),
        Status: prescription.status,
        Type: prescription.isWalkIn ? 'Walk-in Sale' : 'Prescription',
        'Created Date': new Date(prescription.created_at).toLocaleDateString(),
        'Items Count': prescription.items.length
      }));

      console.log('Prescriptions export data prepared:', exportData);

      import('../utils/exportUtils').then(({ exportData: exportDataUtil }) => {
        exportDataUtil(exportData, {
          format,
          filename: `prescriptions_report_${Date.now()}`,
          title: 'Prescriptions & Bills Report',
          subtitle: `Generated on ${new Date().toLocaleDateString()} | Total Records: ${exportData.length}`
        });

        // Add audit log
        addAuditLog(
          'Prescriptions Export',
          `Exported prescriptions report in ${format.toUpperCase()} format - ${exportData.length} records`,
          user?.name,
          'Prescription'
        );
      }).catch(error => {
        console.error('Error importing export utilities:', error);
        alert('Error exporting prescriptions. Please try again.');
      });
    } catch (error) {
      console.error('Error in handleExportAllPrescriptions:', error);
      alert('Error preparing prescriptions export. Please try again.');
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "destructive";
      case "Paid": return "default";
      case "Dispensed": return "secondary";
      default: return "outline";
    }
  };

  // Filter prescriptions based on search term
  const filteredPrescriptions = (prescriptions || []).filter(prescription =>
    prescription?.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription?.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription?.patientPhone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading prescriptions...</p>
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
            <CardTitle className="text-sm text-muted-foreground">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(prescriptions || []).length}</div>
            <p className="text-xs text-muted-foreground">All time prescriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(prescriptions || []).filter(p => p?.status === "Pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {prescriptions.filter(p => p.status === "Paid").length}
            </div>
            <p className="text-xs text-muted-foreground">Payment completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today's Revenue</CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{(prescriptions || [])
                .filter(p => p?.created_at && p.created_at.split('T')[0] === new Date().toISOString().split('T')[0])
                .reduce((sum, p) => sum + (p?.total || 0), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Today's prescriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Prescription Management</CardTitle>
            <div className="flex gap-2">
              {/* Export Options */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handleExportAllPrescriptions('pdf')}>
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportAllPrescriptions('csv')}>
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportAllPrescriptions('excel')}>
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </Button>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {newPrescription.isWalkIn ? 'Process Walk-in Sale' : 'Create New Prescription'}
                  </DialogTitle>
                  <DialogDescription>
                    {newPrescription.isWalkIn 
                      ? 'Process a direct sale to a walk-in customer.'
                      : 'Create a prescription for a patient with medicine details and dosage instructions.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Customer Type Selection */}
                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <input
                      type="radio"
                      id="registered"
                      name="customerType"
                      checked={!newPrescription.isWalkIn}
                      onChange={() => setNewPrescription({...newPrescription, isWalkIn: false, patientId: ""})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="registered" className="cursor-pointer">Registered Patient</Label>
                    
                    <input
                      type="radio"
                      id="walkin"
                      name="customerType"
                      checked={newPrescription.isWalkIn}
                      onChange={() => setNewPrescription({...newPrescription, isWalkIn: true, patientId: ""})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="walkin" className="cursor-pointer">Walk-in Customer</Label>
                  </div>

                  {/* Patient/Customer Selection */}
                  {!newPrescription.isWalkIn ? (
                    <div>
                      <Label htmlFor="patientSelect">Select Patient</Label>
                      <Select value={newPrescription.patientId} onValueChange={(value) => setNewPrescription({...newPrescription, patientId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {(patients || []).map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} - {patient.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Walk-in Sale - Quick Checkout</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Customer details are optional. Leave blank for anonymous quick sales.
                        </p>
                      </div>
                      
                      {/* Optional customer details */}
                      <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-gray-50">
                        <div>
                          <Label className="text-sm text-muted-foreground">Customer Name (Optional)</Label>
                          <Input 
                            placeholder="Optional"
                            value={newPrescription.walkInCustomer?.name || ''}
                            onChange={(e) => setNewPrescription({
                              ...newPrescription, 
                              walkInCustomer: {...newPrescription.walkInCustomer, name: e.target.value}
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Phone Number (Optional)</Label>
                          <Input 
                            placeholder="Optional"
                            value={newPrescription.walkInCustomer?.phone || ''}
                            onChange={(e) => setNewPrescription({
                              ...newPrescription, 
                              walkInCustomer: {...newPrescription.walkInCustomer, phone: e.target.value}
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Add Medicines</Label>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Search Medicine *</Label>
                        <SmartMedicineSearch
                          medicines={medicines}
                          value={currentItem.medicineId}
                          onSelect={(medicineId) => setCurrentItem({...currentItem, medicineId})}
                          formatAmount={formatAmount}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Quantity *</Label>
                        <Input 
                          type="number" 
                          min="1"
                          max={(() => {
                            const medicine = medicines.find(m => m.id === currentItem.medicineId);
                            if (!medicine) return 999;
                            const existingItem = newPrescription.items.find(item => item.medicineId === medicine.id);
                            const existingQty = existingItem ? existingItem.quantity : 0;
                            return medicine.stock - existingQty;
                          })()}
                          placeholder="Enter quantity"
                          value={currentItem.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            const medicine = medicines.find(m => m.id === currentItem.medicineId);
                            if (medicine) {
                              const existingItem = newPrescription.items.find(item => item.medicineId === medicine.id);
                              const existingQty = existingItem ? existingItem.quantity : 0;
                              const maxAvailable = medicine.stock - existingQty;
                              
                              if (newQty > maxAvailable) {
                                toast.error(`Only ${maxAvailable} units available`);
                                setCurrentItem({...currentItem, quantity: maxAvailable > 0 ? maxAvailable : 1});
                              } else {
                                setCurrentItem({...currentItem, quantity: newQty});
                              }
                            } else {
                              setCurrentItem({...currentItem, quantity: newQty});
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Usage Instructions (Optional)</Label>
                        <InstructionsSelector
                          value={currentItem.instructions}
                          onChange={(instructions) => setCurrentItem({...currentItem, instructions})}
                        />
                      </div>
                      <div>
                        <Button 
                          type="button" 
                          onClick={addItemToPrescription}
                          disabled={!currentItem.medicineId}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Prescription
                        </Button>
                      </div>
                    </div>
                  </div>

                  {newPrescription.items.length > 0 && (
                    <div>
                      <Label>Prescription Items</Label>
                      <div className="border rounded-lg mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medicine</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Instructions</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newPrescription.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.medicineName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell className="max-w-48 truncate">{item.instructions}</TableCell>
                                <TableCell>{formatAmount(item.price * item.quantity)}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeItemFromPrescription(index)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="p-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Amount:</span>
                            <span className="text-xl font-bold">{formatAmount(calculateTotal())}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Any additional notes or instructions for this prescription..."
                      value={newPrescription.notes}
                      onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleCreatePrescription}
                    disabled={isSubmitting || 
                      (!newPrescription.isWalkIn && !newPrescription.patientId) || 
                      newPrescription.items.length === 0
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Prescription...
                      </>
                    ) : (
                      `${newPrescription.isWalkIn ? 'Process Sale' : 'Create Prescription'} - ${formatAmount(calculateTotal())}`
                    )}
                  </Button>
                </div>
              </DialogContent>
              </Dialog>
              
              <Button
              variant="outline"
              onClick={() => {
                setNewPrescription({
                  ...newPrescription,
                  isWalkIn: true,
                  patientId: ""
                });
                setIsAddDialogOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Walk-in Sale
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions by patient name, phone, or prescription ID..."
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
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredPrescriptions || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-muted-foreground">No prescriptions found</p>
                        <p className="text-sm text-muted-foreground">Create your first prescription to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (filteredPrescriptions || []).map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">{prescription?.prescription_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescription?.patientName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{prescription?.patientPhone || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{prescription?.items?.length || 0} items</TableCell>
                      <TableCell>₵{(prescription?.total || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(prescription?.status || 'Unknown') as any}>
                          {prescription?.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{prescription?.created_at ? new Date(prescription.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewPrescription(prescription)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePrintSimpleBill(prescription)}
                            title="Print Simple Bill"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePrintOrderSlip(prescription)}
                            title="Print Detailed Order Slip"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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

      {/* Prescription Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              {selectedPrescription?.prescription_number}
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Information</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedPrescription.patientName}</p>
                    <p className="text-sm text-muted-foreground">{selectedPrescription.patientPhone}</p>
                  </div>
                </div>
                <div>
                  <Label>Pharmacist Information</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedPrescription.pharmacistName}</p>
                    <p className="text-sm text-muted-foreground">Created: {new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Prescription Items</Label>
                <div className="border rounded-lg mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Instructions</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.medicineName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell className="max-w-48">{item.instructions}</TableCell>
                          <TableCell>₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 border-t bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₵{selectedPrescription.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>₵{selectedPrescription.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₵{selectedPrescription.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <Label>Additional Notes</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p>{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <Label>Status</Label>
                <div className="mt-2">
                  <Badge variant={getStatusColor(selectedPrescription.status) as any}>
                    {selectedPrescription.status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handlePrintSimpleBill(selectedPrescription)}
                  className="flex-1"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Print Bill
                </Button>
                <Button 
                  onClick={() => handlePrintOrderSlip(selectedPrescription)}
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Order Slip
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}