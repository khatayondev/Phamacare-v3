import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, Eye, ShoppingCart, DollarSign, CreditCard, Loader2, Minus } from "lucide-react";
import { salesAPI, medicineAPI, patientAPI } from "../utils/backendApi";
import { ThermalPrinter } from "./ThermalPrinter";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
  prescriptionId?: string;
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

export function SalesManagement() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newSale, setNewSale] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "",
    items: [] as Array<{
      medicineId: string;
      medicineName: string;
      quantity: number;
      price: number;
    }>
  });

  const [currentItem, setCurrentItem] = useState({
    medicineId: "",
    quantity: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, medicinesData, patientsData] = await Promise.all([
        salesAPI.getAll(),
        medicineAPI.getAll(),
        patientAPI.getAll()
      ]);
      setSales(salesData);
      setMedicines(medicinesData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItemToSale = () => {
    const medicine = medicines.find(m => m.id === currentItem.medicineId);
    if (!medicine) return;

    const newItem = {
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: currentItem.quantity,
      price: medicine.price
    };

    setNewSale(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setCurrentItem({ medicineId: "", quantity: 1 });
  };

  const removeItemFromSale = (index: number) => {
    setNewSale(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return newSale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateSale = async () => {
    try {
      setIsSubmitting(true);
      const saleData = {
        ...newSale,
        total: calculateTotal(),
        status: "Completed"
      };

      await salesAPI.create(saleData);
      await fetchData();
      
      // Add audit log
      addAuditLog(
        'Sale Created',
        `Sale completed for ${saleData.customerName} (${saleData.customerPhone}) - Total: ₵${saleData.total.toFixed(2)} (${saleData.items.length} items) - Payment: ${saleData.paymentMethod}`,
        user?.name,
        'Sales'
      );
      
      setIsAddDialogOpen(false);
      setNewSale({
        customerName: "",
        customerPhone: "",
        paymentMethod: "",
        items: []
      });
    } catch (error) {
      console.error('Error creating sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerPhone.includes(searchTerm) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Pending": return "secondary";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const todaySales = sales.filter(sale => {
    const today = new Date().toISOString().split('T')[0];
    return sale.date.split('T')[0] === today;
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading sales data...</p>
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
            <CardTitle className="text-sm text-muted-foreground">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySales.length}</div>
            <p className="text-xs text-muted-foreground">Orders completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue generated today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Sales & Point of Sale</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Sale</DialogTitle>
                  <DialogDescription>
                    Create a new sale by adding customer information and selecting medicines.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input 
                        id="customerName" 
                        placeholder="Enter customer name"
                        value={newSale.customerName}
                        onChange={(e) => setNewSale({...newSale, customerName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input 
                        id="customerPhone" 
                        placeholder="+1 (555) 000-0000"
                        value={newSale.customerPhone}
                        onChange={(e) => setNewSale({...newSale, customerPhone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={newSale.paymentMethod} onValueChange={(value) => setNewSale({...newSale, paymentMethod: value})}>
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
                    <Label>Add Items</Label>
                    <div className="flex gap-2 mt-2">
                      <Select value={currentItem.medicineId} onValueChange={(value) => setCurrentItem({...currentItem, medicineId: value})}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.filter(m => m.stock > 0).map(medicine => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              {medicine.name} - ₵{medicine.price.toFixed(2)} (Stock: {medicine.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Qty"
                        className="w-20"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                      />
                      <Button 
                        type="button" 
                        onClick={addItemToSale}
                        disabled={!currentItem.medicineId}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {newSale.items.length > 0 && (
                    <div>
                      <Label>Items in Sale</Label>
                      <div className="border rounded-lg mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medicine</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newSale.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.medicineName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>₵{item.price.toFixed(2)}</TableCell>
                                <TableCell>₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeItemFromSale(index)}
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
                            <span className="font-medium">Total:</span>
                            <span className="text-xl font-bold">₵{calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={handleCreateSale}
                    disabled={isSubmitting || !newSale.customerName || !newSale.paymentMethod || newSale.items.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Sale...
                      </>
                    ) : (
                      `Complete Sale - ₵${calculateTotal().toFixed(2)}`
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales by customer name, phone, or order ID..."
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.customerName}</p>
                        <p className="text-sm text-muted-foreground">{sale.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{sale.items.length} items</TableCell>
                    <TableCell>₵{sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {sale.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(sale.status) as any}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedSale(sale)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details - {selectedSale?.id}</DialogTitle>
                            <DialogDescription>
                              View complete order information including items, pricing, and customer details.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSale && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-2">Customer Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {selectedSale.customerName}</p>
                                    <p><strong>Phone:</strong> {selectedSale.customerPhone}</p>
                                    <p><strong>Payment Method:</strong> {selectedSale.paymentMethod}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Order Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Order ID:</strong> {selectedSale.id}</p>
                                    <p><strong>Date:</strong> {new Date(selectedSale.date).toLocaleString()}</p>
                                    <p><strong>Status:</strong> 
                                      <Badge variant={getStatusColor(selectedSale.status) as any} className="ml-2">
                                        {selectedSale.status}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Items Purchased</h4>
                                <div className="border rounded-lg">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Medicine</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedSale.items.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.medicineName}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>₵{item.price.toFixed(2)}</TableCell>
                                          <TableCell>₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                  <div className="p-4 border-t">
                                    <div className="flex justify-between items-center font-medium">
                                      <span>Total Amount:</span>
                                      <span className="text-lg">₵{selectedSale.total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <ThermalPrinter 
                        receiptData={{
                          id: sale.id,
                          customerName: sale.customerName,
                          customerPhone: sale.customerPhone,
                          items: sale.items,
                          total: sale.total,
                          paymentMethod: sale.paymentMethod,
                          date: sale.date
                        }}
                        onPrintSuccess={() => console.log('Receipt printed successfully')}
                        onPrintError={(error) => console.error('Print error:', error)}
                      />
                    </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}