import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pill, Eye, EyeOff, Loader2, UserPlus, Shield, CreditCard, Lock, Users } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signUp(formData.email, formData.password, formData.name, formData.role);
    
    if (result.error) {
      // Handle specific error messages
      if (result.error.includes('already exists') || result.error.includes('email_exists')) {
        setError('An account with this email already exists. Please use a different email or sign in.');
      } else {
        setError(result.error);
      }
    } else if (result.message) {
      // Handle success message for pending approval
      setError(''); // Clear any previous errors
      alert(result.message);
      onSwitchToLogin(); // Redirect to login page
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/health-haven-logo.svg"
              alt="Health Haven Pharmacy"
              className="h-32 w-auto object-contain"
            />
          </div>
          <p className="text-gray-600">Secure Registration</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-3 pb-8 pt-8">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-green-600" />
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-semibold text-gray-900">
              Join Health Haven Pharmacy
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Request access to your pharmacy dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                  <div className="text-red-700 text-sm font-medium">{error}</div>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Professional Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@pharmacy.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 font-medium">
                  Professional Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white">
                    <SelectValue placeholder="Select your professional role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">
                      <div className="flex items-center py-2">
                        <Shield className="h-5 w-5 mr-3 text-red-600" />
                        <div>
                          <div className="font-semibold">System Administrator</div>
                          <div className="text-sm text-gray-500">Complete system management</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Pharmacist">
                      <div className="flex items-center py-2">
                        <Pill className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <div className="font-semibold">Licensed Pharmacist</div>
                          <div className="text-sm text-gray-500">Patient care & prescriptions</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Accountant">
                      <div className="flex items-center py-2">
                        <CreditCard className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <div className="font-semibold">Financial Accountant</div>
                          <div className="text-sm text-gray-500">Billing & payment processing</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Secure Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password (6+ characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading}
                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={loading}
                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting request...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Request Account Access
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have access?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Account requests are reviewed by administrators</span>
          </div>
        </div>
      </div>
    </div>
  );
}