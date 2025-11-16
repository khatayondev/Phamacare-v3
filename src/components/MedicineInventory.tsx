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
import { Search, Plus, Edit, AlertTriangle, Loader2, Download, FileText, Printer, Barcode, Camera, Upload } from "lucide-react";
import { medicineAPI } from "../utils/backendApi";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";
import { exportInventoryReport, exportData } from "../utils/exportUtils";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  expiry: string;
  supplier: string;
  description?: string;
  batchNumber?: string;
  manufacturer?: string;
  barcode?: string;
}

export function MedicineInventory() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    minStock: "",
    expiry: "",
    supplier: "",
    description: "",
    batchNumber: "",
    manufacturer: "",
    barcode: ""
  });

  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeScanning, setBarcodeScanning] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineAPI.getAll();
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplenishStock = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e7703d4/admin/reset-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to replenish stock');
      }

      // Refresh medicines after stock reset
      await fetchMedicines();
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('medicinesUpdated'));
      
      // Add audit log
      addAuditLog(
        'Stock Replenished',
        'All medicine stock levels have been reset to initial demo values',
        user?.name,
        'Inventory'
      );

      toast.success('Stock replenished successfully! All medicine inventory has been reset to initial levels.');
    } catch (error) {
      console.error('Error replenishing stock:', error);
      toast.error('Failed to replenish stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    setBarcodeScanning(true);
    try {
      // Search for medicine with matching barcode
      const matchingMedicine = medicines.find(m => m.barcode === barcode);
      
      if (matchingMedicine) {
        // Auto-fill form with existing medicine data
        setNewMedicine({
          name: matchingMedicine.name,
          category: matchingMedicine.category,
          price: matchingMedicine.price.toString(),
          stock: "",  // Keep stock empty for new addition
          minStock: matchingMedicine.minStock.toString(),
          expiry: matchingMedicine.expiry,
          supplier: matchingMedicine.supplier,
          description: matchingMedicine.description || "",
          batchNumber: matchingMedicine.batchNumber || "",
          manufacturer: matchingMedicine.manufacturer || "",
          barcode: matchingMedicine.barcode || ""
        });
        
        addAuditLog(
          'Barcode Match Found',
          `Medicine found via barcode: ${matchingMedicine.name}`,
          user?.name,
          'Inventory'
        );
      } else {
        // New barcode - just set the barcode field
        setNewMedicine({
          ...newMedicine,
          barcode: barcode
        });
        
        addAuditLog(
          'New Barcode Scanned',
          `New barcode scanned: ${barcode}`,
          user?.name,
          'Inventory'
        );
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
    } finally {
      setBarcodeScanning(false);
    }
  };

  const handleAddMedicine = async () => {
    try {
      setIsSubmitting(true);
      const medicineData = {
        ...newMedicine,
        price: parseFloat(newMedicine.price),
        stock: parseInt(newMedicine.stock),
        minStock: parseInt(newMedicine.minStock),
      };

      await medicineAPI.create(medicineData);
      await fetchMedicines();
      
      // Add audit log
      addAuditLog(
        'Medicine Added',
        `Added new medicine: ${medicineData.name} (${medicineData.category}) - Stock: ${medicineData.stock} units, Price: ₵${medicineData.price.toFixed(2)}`,
        user?.name,
        'Inventory'
      );
      
      setIsAddDialogOpen(false);
      setNewMedicine({
        name: "",
        category: "",
        price: "",
        stock: "",
        minStock: "",
        expiry: "",
        supplier: "",
        description: "",
        batchNumber: "",
        manufacturer: "",
        barcode: ""
      });
      setBarcodeInput("");
    } catch (error) {
      console.error('Error adding medicine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || medicine.category.toLowerCase() === categoryFilter;
    
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "low" && medicine.stock <= medicine.minStock) ||
                        (stockFilter === "normal" && medicine.stock > medicine.minStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Low Stock", variant: "destructive" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const categories = ["Pain Relief", "Anti-inflammatory", "Vitamins", "Antibiotics", "Respiratory"];

  const handleExportInventory = (format: 'pdf' | 'csv' | 'excel') => {
    try {
      console.log('Starting inventory export:', format);
      
      // Prepare data for export
      const exportData = filteredMedicines.map(medicine => ({
        Name: medicine.name,
        Category: medicine.category,
        'Current Stock': medicine.stock,
        'Minimum Stock': medicine.minStock,
        'Price (₵)': medicine.price.toFixed(2),
        Supplier: medicine.supplier,
        'Expiry Date': new Date(medicine.expiry).toLocaleDateString(),
        'Batch Number': medicine.batchNumber || 'N/A',
        Manufacturer: medicine.manufacturer || 'N/A',
        Status: getStockStatus(medicine.stock, medicine.minStock).label
      }));

      console.log('Export data prepared:', exportData);

      import('../utils/exportUtils').then(({ exportInventoryReport }) => {
        exportInventoryReport(exportData, {
          format,
          filename: `inventory_report_${Date.now()}`,
          title: 'Medicine Inventory Report',
          subtitle: `Generated on ${new Date().toLocaleDateString()} | Total Items: ${exportData.length}`
        });

        // Add audit log
        addAuditLog(
          'Inventory Export',
          `Exported inventory report in ${format.toUpperCase()} format - ${exportData.length} items`,
          user?.name,
          'Inventory'
        );
      }).catch(error => {
        console.error('Error importing export utilities:', error);
        alert('Error exporting inventory. Please try again.');
      });
    } catch (error) {
      console.error('Error in handleExportInventory:', error);
      alert('Error preparing inventory export. Please try again.');
    }
  };

  const handlePrintInventory = () => {
    window.print();
    addAuditLog(
      'Inventory Print',
      `Printed inventory report - ${filteredMedicines.length} items`,
      user?.name,
      'Inventory'
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading medicines...</p>
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
            <CardTitle className="text-sm text-muted-foreground">Total Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {medicines.filter(m => m.stock <= m.minStock).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicines.filter(m => m.stock === 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{medicines.reduce((sum, m) => sum + (m.price * m.stock), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Medicine Inventory</CardTitle>
            <div className="flex gap-2">
              {/* Replenish Stock Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReplenishStock}
                disabled={isSubmitting}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-1" />
                )}
                Replenish
              </Button>
              
              {/* Export Options */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handleExportInventory('pdf')}>
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportInventory('csv')}>
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportInventory('excel')}>
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintInventory}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Medicine</DialogTitle>
                  <DialogDescription>
                    Scan barcode or enter medicine details manually. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Barcode Scanner Section */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Barcode className="h-5 w-5 text-blue-600" />
                      <Label className="text-sm font-medium text-blue-900">Quick Add via Barcode</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter or scan barcode..."
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleBarcodeSearch(barcodeInput);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => handleBarcodeSearch(barcodeInput)}
                        disabled={!barcodeInput || barcodeScanning}
                      >
                        {barcodeScanning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700">
                      Existing medicine will auto-fill. Manual editing allowed.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="medicineName">Medicine Name *</Label>
                    <Input 
                      id="medicineName" 
                      placeholder="Enter medicine name"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newMedicine.category} onValueChange={(value) => setNewMedicine({...newMedicine, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₵) *</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={newMedicine.price}
                        onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Current Stock *</Label>
                      <Input 
                        id="stock" 
                        type="number"
                        placeholder="0"
                        value={newMedicine.stock}
                        onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minStock">Minimum Stock (Optional)</Label>
                      <Input 
                        id="minStock" 
                        type="number"
                        placeholder="0"
                        value={newMedicine.minStock}
                        onChange={(e) => setNewMedicine({...newMedicine, minStock: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                      <Input 
                        id="expiry" 
                        type="date"
                        value={newMedicine.expiry}
                        onChange={(e) => setNewMedicine({...newMedicine, expiry: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier (Optional)</Label>
                    <Input 
                      id="supplier" 
                      placeholder="Supplier name"
                      value={newMedicine.supplier}
                      onChange={(e) => setNewMedicine({...newMedicine, supplier: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                    <Input 
                      id="batchNumber" 
                      placeholder="Batch number"
                      value={newMedicine.batchNumber}
                      onChange={(e) => setNewMedicine({...newMedicine, batchNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
                    <Input 
                      id="manufacturer" 
                      placeholder="Manufacturer name"
                      value={newMedicine.manufacturer}
                      onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Medicine description"
                      value={newMedicine.description}
                      onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode (Optional)</Label>
                    <Input 
                      id="barcode" 
                      placeholder="Product barcode"
                      value={newMedicine.barcode}
                      onChange={(e) => setNewMedicine({...newMedicine, barcode: e.target.value})}
                      disabled={barcodeScanning}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddMedicine}
                    disabled={isSubmitting || !newMedicine.name || !newMedicine.category || !newMedicine.price || !newMedicine.stock}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Medicine...
                      </>
                    ) : (
                      "Add Medicine"
                    )}
                  </Button>
                </div>
              </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines by name, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine.stock, medicine.minStock);
                  return (
                    <TableRow key={medicine.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          {medicine.batchNumber && (
                            <p className="text-sm text-muted-foreground">Batch: {medicine.batchNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{medicine.stock}</p>
                          <p className="text-sm text-muted-foreground">Min: {medicine.minStock}</p>
                        </div>
                      </TableCell>
                      <TableCell>₵{medicine.price.toFixed(2)}</TableCell>
                      <TableCell>{medicine.supplier}</TableCell>
                      <TableCell>{new Date(medicine.expiry).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No medicines found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}