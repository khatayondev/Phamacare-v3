# Health Haven Pharmacy - Developer Guide

**Quick reference for developers working on the Health Haven Pharmacy management system.**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Code editor (VS Code recommended)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd health-haven-pharmacy

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── figma/          # Figma assets
│   └── index.ts        # Component exports
├── utils/              # Utility functions
│   ├── supabase/       # Backend config
│   └── index.ts        # Utility exports
├── hooks/              # Custom React hooks
├── styles/             # Global styles
├── supabase/           # Backend (Edge Functions)
├── docs/               # Documentation
└── App.tsx             # Main app component
```

---

## 🧩 Component Architecture

### Core Components
- **AuthProvider**: Authentication & session management
- **LoginPage / SignupPage**: User authentication UI
- **DashboardOverview**: Main dashboard
- **MedicineInventory**: Medicine stock management
- **PatientManagement**: Patient records
- **PrescriptionManagement**: Prescription creation & billing
- **PaymentProcessing**: Payment acceptance & receipt printing
- **SalesManagement**: Sales history & analytics
- **SupplierManagement**: Supplier contacts
- **ReportsAnalytics**: Business intelligence
- **SettingsManagement**: System configuration

### Importing Components
```typescript
// Use barrel exports for clean imports
import { 
  DashboardOverview, 
  MedicineInventory,
  PatientManagement 
} from './components';

// UI components
import { Button, Card, Input } from './components/ui';
```

---

## 🎨 Styling System

### Design Tokens
All design tokens are in `/styles/globals.css`:
- Colors via CSS variables
- Typography defaults
- Spacing scale
- Shadow system

### Tailwind CSS
```typescript
// ✅ Use Tailwind utilities
<div className="flex items-center gap-4 p-6 bg-background">
  
// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Avoid custom font sizes/weights (use defaults)
<h1 className="text-2xl font-bold"> // Don't do this
<h1> // Do this instead - globals.css has defaults
```

### Important Rules
1. **DON'T** add font-size, font-weight, or line-height classes
2. **DO** use semantic HTML (h1, h2, p, etc.)
3. **DO** use Tailwind for layout, spacing, colors
4. **DO** maintain minimal shadow and border aesthetic

---

## 💾 Data Management

### Offline-First Architecture
All data stored in `localStorage` for instant UI updates:

```typescript
import { 
  getMedicines, 
  saveMedicine, 
  deleteMedicine 
} from './utils/localStorageService';

// Get data
const medicines = getMedicines();

// Save data
saveMedicine(newMedicine);

// Delete data
deleteMedicine(medicineId);
```

### Currency Formatting
```typescript
import { useCurrency } from './utils/currencyContext';

function MyComponent() {
  const { formatAmount, currency } = useCurrency();
  
  return <div>{formatAmount(1500)} {currency.code}</div>;
  // Output: ₵1,500.00 GHS
}
```

### Audit Logging
```typescript
import { addAuditLog } from './utils/audit';

// Log user actions
addAuditLog({
  userId: user.id,
  userName: user.name,
  action: 'Created prescription',
  entity: 'Prescription',
  entityId: prescription.id,
  details: 'Created prescription for patient John Doe'
});
```

---

## 🔐 Authentication & Roles

### Role-Based Access
Three user roles with distinct permissions:

1. **Admin**: Full system access
2. **Pharmacist**: Clinical operations (inventory, patients, prescriptions)
3. **Accountant**: Financial operations (payments, receipts)

### Using Auth Context
```typescript
import { useAuth } from './components/AuthProvider';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  // Check user role
  if (user?.role === 'Admin') {
    // Show admin features
  }
  
  return <div>Welcome, {user?.name}</div>;
}
```

### Protected Routes
Navigation items are filtered based on user role in `App.tsx`.

---

## 🔔 Notifications & Toast

### Toast Notifications
```typescript
import { toast } from 'sonner@2.0.3';

// Success
toast.success('Medicine added successfully!');

// Error
toast.error('Failed to save medicine');

// Info
toast.info('Processing payment...');

// Warning
toast.warning('Low stock alert');
```

### Notification System
The `NotificationSystem` component handles real-time notifications for:
- Pending prescriptions (for Accountants)
- Low stock alerts (for Pharmacists/Admins)
- Payment confirmations

---

## 🖨️ Printing Functionality

### Thermal Receipt Printing
```typescript
import { ThermalPrinter } from './components/ThermalPrinter';

// In your component
const handlePrint = (transaction) => {
  ThermalPrinter.printReceipt(transaction);
};
```

### Order Slip Printing
```typescript
// In PrescriptionManagement component
const handlePrintOrderSlip = (prescription) => {
  // Generates printable order slip
  printOrderSlip(prescription);
};
```

---

## 📊 Working with Data

### Medicine Inventory
```typescript
import { medicineAPI } from './utils/backendApi';

// Get all medicines
const medicines = await medicineAPI.getAll();

// Create medicine
await medicineAPI.create({
  name: 'Paracetamol',
  price: 5.00,
  stock: 100,
  category: 'Pain Relief'
});

// Update medicine
await medicineAPI.update(medicineId, { stock: 150 });

// Delete medicine
await medicineAPI.delete(medicineId);
```

### Patient Management
```typescript
import { patientAPI } from './utils/backendApi';

// Get all patients
const patients = await patientAPI.getAll();

// Create patient
await patientAPI.create({
  name: 'John Doe',
  phone: '0241234567',
  email: 'john@example.com'
});
```

### Prescription Workflow
```typescript
import { prescriptionAPI } from './utils/backendApi';

// Create prescription
const prescription = await prescriptionAPI.create({
  patientId: patient.id,
  items: [
    {
      medicineId: medicine.id,
      quantity: 2,
      dosage: '500mg',
      instructions: 'Take twice daily after meals'
    }
  ]
});

// Prescription automatically appears in Payment Processing
// for Accountants to process payment
```

---

## 🧪 Testing & Debugging

### Debug Components
Available in development mode:
- `AuthDebugger` - Auth state debugging
- `CSSDebugger` - Styling issues
- `DataFlowDebugger` - Data flow visualization
- `SystemValidator` - System health checks

### System Validation
```typescript
// In Settings > System Health tab
// Run automated validation to check:
// - Data integrity
// - Component functionality
// - Workflow processes
// - Storage operations
```

### Browser Console
The system logs important events:
```javascript
// Check localStorage
localStorage.getItem('medicines')
localStorage.getItem('prescriptions')

// Check auth state
localStorage.getItem('user')
```

---

## 🔧 Common Tasks

### Add a New Component
1. Create component in `/components/MyComponent.tsx`
2. Export it in `/components/index.ts`
3. Import and use: `import { MyComponent } from './components'`

### Add a New Utility
1. Create utility in `/utils/myUtil.ts`
2. Export it in `/utils/index.ts`
3. Import and use: `import { myUtil } from './utils'`

### Add a New Page/View
1. Create component in `/components/MyView.tsx`
2. Add to navigation in `App.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  { 
    id: "myview", 
    label: "My View", 
    icon: MyIcon, 
    roles: ["Admin"] 
  }
];
```
3. Add to view renderer:
```typescript
const renderCurrentView = () => {
  switch (currentView) {
    // ... existing cases
    case "myview":
      return <MyView />;
  }
};
```

### Update Styling
1. Global styles: Edit `/styles/globals.css`
2. Component styles: Use Tailwind classes
3. Theme colors: Update CSS variables in globals.css

---

## 📦 Key Dependencies

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling

### UI Components
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Recharts** - Charts

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Notifications
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend as a Service (configured)
- **LocalStorage** - Primary data store (offline-first)

---

## 🚨 Common Issues & Solutions

### Issue: Component not rendering
**Solution**: Check if it's exported in `/components/index.ts`

### Issue: Styling not applied
**Solution**: 
1. Check Tailwind class names
2. Verify globals.css is imported
3. Don't override font styles

### Issue: Data not persisting
**Solution**: 
1. Check localStorage in browser DevTools
2. Verify `localStorageService` is being used
3. Check for console errors

### Issue: Toast not showing
**Solution**: 
1. Verify `<Toaster />` is in App.tsx
2. Import toast: `import { toast } from 'sonner@2.0.3'`

### Issue: Currency not formatting
**Solution**: Use `useCurrency` hook and `formatAmount` function

---

## 📚 Additional Resources

- **Full Documentation**: See `/docs/README.md`
- **Project Structure**: See `/PROJECT_STRUCTURE.md`
- **API Reference**: See `/docs/API_QUICK_REFERENCE.md`
- **Troubleshooting**: See `/docs/TROUBLESHOOTING_GUIDE.md`

---

## 🤝 Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Keep components under 500 lines
- Use barrel exports for imports

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add: My feature description"

# Push to repository
git push origin feature/my-feature
```

### Commit Message Format
- **Add**: New feature
- **Fix**: Bug fix
- **Update**: Modify existing feature
- **Refactor**: Code restructuring
- **Docs**: Documentation changes

---

## 💡 Tips & Best Practices

1. **Always use TypeScript** - Type safety prevents bugs
2. **Use barrel exports** - Cleaner import statements
3. **Follow offline-first** - Use localStorage for data
4. **Log audit trails** - Track all user actions
5. **Test role permissions** - Verify access controls
6. **Use toast notifications** - Provide user feedback
7. **Maintain responsive design** - Mobile-first approach
8. **Keep components focused** - Single responsibility
9. **Document complex logic** - Help future developers
10. **Test before committing** - Ensure no breaking changes

---

**Happy Coding! 🚀**

For questions or issues, refer to `/docs` or check the troubleshooting guide.
