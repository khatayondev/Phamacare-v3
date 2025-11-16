import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, Eye, Edit, Phone, Mail, MapPin, Package, DollarSign } from "lucide-react";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

const mockSuppliers = [
  {
    id: 1,
    name: "MedSupply Co",
    contact: "John Johnson",
    phone: "+1 (555) 200-3000",
    email: "orders@medsupply.com",
    address: "123 Medical Way, Healthcare City, HC 12345",
    status: "Active",
    totalOrders: 45,
    totalValue: 125670.50,
    lastOrder: "2024-01-20",
    paymentTerms: "Net 30",
    rating: 4.8
  },
  {
    id: 2,
    name: "PharmaCorp",
    contact: "Sarah Martinez",
    phone: "+1 (555) 300-4000",
    email: "support@pharmacorp.com",
    address: "456 Pharma Street, Medicine Town, MT 67890",
    status: "Active",
    totalOrders: 67,
    totalValue: 198340.25,
    lastOrder: "2024-01-18",
    paymentTerms: "Net 15",
    rating: 4.9
  },
  {
    id: 3,
    name: "VitaHealth",
    contact: "Mike Davis",
    phone: "+1 (555) 400-5000",
    email: "orders@vitahealth.com",
    address: "789 Vitamin Ave, Supplement City, SC 13579",
    status: "Active",
    totalOrders: 23,
    totalValue: 67890.75,
    lastOrder: "2024-01-15",
    paymentTerms: "Net 45",
    rating: 4.6
  },
  {
    id: 4,
    name: "RemedyMed",
    contact: "Emma Wilson",
    phone: "+1 (555) 500-6000",
    email: "sales@remedymed.com",
    address: "321 Remedy Road, Treatment Town, TT 24680",
    status: "Inactive",
    totalOrders: 12,
    totalValue: 25670.00,
    lastOrder: "2023-12-20",
    paymentTerms: "Net 30",
    rating: 4.2
  }
];

const mockPurchaseOrders = [
  {
    id: "PO-001",
    supplier: "MedSupply Co",
    date: "2024-01-20",
    items: 15,
    total: 4567.89,
    status: "Delivered",
    expectedDelivery: "2024-01-22"
  },
  {
    id: "PO-002",
    supplier: "PharmaCorp",
    date: "2024-01-18",
    items: 8,
    total: 2340.56,
    status: "In Transit",
    expectedDelivery: "2024-01-24"
  },
  {
    id: "PO-003",
    supplier: "VitaHealth",
    date: "2024-01-15",
    items: 12,
    total: 1890.25,
    status: "Pending",
    expectedDelivery: "2024-01-25"
  }
];

export function SupplierManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<typeof mockSuppliers[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // New supplier form state
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    paymentTerms: ""
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || supplier.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  const getPOStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "default";
      case "In Transit": return "secondary";
      case "Pending": return "outline";
      default: return "outline";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.phone) {
      toast.error("Please fill in all required fields (Company Name, Contact Person, and Phone)");
      return;
    }

    const newSupplierData = {
      id: Math.max(...suppliers.map(s => s.id)) + 1,
      name: newSupplier.name,
      contact: newSupplier.contact,
      phone: newSupplier.phone,
      email: newSupplier.email || "N/A",
      address: newSupplier.address || "N/A",
      status: "Active",
      totalOrders: 0,
      totalValue: 0,
      lastOrder: new Date().toISOString().split('T')[0],
      paymentTerms: newSupplier.paymentTerms || "Net 30",
      rating: 0
    };

    setSuppliers([...suppliers, newSupplierData]);
    
    addAuditLog(
      'Supplier Added',
      `New supplier added: ${newSupplier.name} (${newSupplier.contact})`,
      user?.name,
      'Supplier Management'
    );

    toast.success(`Supplier "${newSupplier.name}" added successfully!`);

    // Reset form
    setNewSupplier({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      paymentTerms: ""
    });
    
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Suppliers</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers.filter(s => s.status === "Active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, supplier) => sum + supplier.totalOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{suppliers.reduce((sum, supplier) => sum + supplier.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending POs</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPurchaseOrders.filter(po => po.status === "Pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Supplier Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Enter supplier information to add them to your network. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplierName">Company Name *</Label>
                    <Input 
                      id="supplierName" 
                      placeholder="Enter company name"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input 
                      id="contactPerson" 
                      placeholder="Contact person name"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierPhone">Phone *</Label>
                      <Input 
                        id="supplierPhone" 
                        placeholder="Phone number"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierEmail">Email (Optional)</Label>
                      <Input 
                        id="supplierEmail" 
                        type="email" 
                        placeholder="Email address"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplierAddress">Address (Optional)</Label>
                    <Textarea 
                      id="supplierAddress" 
                      placeholder="Full address"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms (Optional)</Label>
                    <Select 
                      value={newSupplier.paymentTerms}
                      onValueChange={(value) => setNewSupplier({...newSupplier, paymentTerms: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleAddSupplier}>Add Supplier</Button>
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
                placeholder="Search suppliers by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.paymentTerms}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.contact}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {supplier.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.totalOrders}</p>
                        <p className="text-sm text-muted-foreground">Last: {supplier.lastOrder}</p>
                      </div>
                    </TableCell>
                    <TableCell>₵{supplier.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={`font-medium ${getRatingColor(supplier.rating)}`}>
                          {supplier.rating}
                        </span>
                        <span className="text-muted-foreground ml-1">★</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(supplier.status) as any}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                addAuditLog(
                                  'Supplier Viewed',
                                  `Viewed details for supplier: ${supplier.name} (${supplier.contact})`,
                                  user?.name,
                                  'Supplier Management'
                                );
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Supplier Details - {selectedSupplier?.name}</DialogTitle>
                              <DialogDescription>
                                View comprehensive supplier information and order history.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSupplier && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">Company Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Company:</strong> {selectedSupplier.name}</p>
                                      <p><strong>Contact Person:</strong> {selectedSupplier.contact}</p>
                                      <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
                                      <p><strong>Email:</strong> {selectedSupplier.email}</p>
                                      <div className="flex items-start">
                                        <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                                        <span>{selectedSupplier.address}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Business Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Status:</strong> 
                                        <Badge variant={getStatusColor(selectedSupplier.status) as any} className="ml-2">
                                          {selectedSupplier.status}
                                        </Badge>
                                      </p>
                                      <p><strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}</p>
                                      <p><strong>Rating:</strong> 
                                        <span className={`ml-1 ${getRatingColor(selectedSupplier.rating)}`}>
                                          {selectedSupplier.rating} ★
                                        </span>
                                      </p>
                                      <p><strong>Total Orders:</strong> {selectedSupplier.totalOrders}</p>
                                      <p><strong>Total Value:</strong> ${selectedSupplier.totalValue.toLocaleString()}</p>
                                      <p><strong>Last Order:</strong> {selectedSupplier.lastOrder}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Purchase Orders</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create PO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                  <DialogDescription>
                    Create a new purchase order for supplier.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="poSupplier">Supplier</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.filter(s => s.status === "Active").map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                      <Input id="expectedDelivery" type="date" />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Items</Label>
                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-4 gap-2">
                        <Input placeholder="Medicine name" />
                        <Input placeholder="Quantity" type="number" />
                        <Input placeholder="Unit price" type="number" step="0.01" />
                        <Button variant="outline" size="sm">Add</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes or special instructions" />
                  </div>

                  <Button className="w-full">Create Purchase Order</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPurchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.id}</TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell>{po.date}</TableCell>
                    <TableCell>{po.items} items</TableCell>
                    <TableCell>₵{po.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getPOStatusColor(po.status) as any}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{po.expectedDelivery}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}