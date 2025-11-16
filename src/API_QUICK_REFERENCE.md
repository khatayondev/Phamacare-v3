# 🚀 Backend API Quick Reference Guide

## 📡 **API Endpoint Base URL**

```
https://{projectId}.supabase.co/functions/v1/make-server-3e7703d4
```

---

## 🔑 **Authentication**

All requests require an Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

---

## 💊 **MEDICINES API**

### Get All Medicines
```typescript
GET /medicines

Response: Medicine[]
```

### Create Medicine
```typescript
POST /medicines

Body: {
  name: string
  category: string
  price: number           // In Ghanaian cedis (₵)
  stock: number
  minStock: number
  expiry: string          // ISO date
  supplier: string
  description?: string
  batchNumber?: string
  manufacturer?: string
  barcode?: string        // NEW!
}

Response: Medicine
```

### Update Medicine
```typescript
PUT /medicines/:id

Body: Partial<Medicine>

Response: Medicine
```

### Delete Medicine
```typescript
DELETE /medicines/:id

Response: { message: string }
```

---

## 👥 **PATIENTS API**

### Get All Patients
```typescript
GET /patients

Response: Patient[]
```

### Create Patient
```typescript
POST /patients

Body: {
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  emergencyContact: string
  medicalHistory?: string
  allergies?: string
}

Response: Patient
```

### Update Patient
```typescript
PUT /patients/:id

Body: Partial<Patient>

Response: Patient
```

---

## 📋 **PRESCRIPTIONS API** ⭐ NEW!

### Get All Prescriptions
```typescript
GET /prescriptions

Response: Prescription[]
```

### Create Prescription
```typescript
POST /prescriptions

Body: {
  patientId: string
  patientName: string
  patientPhone: string
  patientType: 'registered' | 'walk-in'
  createdBy: string
  items: Array<{
    medicineId: string
    medicineName: string
    quantity: number
    price: number
    instructions?: string
  }>
  subtotal: number
  tax: number
  total: number
  status: 'Pending'
}

Response: Prescription (with auto-generated id and prescriptionNumber)

Note: Stock is automatically reserved on creation
```

### Update Prescription
```typescript
PUT /prescriptions/:id

Body: {
  status?: 'Pending' | 'Paid' | 'Cancelled'
  paymentMethod?: string
  paidAt?: string
}

Response: Prescription

Note: 
- Setting status to 'Paid' records payment time
- Setting status to 'Cancelled' restores stock
```

### Delete Prescription
```typescript
DELETE /prescriptions/:id

Response: { message: string }

Note: Stock is restored if prescription wasn't paid
```

---

## 💰 **SALES API**

### Get All Sales
```typescript
GET /sales

Response: Sale[]
```

### Create Sale
```typescript
POST /sales

Body: {
  customerName: string
  customerPhone: string
  items: Array<{
    medicineId: string
    medicineName: string
    quantity: number
    price: number
  }>
  total: number
  paymentMethod: string
  status: string
  prescriptionId?: string
}

Response: Sale

Note: Automatically updates medicine stock
```

---

## 🚚 **SUPPLIERS API**

### Get All Suppliers
```typescript
GET /suppliers

Response: Supplier[]
```

### Create Supplier
```typescript
POST /suppliers

Body: {
  name: string
  contact: string
  phone: string
  email: string
  address: string
  paymentTerms: string
  status: string
}

Response: Supplier
```

---

## 👤 **USERS API**

### Get All Users
```typescript
GET /users

Response: User[]
```

### Create User
```typescript
POST /users

Body: {
  name: string
  email: string
  role: 'Admin' | 'Pharmacist' | 'Accountant'
  status: string
}

Response: User
```

### Update User Status (Admin Only)
```typescript
PUT /users/:id/status

Headers: {
  Authorization: Bearer {adminAccessToken}
}

Body: {
  status: 'approved' | 'rejected' | 'pending'
}

Response: User
```

### Delete User (Admin Only)
```typescript
DELETE /users/:id

Headers: {
  Authorization: Bearer {adminAccessToken}
}

Response: { message: string }
```

---

## 📊 **ANALYTICS API**

### Get Dashboard Analytics
```typescript
GET /analytics/dashboard

Response: {
  totalRevenue: number
  todayRevenue: number
  totalSales: number
  todaySales: number
  totalPatients: number
  totalMedicines: number
  lowStockCount: number
  expiringSoonCount: number
  lowStockItems: Medicine[]
  expiringSoon: Medicine[]
}
```

---

## 🔄 **REAL-TIME UPDATES**

### Subscribe to Updates (Polling)

```typescript
import { subscribeToUpdates } from './utils/backendApi';

// Poll for updates every 5 seconds
const cleanup = subscribeToUpdates('prescriptions', (data) => {
  console.log('Updated prescriptions:', data);
  setPrescriptions(data);
}, 5000);

// Cleanup when component unmounts
useEffect(() => {
  return () => cleanup();
}, []);
```

### Available Resources:
- `'medicines'`
- `'patients'`
- `'prescriptions'` ⭐
- `'sales'`
- `'suppliers'`
- `'users'`

---

## 🔐 **AUTHENTICATION ROUTES**

### Sign Up
```typescript
POST /auth/signup

Body: {
  email: string
  password: string
  name: string
  role: 'Admin' | 'Pharmacist' | 'Accountant'
}

Response: {
  message: string
  user: User
}

Note: Email is auto-confirmed (no email server configured)
```

---

## 📝 **USAGE EXAMPLES**

### Frontend Component Example:

```typescript
import { prescriptionAPI, subscribeToUpdates } from '../utils/backendApi';

export function MyComponent() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const data = await prescriptionAPI.getAll();
      setPrescriptions(data);
    };
    fetchData();

    // Real-time updates
    const cleanup = subscribeToUpdates('prescriptions', (data) => {
      setPrescriptions(data);
    }, 5000);

    return () => cleanup();
  }, []);

  const createPrescription = async (prescriptionData) => {
    try {
      const newPrescription = await prescriptionAPI.create(prescriptionData);
      console.log('Created:', newPrescription);
      
      // Update local state
      setPrescriptions([newPrescription, ...prescriptions]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create prescription');
    }
  };

  return (
    // Your component JSX
  );
}
```

---

## ⚠️ **ERROR HANDLING**

All API calls return proper HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

### Error Response Format:

```typescript
{
  error: string  // Human-readable error message
}
```

### Example Error Handling:

```typescript
try {
  const prescription = await prescriptionAPI.create(data);
} catch (error) {
  console.error('API Error:', error.message);
  // error.message will be the error string from server
  alert(`Error: ${error.message}`);
}
```

---

## 🎯 **BEST PRACTICES**

### 1. Always Handle Errors
```typescript
try {
  const data = await medicineAPI.create(medicine);
} catch (error) {
  console.error('Failed to create medicine:', error);
  // Show user-friendly message
}
```

### 2. Use Loading States
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await prescriptionAPI.getAll();
    setPrescriptions(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. Validate Before Sending
```typescript
if (!medicine.name || !medicine.price) {
  alert('Please fill required fields');
  return;
}

const newMedicine = await medicineAPI.create(medicine);
```

### 4. Update Local State After API Calls
```typescript
const created = await prescriptionAPI.create(data);
setPrescriptions([created, ...prescriptions]); // Add to local state
```

### 5. Clean Up Subscriptions
```typescript
useEffect(() => {
  const cleanup = subscribeToUpdates('prescriptions', callback);
  return () => cleanup(); // Always cleanup!
}, []);
```

---

## 🔍 **DEBUGGING**

### Enable Console Logging

All API calls automatically log to console:

```
Backend API call: POST /prescriptions
API Response: {...}
📡 Dispatching prescriptionsUpdated event
```

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "make-server"
4. See all API requests/responses

### Verify Authentication

```typescript
const accessToken = localStorage.getItem('sb-auth');
console.log('Access token:', JSON.parse(accessToken).access_token);
```

---

## 📊 **STOCK MANAGEMENT FLOW**

### Prescription Created:
```
1. User creates prescription
2. API validates stock availability
3. Stock is RESERVED (reduced from inventory)
4. Prescription status = 'Pending'
```

### Prescription Paid:
```
1. Accountant marks as 'Paid'
2. Stock remains reduced (sale complete)
3. paidAt timestamp recorded
4. Sale may be created
```

### Prescription Cancelled:
```
1. User cancels prescription
2. Stock is RESTORED (added back to inventory)
3. Prescription status = 'Cancelled'
```

### Prescription Deleted:
```
1. User deletes prescription
2. If status != 'Paid': Stock RESTORED
3. If status == 'Paid': Stock stays reduced
4. Prescription removed from system
```

---

## 💡 **TIPS & TRICKS**

### Batch Operations
```typescript
// Create multiple items
const promises = items.map(item => medicineAPI.create(item));
const results = await Promise.all(promises);
```

### Optimistic Updates
```typescript
// Update UI immediately, then call API
setPrescriptions([newPrescription, ...prescriptions]);

try {
  await prescriptionAPI.create(newPrescription);
} catch (error) {
  // Revert on error
  setPrescriptions(prescriptions);
}
```

### Debounced Search
```typescript
useEffect(() => {
  const timer = setTimeout(async () => {
    if (searchTerm) {
      const results = await medicineAPI.search(searchTerm);
      setResults(results);
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchTerm]);
```

---

## 🌟 **NEW FEATURES**

### Barcode Lookup
```typescript
// Search by barcode
const medicine = medicines.find(m => m.barcode === scannedBarcode);

if (medicine) {
  // Auto-fill form with medicine data
  setFormData({
    name: medicine.name,
    price: medicine.price,
    category: medicine.category,
    // ... other fields
  });
}
```

### Currency Display
```typescript
// Always use Ghanaian cedis symbol
const formattedPrice = `₵${price.toFixed(2)}`;
```

### Real-Time Notifications
```typescript
// Listen for new prescriptions
window.addEventListener('prescriptionsUpdated', (event) => {
  const prescriptions = event.detail;
  showNotification(`${prescriptions.length} pending prescriptions`);
});
```

---

## 📞 **SUPPORT**

For issues or questions:
1. Check console logs for errors
2. Verify network connectivity  
3. Check environment variables
4. Review this documentation
5. Test with API debugging tools

---

*Last Updated: October 12, 2025*  
*API Version: 2.0.0*
