import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, RefreshCw, CheckCircle, XCircle, Key, Mail } from 'lucide-react';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  password: string;
}

export function AuthDebugger() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const testLogin = () => {
    const normalizedEmail = testEmail.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === normalizedEmail && u.password === testPassword
    );

    if (user) {
      setTestResult({
        success: true,
        message: `✅ Login would succeed! User: ${user.name} (${user.role})`
      });
    } else {
      const emailExists = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (emailExists) {
        setTestResult({
          success: false,
          message: `❌ Email found but password doesn't match. Expected: ${emailExists.password}`
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ No user found with email: ${normalizedEmail}`
        });
      }
    }
  };

  const fixUser = (userId: string) => {
    const newPassword = prompt('Enter new password for this user:');
    if (newPassword && newPassword.length >= 6) {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, password: newPassword } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      alert(`Password updated to: ${newPassword}`);
    } else {
      alert('Password must be at least 6 characters');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔍 Authentication Debugger</span>
            <Button onClick={loadUsers} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Login Section */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold mb-4">Test Login Credentials</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="text"
                  placeholder="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={testLogin} className="w-full">
              Test Login
            </Button>
            {testResult && (
              <div className={`mt-4 p-3 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testResult.message}
              </div>
            )}
          </div>

          {/* Users List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">All Users in System ({users.length})</h3>
              <Button
                onClick={() => setShowPasswords(!showPasswords)}
                size="sm"
                variant="outline"
              >
                {showPasswords ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPasswords ? 'Hide' : 'Show'} Passwords
              </Button>
            </div>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{user.name}</span>
                        <Badge>{user.role}</Badge>
                        <Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <code className="bg-gray-100 px-2 py-1 rounded">{user.email}</code>
                      </div>
                      {showPasswords && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Key className="h-4 w-4" />
                          <code className="bg-yellow-100 px-2 py-1 rounded font-mono">
                            {user.password}
                          </code>
                          <span className="text-xs text-gray-500">
                            ({user.password.length} chars)
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => fixUser(user.id)}
                      size="sm"
                      variant="outline"
                    >
                      Fix Password
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(users, null, 2));
                  alert('Users data copied to clipboard!');
                }}
                variant="outline"
              >
                Copy Users JSON
              </Button>
              <Button
                onClick={() => {
                  const data = users.map(u => `${u.email} / ${u.password}`).join('\n');
                  navigator.clipboard.writeText(data);
                  alert('Login credentials copied!');
                }}
                variant="outline"
              >
                Copy All Logins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
