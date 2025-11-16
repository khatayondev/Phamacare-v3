# 🚀 Setup Guide: Push to GitHub & Run Locally

## 📋 Step-by-Step Instructions

### 1. **Push to GitHub Repository**

#### Create a new repository on GitHub:
1. Go to [GitHub.com](https://github.com) and click **"New"**
2. Name your repository: `pharmacare-management`
3. Add description: `Pharmacy Management System with Role-Based Access`
4. Choose **Public** or **Private**
5. **Don't** initialize with README (we already have one)
6. Click **"Create repository"**

#### Push your code:
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes  
git commit -m "Initial commit: PharmaCare Management System"

# Add your GitHub repository as origin
git remote add origin https://github.com/yourusername/pharmacare-management.git

# Push to GitHub
git push -u origin main
```

### 2. **Set Up Local Development Environment**

#### Prerequisites (install these first):
- **Node.js** v18+ → [Download here](https://nodejs.org/)
- **Git** → [Download here](https://git-scm.com/)
- **VS Code** (recommended) → [Download here](https://code.visualstudio.com/)

#### Clone and setup:
```bash
# Clone your repository
git clone https://github.com/yourusername/pharmacare-management.git
cd pharmacare-management

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. **Supabase Setup** 

#### Create Supabase Project:
1. Go to [supabase.com](https://supabase.com) → **"Start your project"**
2. Sign up/login with GitHub
3. Click **"New project"**
4. Choose organization, name it `pharmacare-db`
5. Create a strong password
6. Select region (closest to you)
7. Click **"Create new project"** (takes ~2 minutes)

#### Get your credentials:
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Go to **Settings** → **API** → **Service Role** (be careful with this!)

#### Update your `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. **Database Setup**

#### Run these SQL commands in Supabase SQL Editor:
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Pharmacist', 'Accountant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines table
CREATE TABLE public.medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 10,
  expiry_date DATE,
  manufacturer TEXT,
  batch_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id),
  pharmacist_id UUID REFERENCES user_profiles(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Paid', 'Cancelled')) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  accountant_id UUID REFERENCES user_profiles(id),
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Insurance'))
);

-- Sales table (for tracking individual sales)
CREATE TABLE public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES prescriptions(id),
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  pharmacist_id UUID REFERENCES user_profiles(id),
  accountant_id UUID REFERENCES user_profiles(id)
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view medicines" ON medicines
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Pharmacists can manage patients" ON patients
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Admin', 'Pharmacist')
    )
  );

-- Insert sample data
INSERT INTO public.medicines (name, category, price, stock, min_stock, manufacturer) VALUES
('Paracetamol 500mg', 'Tablet', 5.99, 100, 20, 'MediCorp'),
('Amoxicillin 250mg', 'Capsule', 12.50, 50, 15, 'PharmaCorp'),
('Cough Syrup', 'Syrup', 8.75, 30, 10, 'HealthPlus'),
('Vitamin C 1000mg', 'Tablet', 15.00, 75, 25, 'WellnessCo'),
('Ibuprofen 400mg', 'Tablet', 7.25, 80, 20, 'MediCorp');

-- Insert demo patients
INSERT INTO public.patients (name, email, phone, address, date_of_birth, gender) VALUES
('John Smith', 'john.smith@email.com', '+1234567890', '123 Main St, City', '1985-06-15', 'Male'),
('Sarah Johnson', 'sarah.j@email.com', '+1234567891', '456 Oak Ave, City', '1990-03-22', 'Female'),
('Mike Wilson', 'mike.w@email.com', '+1234567892', '789 Pine St, City', '1978-11-08', 'Male');
```

### 5. **Create Demo Admin User**

#### In Supabase Auth dashboard:
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - **Email**: `john@pharmacare.com`
   - **Password**: `admin123`
   - **Email Confirm**: ✅ (check this)
4. Click **"Create user"**

#### Add admin profile (run in SQL Editor):
```sql
-- Insert admin profile (replace USER_ID with the actual ID from auth.users)
INSERT INTO public.user_profiles (id, name, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'john@pharmacare.com'),
  'John Admin',
  'Admin'
);
```

### 6. **Run the Application**

```bash
# Start development server
npm run dev

# Open browser to: http://localhost:5173
```

### 7. **Test the System**

#### Login with demo account:
- **Email**: `john@pharmacare.com`
- **Password**: `admin123`

#### Create additional users:
1. Click **"Sign Up"** 
2. Fill in details and choose role
3. Test different role permissions

### 8. **Deploy to Production**

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables
```

#### Option B: Netlify
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in dashboard

## 🚨 Important Notes

### **Security:**
- Never commit `.env.local` to GitHub
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- Use Row Level Security (RLS) policies in production

### **Development:**
- Hot reload works automatically
- Check browser console for errors
- Use React DevTools for debugging

### **Troubleshooting:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset git if needed
rm -rf .git
git init
```

## 🎉 You're Ready!

Your PharmaCare Management System is now:
- ✅ On GitHub
- ✅ Running locally
- ✅ Connected to Supabase
- ✅ Ready for development

Happy coding! 🚀