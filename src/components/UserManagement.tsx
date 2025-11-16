import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Shield,
  UserPlus,
  Plus,
  Key
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { addAuditLog } from "../utils/audit";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Get users from localStorage (authentication storage)
    const storedUsers = localStorage.getItem('users');
    const parsedAuthUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Convert auth users to user management format
    const managementUsers: User[] = parsedAuthUsers.map((authUser: any) => ({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
      status: authUser.status || 'approved',
      created_at: authUser.createdDate || authUser.created_at || new Date().toISOString()
    }));
    
    setUsers(managementUsers);
    setLoading(false);
  };

  const updateUserStatus = (userId: string, status: 'approved' | 'rejected') => {
    // Update in user management format
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status, updated_at: new Date().toISOString() }
        : user
    );
    
    // Update in authentication storage
    const storedAuthUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedAuthUsers = storedAuthUsers.map((authUser: any) => 
      authUser.id === userId 
        ? { ...authUser, status }
        : authUser
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedAuthUsers));
    
    // Show notification
    const action = status === 'approved' ? 'approved' : 'rejected';
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: {
        type: status === 'approved' ? 'success' : 'error',
        message: `User ${action} successfully`,
        duration: 3000
      }
    }));
  };

  const removeUser = (userId: string) => {
    if (userId === currentUser?.id) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'Cannot remove your own account',
          duration: 3000
        }
      }));
      return;
    }

    // Remove from user management
    const updatedUsers = users.filter(user => user.id !== userId);
    
    // Remove from authentication storage
    const storedAuthUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedAuthUsers = storedAuthUsers.filter((authUser: any) => authUser.id !== userId);
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedAuthUsers));
    
    // Add audit log for user removal
    const removedUser = users.find(u => u.id === userId);
    addAuditLog(
      'User Removed',
      `Removed user: ${removedUser?.name} (${removedUser?.email}) - Role: ${removedUser?.role}`,
      currentUser?.name,
      'User Management'
    );
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: {
        type: 'success',
        message: 'User removed successfully',
        duration: 3000
      }
    }));
  };

  const addNewUser = async () => {
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'Please fill in all fields',
          duration: 3000
        }
      }));
      return;
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email.toLowerCase() === formData.email.toLowerCase());
    if (existingUser) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'A user with this email already exists',
          duration: 3000
        }
      }));
      return;
    }

    const newUser: User = {
      id: 'user-' + Date.now().toString(),
      email: formData.email.toLowerCase(),
      name: formData.name,
      role: formData.role,
      status: 'approved', // Admin-created users are automatically approved
      created_at: new Date().toISOString()
    };

    // Also add to the main users storage for authentication
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const authUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: formData.password,
      role: newUser.role,
      status: 'approved',
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString()
    };

    const updatedAuthUsers = [...storedUsers, authUser];
    localStorage.setItem('users', JSON.stringify(updatedAuthUsers));

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Add audit log for user creation
    addAuditLog(
      'User Created',
      `Created new ${formData.role} account: ${formData.name} (${formData.email})`,
      currentUser?.name,
      'User Management'
    );

    // Reset form
    setFormData({ name: '', email: '', role: '', password: '' });
    setIsAddDialogOpen(false);

    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: {
        type: 'success',
        message: `${formData.role} account created successfully`,
        duration: 3000
      }
    }));

    // Refresh user list to show the new user
    loadUsers();
  };

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  const changePassword = () => {
    console.log('🔑 Starting password change for user:', selectedUserId);
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'Please fill in all password fields',
          duration: 3000
        }
      }));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'Password must be at least 6 characters long',
          duration: 3000
        }
      }));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'Passwords do not match',
          duration: 3000
        }
      }));
      return;
    }

    // Update password in authentication storage
    const storedAuthUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 Current users before password change:', storedAuthUsers.length);
    
    const userToUpdate = storedAuthUsers.find((u: any) => u.id === selectedUserId);
    console.log('🔍 Found user to update:', userToUpdate ? userToUpdate.email : 'NOT FOUND');
    
    const updatedAuthUsers = storedAuthUsers.map((authUser: any) => 
      authUser.id === selectedUserId 
        ? { ...authUser, password: passwordData.newPassword }
        : authUser
    );
    
    localStorage.setItem('users', JSON.stringify(updatedAuthUsers));
    console.log('💾 Password updated in localStorage');
    console.log('✅ New password length:', passwordData.newPassword.length);

    // Verify the update
    const verifyUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const verifiedUser = verifyUsers.find((u: any) => u.id === selectedUserId);
    console.log('✔️ Verification - Password saved correctly:', verifiedUser?.password === passwordData.newPassword);

    // Find user details for audit log
    const updatedUser = users.find(u => u.id === selectedUserId);

    // Add audit log for password change
    addAuditLog(
      'Password Changed',
      `Password changed for user: ${updatedUser?.name} (${updatedUser?.email})`,
      currentUser?.name,
      'User Management'
    );

    // Reset form and close dialog
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setIsPasswordDialogOpen(false);
    setSelectedUserId('');

    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: {
        type: 'success',
        message: 'Password changed successfully. You can now login with the new password.',
        duration: 5000
      }
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'Pharmacist':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'Accountant':
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');
  const rejectedUsers = users.filter(u => u.status === 'rejected');

  if (currentUser?.role !== 'Admin') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3>Access Denied</h3>
          <p className="text-muted-foreground">Only administrators can manage user accounts.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Total Users: {users.length}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new pharmacist or accountant account. Admins can only be created by other admins.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName">Full Name</Label>
                  <Input 
                    id="userName" 
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email Address</Label>
                  <Input 
                    id="userEmail" 
                    type="email" 
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="userPassword">Password</Label>
                  <Input 
                    id="userPassword" 
                    type="password" 
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setFormData({ name: '', email: '', role: '', password: '' });
                      setIsAddDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={addNewUser}
                  >
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Password Change Dialog */}
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Change User Password
                </DialogTitle>
                <DialogDescription>
                  Enter a new password for this user account. The password must be at least 6 characters long.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setPasswordData({ newPassword: '', confirmPassword: '' });
                      setIsPasswordDialogOpen(false);
                      setSelectedUserId('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={changePassword}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Approved and active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Access denied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <Clock className="h-5 w-5 mr-2" />
              Pending Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateUserStatus(user.id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{user.role}</Badge>
                        {getStatusBadge(user.status)}
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {user.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateUserStatus(user.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {user.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPasswordDialog(user.id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Change Password
                    </Button>
                  )}
                  {user.id !== currentUser?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeUser(user.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                  {user.id === currentUser?.id && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Current User
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pendingUsers.length === 0 && (
        <Alert>
          <UserPlus className="h-4 w-4" />
          <AlertDescription>
            No pending user approvals at this time. New Accountant registrations will appear here for approval.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}