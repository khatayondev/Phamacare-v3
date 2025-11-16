import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert } from './ui/alert';
import { Pill, Eye, EyeOff, Loader2, Shield, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { AuthDebugger } from './AuthDebugger';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugClicks, setDebugClicks] = useState(0);
  const [showDebugger, setShowDebugger] = useState(false);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Login attempt with email:', email);
    console.log('🔑 Password length:', password.length);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    
    if (result.error) {
      console.log('❌ Login failed:', result.error);
      setError(result.error);
    } else {
      console.log('✅ Login successful!');
    }
    
    setLoading(false);
  };

  // Debug helper function - only for development
  const showDebugInfo = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('=== DEBUG: All Users in System ===');
    users.forEach((u: any) => {
      console.log({
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        hasPassword: !!u.password,
        passwordLength: u.password?.length,
        // Show first 3 characters of password for debugging
        passwordHint: u.password?.substring(0, 3) + '***'
      });
    });
    console.log('=================================');
  };

  const handleDebugClick = () => {
    const newCount = debugClicks + 1;
    setDebugClicks(newCount);
    
    if (newCount >= 5) {
      setShowDebugger(true);
      setDebugClicks(0);
    }
    
    // Reset after 3 seconds
    setTimeout(() => setDebugClicks(0), 3000);
  };

  if (showDebugger) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            onClick={() => setShowDebugger(false)}
            variant="outline"
            className="mb-4"
          >
            ← Back to Login
          </Button>
          <AuthDebugger />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
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
          <p className="text-gray-600">Secure Pharmacy Management</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-3 pb-8 pt-8">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-semibold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to access your pharmacy dashboard
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
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Need an account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Contact Administrator
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Protected by enterprise-grade security</span>
          </div>
          {/* Debug button - click 5 times to see system info */}
          <button
            onClick={handleDebugClick}
            onDoubleClick={showDebugInfo}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
            type="button"
          >
            v1.0.0 {debugClicks > 0 && `(${debugClicks}/5)`}
          </button>
        </div>
      </div>
    </div>
  );
}