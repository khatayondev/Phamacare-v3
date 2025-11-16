import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize default data only if it doesn't exist
const initializeAuthData = () => {
  console.log('🔧 Checking Health Haven Pharmacy authentication data...');
  
  const isInitialized = localStorage.getItem('pharmacare_initialized');
  const existingUsers = localStorage.getItem('users');
  
  // Only initialize if not already done
  if (isInitialized === 'true' && existingUsers) {
    console.log('✅ Authentication data already exists, skipping initialization');
    return JSON.parse(existingUsers);
  }
  
  console.log('🆕 Creating fresh default users...');
  
  // Create fresh default users
  const defaultUsers = [
    {
      id: '1',
      name: 'John Admin',
      email: 'john@pharmacare.com',
      password: 'admin123',
      role: 'Admin',
      status: 'approved',
      createdDate: '2024-01-01',
      lastLogin: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sarah Pharmacist',
      email: 'sarah@pharmacare.com',
      password: 'pharma123',
      role: 'Pharmacist',
      status: 'approved',
      createdDate: '2024-01-05',
      lastLogin: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Mike Accountant',
      email: 'mike@pharmacare.com',
      password: 'account123',
      role: 'Accountant',
      status: 'approved',
      createdDate: '2024-01-08',
      lastLogin: new Date().toISOString()
    }
  ];

  // Store the fresh data
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  localStorage.setItem('pharmacare_initialized', 'true');
  
  console.log('✅ Default users created:', defaultUsers.map(u => ({ 
    email: u.email, 
    role: u.role,
    password: u.password 
  })));
  
  return defaultUsers;
};

const addAuditLog = (action: string, details: string, userName?: string) => {
  const newLog = {
    id: Date.now(),
    action,
    user: userName || 'System',
    details,
    timestamp: new Date().toLocaleString()
  };
  
  const storedLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  const updatedLogs = [newLog, ...storedLogs].slice(0, 100); // Keep only last 100 logs
  localStorage.setItem('auditLogs', JSON.stringify(updatedLogs));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthProvider initializing...');
    
    // Initialize data only if needed (not force-clear)
    initializeAuthData();
    
    // Check for existing session
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        console.log('📱 Found existing session for:', userData.email);
        setUser(userData);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    setLoading(false);
    console.log('✅ AuthProvider initialization complete');
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        console.error('❌ No users data found in localStorage');
        return { error: 'System error: No user data found. Please refresh the page.' };
      }

      const users = JSON.parse(usersData);
      console.log('👥 Available users:', users.map((u: any) => ({ 
        email: u.email, 
        role: u.role,
        status: u.status,
        hasPassword: !!u.password
      })));
      
      // Trim and lowercase email for comparison
      const normalizedEmail = email.trim().toLowerCase();
      console.log('🔍 Searching for user with email:', normalizedEmail);
      console.log('🔑 Password provided:', password ? 'Yes' : 'No');
      
      const userRecord = users.find((u: any) => 
        u.email.toLowerCase() === normalizedEmail && u.password === password
      );
      
      if (!userRecord) {
        console.log('❌ Login failed: User not found or password incorrect');
        console.log('📧 Attempted email:', normalizedEmail);
        console.log('🔑 Attempted password:', password);
        console.log('📋 Email matches found:', users.filter((u: any) => u.email.toLowerCase() === normalizedEmail).length);
        
        // Add audit log for failed login
        addAuditLog('Login Failed', `Failed login attempt for ${normalizedEmail}`);
        
        return { error: 'Invalid email or password' };
      }

      console.log('✅ User found:', userRecord.email, 'Role:', userRecord.role, 'Status:', userRecord.status);

      // Check user approval status for Accountants
      if (userRecord.role === 'Accountant' && userRecord.status === 'pending') {
        console.log('⏳ Accountant login blocked: pending approval');
        return { error: 'Your account is pending approval. Please contact an administrator.' };
      }
      
      if (userRecord.status === 'rejected') {
        console.log('🚫 Login blocked: account rejected');
        return { error: 'Your account has been rejected. Please contact an administrator.' };
      }

      // Update last login
      userRecord.lastLogin = new Date().toISOString();
      const updatedUsers = users.map((u: any) => u.id === userRecord.id ? userRecord : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Set current user
      const currentUser = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role,
        status: userRecord.status
      };
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setUser(currentUser);

      // Add audit log for successful login
      addAuditLog('User Login', `Successful login from ${currentUser.email}`, currentUser.name);

      console.log('🎉 Login completed successfully for:', currentUser.name, `(${currentUser.role})`);
      return {};
    } catch (error) {
      console.error('💥 Login error:', error);
      return { error: 'An unexpected error occurred: ' + error.message };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string) => {
    console.log('📝 Starting signup process for:', email);
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('👥 Current users count:', users.length);
      
      // Normalize email for comparison
      const normalizedEmail = email.trim().toLowerCase();
      
      // Check if user already exists
      if (users.some((u: any) => u.email.toLowerCase() === normalizedEmail)) {
        console.log('❌ User already exists with email:', normalizedEmail);
        return { error: 'An account with this email already exists' };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email: normalizedEmail,
        password, // In production, this would be hashed
        role,
        status: role === 'Accountant' ? 'pending' : 'approved',
        createdDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString()
      };

      console.log('✨ Creating new user:', { 
        email: newUser.email, 
        role: newUser.role, 
        status: newUser.status,
        hasPassword: !!newUser.password,
        passwordLength: newUser.password.length
      });

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      console.log('💾 User saved to localStorage. Total users now:', users.length);

      // Add audit log
      addAuditLog(
        'User Signup',
        `New ${role} account created: ${name} (${normalizedEmail})`,
        'System'
      );

      // For Accountants, show message about pending approval
      if (role === 'Accountant') {
        console.log('⏳ Accountant signup - requiring approval');
        return { 
          error: null, 
          message: 'Account created successfully! Your account is pending approval by an administrator. You will be able to log in once approved.' 
        };
      }

      // For other roles, sign in immediately
      console.log('✅ Signing in new user automatically');
      const signInResult = await signIn(normalizedEmail, password);
      return signInResult;
    } catch (error) {
      console.error('💥 Signup error:', error);
      return { error: 'An unexpected error occurred: ' + error.message };
    }
  };

  const signOut = async () => {
    console.log('👋 Signing out user:', user?.email);
    
    // Add audit log for logout
    if (user) {
      addAuditLog(
        'User Logout',
        `User logged out successfully`,
        user.name,
        'Authentication'
      );
    }
    
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}