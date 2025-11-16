# 🚀 Local Development Setup

## Quick Start for Local Development

Your PharmaCare system is now configured to run completely locally without requiring Supabase backend services.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Open `http://localhost:5173` in your browser.

## 🔑 Default Login Credentials

The system comes with three pre-configured accounts:

### Admin Account
- **Email**: `admin@pharmacare.com`
- **Password**: `admin123`
- **Access**: Full system access

### Pharmacist Account  
- **Email**: `pharmacist@pharmacare.com`
- **Password**: `pharma123`
- **Access**: Clinical operations

### Accountant Account
- **Email**: `accountant@pharmacare.com`
- **Password**: `account123`
- **Access**: Financial operations

## 💾 Data Storage

- **Local Storage**: All data is stored in browser localStorage
- **Persistent**: Data persists across browser sessions
- **Demo Data**: Includes sample medicines, patients, and transactions

## 🧪 Testing the System

### Complete Workflow Test:
1. **Login as Admin** → View all system features
2. **Switch to Pharmacist** → Create prescriptions and bills
3. **Switch to Accountant** → Process payments and print receipts
4. **Check Analytics** → View transaction reports

### Key Features to Test:
- ✅ Role-based navigation and permissions
- ✅ Prescription creation and management
- ✅ Walk-in customer processing
- ✅ Payment processing with multiple methods
- ✅ Receipt and order slip printing
- ✅ Inventory management with alerts
- ✅ Patient management system
- ✅ User approval workflow (create new Accountant)
- ✅ Analytics and reporting

## 🔧 Development Features

### Hot Reload
- Changes update instantly
- No server restart needed

### Browser DevTools
- Open DevTools → Application → Local Storage
- View/edit stored data in real-time
- Debug authentication state

### Data Reset
To reset all data:
```javascript
// In browser console
localStorage.clear()
location.reload()
```

## 📱 Mobile Testing

Test responsive design:
- Resize browser window
- Use DevTools device emulation
- Test touch interactions

## 🖨️ Print Testing

- Order slips: Use browser print preview
- Receipts: Test thermal receipt formatting
- Bills: Test walk-in customer bills

## 🚫 Troubleshooting

### Common Issues:

**White Screen/App Won't Load:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Login Issues:**
```bash
# Reset localStorage in browser console
localStorage.clear()
location.reload()
```

**Port Already in Use:**
```bash
npm run dev -- --port 3000
```

**TypeScript Errors:**
```bash
npx tsc --noEmit
```

## 🔄 Backend Integration (Optional)

For production with Supabase backend:
1. Set up Supabase project
2. Configure environment variables
3. Deploy edge functions
4. Update authentication to use Supabase

See `DEPLOYMENT.md` for production setup.

---

**Your PharmaCare system is ready for local development! 🎉**