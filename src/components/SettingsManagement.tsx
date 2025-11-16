import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Bell, 
  Database, 
  Settings, 
  Lock,
  Building,
  Palette,
  Globe,
  Activity,
  BarChart3
} from "lucide-react";
import { DollarSign } from "lucide-react";
import { UserManagement } from "./UserManagement";
import { AllTransactionsOverview } from "./AllTransactionsOverview";
import { CompletionStatus } from "./CompletionStatus";
import { SystemHealthDashboard } from "./SystemHealthDashboard";
import { SystemValidator } from "./SystemValidator";
import { OrderNumberSettings } from "./OrderNumberSettings";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";
import { useCurrency, AVAILABLE_CURRENCIES } from "../utils/currencyContext";
import { toast } from "sonner@2.0.3";

const mockUsers = [
  {
    id: 1,
    name: "John Admin",
    email: "john@pharmacare.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-22 14:30",
    createdDate: "2024-01-01"
  },
  {
    id: 2,
    name: "Sarah Pharmacist",
    email: "sarah@pharmacare.com",
    role: "Pharmacist",
    status: "Active",
    lastLogin: "2024-01-22 09:15",
    createdDate: "2024-01-05"
  },
  {
    id: 3,
    name: "Mike Accountant",
    email: "mike@pharmacare.com",
    role: "Accountant",
    status: "Active",
    lastLogin: "2024-01-20 16:45",
    createdDate: "2024-01-10"
  }
];

const mockBranches = [
  {
    id: 1,
    name: "Main Branch",
    address: "123 Main St, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    manager: "John Admin",
    status: "Active"
  },
  {
    id: 2,
    name: "Downtown Branch",
    address: "456 Downtown Ave, New York, NY 10002",
    phone: "+1 (555) 987-6543",
    manager: "Sarah Pharmacist",
    status: "Active"
  }
];

const mockAuditLogs = [
  {
    id: 1,
    action: "User Login",
    user: "John Admin",
    details: "Successful login from IP 192.168.1.100",
    timestamp: "2024-01-22 14:30:25"
  },
  {
    id: 2,
    action: "Medicine Added",
    user: "Sarah Pharmacist",
    details: "Added Paracetamol 500mg to inventory",
    timestamp: "2024-01-22 11:15:10"
  },
  {
    id: 3,
    action: "Payment Processed",
    user: "Mike Accountant",
    details: "Payment of ₵125.50 processed for prescription RX-0001",
    timestamp: "2024-01-22 10:45:32"
  }
];

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(mockUsers);
  const [branches, setBranches] = useState(mockBranches);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddBranchDialogOpen, setIsAddBranchDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isEditBranchDialogOpen, setIsEditBranchDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });

  // New branch form state
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    manager: ""
  });

  // Settings state
  const [systemSettings, setSystemSettings] = useState({
    enableNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
    maxLoginAttempts: 3,
    sessionTimeout: 30,
    enableAuditLogging: true,
    dataRetentionDays: 365
  });

  // Load real audit logs
  useEffect(() => {
    const realAuditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    if (realAuditLogs.length > 0) {
      setAuditLogs(realAuditLogs.slice(0, 50)); // Show latest 50 logs
    }
  }, []);

  // Listen for settings tab switching events
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const targetTab = event.detail;
      if (targetTab === 'user-management') {
        setActiveTab('user-management');
      } else if (targetTab === 'all-transactions') {
        setActiveTab('transactions');
      }
    };

    window.addEventListener('switchSettingsTab', handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener('switchSettingsTab', handleSwitchTab as EventListener);
    };
  }, []);

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role && newUser.password) {
      const userData = {
        id: users.length + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "Active",
        lastLogin: "Never",
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      setUsers([...users, userData]);
      
      // Add to audit log
      addAuditLog(
        'User Created',
        `New user account created: ${userData.name} (${userData.role}) - ${userData.email}`,
        user?.name,
        'settings'
      );
      
      setNewUser({ name: "", email: "", role: "", password: "" });
      setIsAddUserDialogOpen(false);
    }
  };

  const handleEditUser = () => {
    if (selectedUser && newUser.name && newUser.email && newUser.role) {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role }
          : u
      ));
      
      // Add to audit log
      addAuditLog(
        'User Updated',
        `User account updated: ${newUser.name} (${newUser.role}) - ${newUser.email}`,
        user?.name,
        'settings'
      );
      
      setNewUser({ name: "", email: "", role: "", password: "" });
      setSelectedUser(null);
      setIsEditUserDialogOpen(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    
    // Add to audit log
    if (userToDelete) {
      addAuditLog(
        'User Deleted',
        `User account deleted: ${userToDelete.name} (${userToDelete.role}) - ${userToDelete.email}`,
        user?.name,
        'settings'
      );
    }
  };

  const handleAddBranch = () => {
    if (newBranch.name && newBranch.address && newBranch.phone && newBranch.manager) {
      const branchData = {
        id: branches.length + 1,
        name: newBranch.name,
        address: newBranch.address,
        phone: newBranch.phone,
        manager: newBranch.manager,
        status: "Active"
      };
      
      setBranches([...branches, branchData]);
      
      // Add to audit log
      addAuditLog(
        'Branch Created',
        `New branch created: ${branchData.name} - ${branchData.address} (Manager: ${branchData.manager})`,
        user?.name,
        'settings'
      );
      
      setNewBranch({ name: "", address: "", phone: "", manager: "" });
      setIsAddBranchDialogOpen(false);
    }
  };

  const handleEditBranch = () => {
    if (selectedBranch && newBranch.name && newBranch.address && newBranch.phone && newBranch.manager) {
      setBranches(branches.map(b => 
        b.id === selectedBranch.id 
          ? { ...b, name: newBranch.name, address: newBranch.address, phone: newBranch.phone, manager: newBranch.manager }
          : b
      ));
      
      // Add to audit log
      addAuditLog(
        'Branch Updated',
        `Branch updated: ${newBranch.name} - ${newBranch.address} (Manager: ${newBranch.manager})`,
        user?.name,
        'settings'
      );
      
      setNewBranch({ name: "", address: "", phone: "", manager: "" });
      setSelectedBranch(null);
      setIsEditBranchDialogOpen(false);
    }
  };

  const handleDeleteBranch = (branchId: number) => {
    const branchToDelete = branches.find(b => b.id === branchId);
    setBranches(branches.filter(b => b.id !== branchId));
    
    // Add to audit log
    if (branchToDelete) {
      addAuditLog(
        'Branch Deleted',
        `Branch deleted: ${branchToDelete.name} - ${branchToDelete.address}`,
        user?.name,
        'settings'
      );
    }
  };

  const openEditUser = (userToEdit: any) => {
    setSelectedUser(userToEdit);
    setNewUser({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      password: ""
    });
    setIsEditUserDialogOpen(true);
  };

  const openEditBranch = (branchToEdit: any) => {
    setSelectedBranch(branchToEdit);
    setNewBranch({
      name: branchToEdit.name,
      address: branchToEdit.address,
      phone: branchToEdit.phone,
      manager: branchToEdit.manager
    });
    setIsEditBranchDialogOpen(true);
  };

  const handleSettingChange = (setting: string, value: boolean | number) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Add to audit log
    addAuditLog(
      'System Setting Changed',
      `System setting updated: ${setting} = ${value}`,
      user?.name,
      'settings'
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings Management</h2>
          <p className="text-muted-foreground">
            Configure system settings, manage users, and monitor system activities
          </p>
        </div>
      </div>

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${user?.role === 'Admin' ? 'grid-cols-13' : 'grid-cols-7'}`}>
            {user?.role === 'Admin' && (
              <>
                <TabsTrigger value="user-management">User Management</TabsTrigger>
                <TabsTrigger value="transactions">All Transactions</TabsTrigger>
                <TabsTrigger value="order-numbers">Order Numbers</TabsTrigger>
                <TabsTrigger value="system-status">System Status</TabsTrigger>
                <TabsTrigger value="validation">System Validator</TabsTrigger>
                <TabsTrigger value="monitoring">Monitor</TabsTrigger>
              </>
            )}
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">System Users</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Admin User Management Tab */}
          {user?.role === 'Admin' && (
            <TabsContent value="user-management" className="space-y-4">
              <UserManagement />
            </TabsContent>
          )}

          {/* Admin All Transactions Tab */}
          {user?.role === 'Admin' && (
            <TabsContent value="transactions" className="space-y-4">
              <AllTransactionsOverview />
            </TabsContent>
          )}

          {/* Admin Order Numbers Tab */}
          {user?.role === 'Admin' && (
            <TabsContent value="order-numbers" className="space-y-4">
              <OrderNumberSettings />
            </TabsContent>
          )}

          {/* Admin System Status Tab */}
          {user?.role === 'Admin' && (
            <TabsContent value="system-status" className="space-y-4">
              <CompletionStatus />
            </TabsContent>
          )}

          {/* Admin System Validator Tab */}
          {user?.role === 'Admin' && (
            <TabsContent value="validation" className="space-y-4">
              <SystemValidator />
            </TabsContent>
          )}

          {/* Admin System Monitoring Tab */}
          {user?.role === 'Admin' && (
            <TabsContent value="monitoring" className="space-y-4">
              <SystemHealthDashboard />
            </TabsContent>
          )}

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">General Settings</h3>
              <p className="text-sm text-muted-foreground">Configure system-wide preferences and regional settings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Currency & Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select the currency to display for all payment amounts throughout the system
                    </p>
                  </div>
                  <Select 
                    value={currency.code} 
                    onValueChange={(value) => {
                      const selectedCurrency = AVAILABLE_CURRENCIES.find(c => c.code === value);
                      if (selectedCurrency) {
                        setCurrency(selectedCurrency);
                        toast.success(`Currency changed to ${selectedCurrency.name}`);
                        addAuditLog(
                          'Currency Changed',
                          `System currency updated to ${selectedCurrency.name}`,
                          user?.name,
                          'settings'
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{curr.symbol}</span>
                            <span>{curr.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Current Currency Preview</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {currency.symbol}1,234.56
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      All amounts in invoices, receipts, and reports will display in {currency.name}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label>System Language</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select the default language for the system interface
                    </p>
                  </div>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label>Date Format</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose how dates are displayed in the system
                    </p>
                  </div>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY (31-12-2024)</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY (12-31-2024)</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2024-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label>Time Zone</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select your local time zone for accurate timestamps
                    </p>
                  </div>
                  <Select defaultValue="gmt">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="wat">WAT (West Africa Time)</SelectItem>
                      <SelectItem value="eat">EAT (East Africa Time)</SelectItem>
                      <SelectItem value="sast">SAST (South Africa Standard Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
              </div>
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account for the pharmacy system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                          <SelectItem value="Accountant">Accountant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <Button onClick={handleAddUser} className="w-full">
                      Add User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user account information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleEditUser} className="w-full">
                  Update User
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Branch Management Tab */}
          <TabsContent value="branches" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Branch Management</h3>
                <p className="text-sm text-muted-foreground">Manage pharmacy branch locations</p>
              </div>
              <Dialog open={isAddBranchDialogOpen} onOpenChange={setIsAddBranchDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Branch</DialogTitle>
                    <DialogDescription>
                      Create a new pharmacy branch location.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="branch-name">Branch Name</Label>
                      <Input
                        id="branch-name"
                        value={newBranch.name}
                        onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                        placeholder="Enter branch name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch-address">Address</Label>
                      <Textarea
                        id="branch-address"
                        value={newBranch.address}
                        onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                        placeholder="Enter complete address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch-phone">Phone Number</Label>
                      <Input
                        id="branch-phone"
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch-manager">Manager</Label>
                      <Select value={newBranch.manager} onValueChange={(value) => setNewBranch({ ...newBranch, manager: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.name}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddBranch} className="w-full">
                      Add Branch
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{branch.address}</TableCell>
                        <TableCell>{branch.phone}</TableCell>
                        <TableCell>{branch.manager}</TableCell>
                        <TableCell>
                          <Badge variant={branch.status === 'Active' ? 'default' : 'destructive'}>
                            {branch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditBranch(branch)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Edit Branch Dialog */}
          <Dialog open={isEditBranchDialogOpen} onOpenChange={setIsEditBranchDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Branch</DialogTitle>
                <DialogDescription>
                  Update branch information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-branch-name">Branch Name</Label>
                  <Input
                    id="edit-branch-name"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    placeholder="Enter branch name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-branch-address">Address</Label>
                  <Textarea
                    id="edit-branch-address"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    placeholder="Enter complete address"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-branch-phone">Phone Number</Label>
                  <Input
                    id="edit-branch-phone"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-branch-manager">Manager</Label>
                  <Select value={newBranch.manager} onValueChange={(value) => setNewBranch({ ...newBranch, manager: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleEditBranch} className="w-full">
                  Update Branch
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">Configure system notifications and alerts</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  General Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive system notifications</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Alerts</p>
                    <p className="text-sm text-muted-foreground">Notifications for payment processing</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Notifications for user logins</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Backup & Data Management</h3>
              <p className="text-sm text-muted-foreground">Manage system backups and data retention</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Backup</p>
                    <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Retention (Days)</Label>
                  <Input
                    type="number"
                    value={systemSettings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                    className="max-w-32"
                  />
                  <p className="text-sm text-muted-foreground">Number of days to retain backup data</p>
                </div>
                <div className="space-y-2">
                  <Button>
                    <Database className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Security Settings</h3>
              <p className="text-sm text-muted-foreground">Configure security policies and access controls</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum Login Attempts</Label>
                  <Input
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    className="max-w-32"
                  />
                  <p className="text-sm text-muted-foreground">Number of failed login attempts before account lockout</p>
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (Minutes)</Label>
                  <Input
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="max-w-32"
                  />
                  <p className="text-sm text-muted-foreground">Session timeout duration in minutes</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode (restricts access)</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all system activities for security monitoring</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableAuditLogging}
                    onCheckedChange={(checked) => handleSettingChange('enableAuditLogging', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Audit Logs</h3>
                <p className="text-sm text-muted-foreground">View system activity and user actions</p>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.slice(0, 20).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="max-w-md truncate">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}