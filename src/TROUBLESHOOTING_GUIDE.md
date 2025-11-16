# 🔧 TROUBLESHOOTING GUIDE

## 🚨 **Common Issues & Solutions**

---

## 📋 **TABLE OF CONTENTS**

1. [No Data Showing](#no-data-showing)
2. [Real-time Updates Not Working](#real-time-updates-not-working)
3. [Authentication Errors](#authentication-errors)
4. [Stock Management Issues](#stock-management-issues)
5. [Prescription Not Appearing](#prescription-not-appearing)
6. [Payment Processing Errors](#payment-processing-errors)
7. [Currency Display Issues](#currency-display-issues)
8. [Barcode Not Working](#barcode-not-working)
9. [Slow Performance](#slow-performance)
10. [Console Errors](#console-errors)

---

## 1. **NO DATA SHOWING**

### Symptoms:
- Empty tables
- "No data available" messages
- Blank dashboards

### Possible Causes:
- Backend not running
- Environment variables missing
- Network connectivity issues
- Wrong API endpoint

### Solutions:

#### ✅ Check Backend is Running
```bash
# Verify Supabase is running
curl https://{projectId}.supabase.co/functions/v1/make-server-3e7703d4/medicines

# Should return JSON array
```

#### ✅ Check Environment Variables
```typescript
// In browser console
console.log('Project ID:', import.meta.env.VITE_SUPABASE_PROJECT_ID);
console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Both should have values
```

#### ✅ Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for API calls to `make-server-3e7703d4`
5. Check status codes (should be 200)

#### ✅ Initialize Default Data
```typescript
// Backend automatically initializes on first call
// Just refresh the page a few times
```

---

## 2. **REAL-TIME UPDATES NOT WORKING**

### Symptoms:
- Prescriptions created by pharmacist don't appear for accountant
- Updates require manual refresh
- Changes don't sync across devices

### Possible Causes:
- Polling not started
- Component unmounted too early
- Network issues
- Different databases

### Solutions:

#### ✅ Wait 5 Seconds
```
Polling interval is 5 seconds
Just wait a bit for updates to appear
```

#### ✅ Check Console for Polling
```typescript
// Should see in console every 5 seconds:
Backend API call: GET /prescriptions
```

#### ✅ Verify Cleanup Not Called Early
```typescript
// In component code:
useEffect(() => {
  const cleanup = subscribeToUpdates(...);
  return () => cleanup(); // ✅ Only on unmount
}, []); // ✅ Empty dependency array
```

#### ✅ Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 3. **AUTHENTICATION ERRORS**

### Symptoms:
- "Unauthorized" errors
- "Invalid token" messages
- Redirected to login
- 401 status codes

### Possible Causes:
- Token expired
- Wrong credentials
- Service key exposed (security issue)
- CORS errors

### Solutions:

#### ✅ Check Access Token
```typescript
// In browser console
const authData = localStorage.getItem('sb-auth');
console.log('Auth Data:', JSON.parse(authData));

// Should have access_token
```

#### ✅ Re-login
```
1. Logout completely
2. Clear browser cache
3. Login again with valid credentials
```

#### ✅ Verify Backend Auth
```typescript
// In backend index.tsx
// Make sure using SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // ✅ Not ANON_KEY
);
```

#### ✅ Check CORS
```typescript
// In backend
app.use('*', cors({
  origin: '*',  // ✅ Allow all origins
  allowHeaders: ['*'],
  allowMethods: ['*']
}));
```

---

## 4. **STOCK MANAGEMENT ISSUES**

### Symptoms:
- Stock not reducing when prescription created
- Stock not restoring when prescription cancelled
- Negative stock values
- "Insufficient stock" errors when stock available

### Possible Causes:
- Backend stock logic broken
- Race conditions
- Multiple prescriptions for same medicine
- Cache issues

### Solutions:

#### ✅ Check Backend Prescription Route
```typescript
// In /supabase/functions/server/index.tsx
// POST /prescriptions should have:

// Reserve stock
for (const item of prescriptionData.items) {
  const medicineIndex = medicines.findIndex(...);
  if (medicineIndex !== -1) {
    // Check stock
    if (medicines[medicineIndex].stock < item.quantity) {
      return c.json({ error: 'Insufficient stock' }, 400);
    }
    // Reduce stock
    medicines[medicineIndex].stock -= item.quantity;
  }
}

await kv.set('medicines', medicines);
```

#### ✅ Verify Cancel/Delete Logic
```typescript
// PUT /prescriptions/:id
if (updateData.status === 'Cancelled') {
  // Restore stock
  for (const item of prescriptions[index].items) {
    medicines[medicineIndex].stock += item.quantity;
  }
}
```

#### ✅ Check Stock Values
```typescript
// In medicine inventory
console.log('Current stock:', medicine.stock);
console.log('Min stock:', medicine.minStock);
console.log('Prescription quantity:', item.quantity);
```

#### ✅ Refresh Medicine Data
```
1. Go to Medicine Inventory page
2. Hard refresh (Ctrl + Shift + R)
3. Check stock values
```

---

## 5. **PRESCRIPTION NOT APPEARING**

### Symptoms:
- Created prescription doesn't show in list
- Accountant can't see new prescriptions
- Prescription created but disappeared

### Possible Causes:
- Not saved to database
- Filtered out by status
- Wrong user permissions
- Polling not working

### Solutions:

#### ✅ Check Creation Success
```typescript
// Should see in console:
Creating prescription: {...}
Prescription created via API: {...}
Dispatching prescriptionCreated event
```

#### ✅ Verify Status Filter
```typescript
// In PaymentProcessing.tsx
const pendingOnly = data.filter((p: any) => p.status === 'Pending');

// Make sure status is 'Pending' not 'pending'
```

#### ✅ Check Backend Response
```
1. Open Network tab
2. Find POST /prescriptions request
3. Check response JSON
4. Verify 'id' and 'prescriptionNumber' present
```

#### ✅ Direct Database Check
```typescript
// In browser console
fetch('https://{projectId}.supabase.co/functions/v1/make-server-3e7703d4/prescriptions', {
  headers: { 'Authorization': 'Bearer {token}' }
})
.then(r => r.json())
.then(console.log);
```

---

## 6. **PAYMENT PROCESSING ERRORS**

### Symptoms:
- Can't mark prescription as paid
- Payment doesn't save
- Receipt doesn't generate
- "Failed to update" errors

### Possible Causes:
- Prescription not found
- Invalid payment data
- Network error
- Backend validation failing

### Solutions:

#### ✅ Check Prescription ID
```typescript
// In PaymentProcessing.tsx
console.log('Updating prescription:', prescription.id);
console.log('Payment data:', paymentData);
```

#### ✅ Verify Update Call
```typescript
// Should be:
await prescriptionAPI.update(prescription.id, {
  status: 'Paid',
  paymentMethod: paymentData.paymentMethod,
  paidAt: new Date().toISOString()
});
```

#### ✅ Check Backend PUT Route
```
1. Open Network tab
2. Find PUT /prescriptions/{id} request
3. Check status code (should be 200)
4. Check response JSON
```

#### ✅ Verify Payment Method
```typescript
// Valid payment methods:
'Cash'
'Credit Card'
'Debit Card'
'Mobile Money'
'Insurance'
```

---

## 7. **CURRENCY DISPLAY ISSUES**

### Symptoms:
- Prices showing as $
- Missing ₵ symbol
- Wrong currency amounts
- Inconsistent formatting

### Possible Causes:
- Old cached data
- Backend not updated
- Frontend template not updated
- Number formatting issues

### Solutions:

#### ✅ Verify Backend Prices
```typescript
// In /supabase/functions/server/index.tsx
// Default medicines should have:
price: 15.99,  // Not 1.50
price: 22.50,  // Not 2.25
// etc.
```

#### ✅ Check Frontend Display
```typescript
// Should use:
`₵${price.toFixed(2)}`

// NOT:
`$${price.toFixed(2)}`
```

#### ✅ Clear Old Data
```typescript
// In browser console
localStorage.clear();
location.reload();
```

#### ✅ Re-initialize Database
```
1. Stop backend
2. Delete KV store data
3. Restart backend
4. Refresh frontend
```

---

## 8. **BARCODE NOT WORKING**

### Symptoms:
- Barcode search returns nothing
- Can't find medicine by barcode
- Barcode field not saving
- Auto-fill not working

### Possible Causes:
- Barcode field not in backend
- No barcodes in database
- Wrong search logic
- Input not triggering search

### Solutions:

#### ✅ Verify Barcode in Backend
```typescript
// In /supabase/functions/server/index.tsx
interface Medicine {
  // ...
  barcode?: string; // ✅ Should be present
}
```

#### ✅ Check Default Medicines
```typescript
// Should have barcodes:
{
  name: 'Paracetamol',
  barcode: '8934567890123' // ✅
}
```

#### ✅ Test Barcode Search
```typescript
// In MedicineInventory.tsx
const handleBarcodeSearch = async (barcode: string) => {
  console.log('Searching for barcode:', barcode);
  const matchingMedicine = medicines.find(m => m.barcode === barcode);
  console.log('Found:', matchingMedicine);
};
```

#### ✅ Verify Input Event
```
1. Type barcode in input
2. Press Enter or click Search
3. Check console for "Searching for barcode"
```

---

## 9. **SLOW PERFORMANCE**

### Symptoms:
- Slow page loads
- Laggy UI
- Long API response times
- Delayed updates

### Possible Causes:
- Too much data
- Inefficient queries
- No pagination
- Network latency
- Too frequent polling

### Solutions:

#### ✅ Check Data Size
```typescript
// In browser console
medicines.length  // Should be < 1000
patients.length   // Should be < 1000
prescriptions.length  // Should be < 500
```

#### ✅ Optimize Polling Interval
```typescript
// Increase from 5s to 10s if needed
const cleanup = subscribeToUpdates('prescriptions', callback, 10000);
```

#### ✅ Implement Pagination (Future)
```typescript
// For large datasets, add:
GET /prescriptions?page=1&limit=50
```

#### ✅ Check Network Speed
```
1. Open DevTools
2. Go to Network tab
3. Check request times
4. Should be < 1000ms
```

---

## 10. **CONSOLE ERRORS**

### Common Errors:

#### ❌ "Failed to fetch"
```
Cause: Backend not running or wrong URL
Fix: Check backend is deployed and URL is correct
```

#### ❌ "Unauthorized"
```
Cause: No auth token or expired
Fix: Re-login or check token in localStorage
```

#### ❌ "Insufficient stock"
```
Cause: Not enough medicine in inventory
Fix: Check stock levels, add more medicine
```

#### ❌ "Prescription not found"
```
Cause: Wrong prescription ID
Fix: Verify ID exists in database
```

#### ❌ "Invalid status"
```
Cause: Status not 'Pending', 'Paid', or 'Cancelled'
Fix: Use exact string values (case-sensitive)
```

#### ❌ "CORS error"
```
Cause: Backend CORS not configured
Fix: Add CORS headers in backend
```

#### ❌ "Network error"
```
Cause: No internet or backend down
Fix: Check connection and backend status
```

---

## 🔍 **DEBUGGING TOOLS**

### Browser Console Commands:

```javascript
// Check auth
localStorage.getItem('sb-auth')

// Check prescriptions
fetch('https://{projectId}.supabase.co/functions/v1/make-server-3e7703d4/prescriptions', {
  headers: { 'Authorization': 'Bearer {token}' }
}).then(r => r.json()).then(console.log)

// Clear all data
localStorage.clear()

// Check environment
console.log('ENV:', import.meta.env)

// Force refresh
location.reload(true)
```

### Network Tab Checklist:

- [ ] Check request URL is correct
- [ ] Check request method (GET/POST/PUT/DELETE)
- [ ] Check Authorization header present
- [ ] Check status code (200 = success)
- [ ] Check response JSON is valid
- [ ] Check request payload is correct

### Console Tab Checklist:

- [ ] No red errors
- [ ] API calls logging correctly
- [ ] Events being dispatched
- [ ] State updates happening
- [ ] No infinite loops

---

## 📞 **STILL NEED HELP?**

### Step 1: Gather Information
```
- What were you doing when it failed?
- What error message did you see?
- What's in the browser console?
- What's in the Network tab?
- Can you reproduce the issue?
```

### Step 2: Check Documentation
```
- /SYSTEM_FIXES_SUMMARY.md
- /API_QUICK_REFERENCE.md
- /ARCHITECTURE_DIAGRAM.md
- This file
```

### Step 3: Try These:
```
1. Hard refresh (Ctrl + Shift + R)
2. Clear browser cache
3. Logout and login again
4. Check backend is running
5. Verify environment variables
```

### Step 4: Debug Systematically:
```
1. Check console for errors
2. Check network tab for failed requests
3. Verify data in database
4. Test with small data first
5. Isolate the problem component
```

---

## ✅ **HEALTH CHECK SCRIPT**

Run this in browser console to check system health:

```javascript
const healthCheck = async () => {
  console.log('🏥 System Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━');
  
  // Check auth
  const auth = localStorage.getItem('sb-auth');
  console.log('✅ Auth:', auth ? 'Present' : '❌ Missing');
  
  // Check API
  try {
    const response = await fetch('https://{projectId}.supabase.co/functions/v1/make-server-3e7703d4/medicines', {
      headers: { 'Authorization': `Bearer ${JSON.parse(auth).access_token}` }
    });
    console.log('✅ Backend:', response.ok ? 'Working' : '❌ Failed');
    const data = await response.json();
    console.log('✅ Medicines:', data.length, 'items');
  } catch (e) {
    console.log('❌ Backend: Error', e.message);
  }
  
  // Check polling
  let pollingWorks = false;
  const checkPolling = () => { pollingWorks = true; };
  window.addEventListener('prescriptionsUpdated', checkPolling);
  setTimeout(() => {
    console.log('✅ Polling:', pollingWorks ? 'Working' : '⚠️ Not detected yet');
    window.removeEventListener('prescriptionsUpdated', checkPolling);
  }, 6000);
  
  console.log('━━━━━━━━━━━━━━━━━━━━');
};

healthCheck();
```

---

## 🎯 **PREVENTION TIPS**

### To Avoid Issues:

1. **Always validate input** before submitting
2. **Check console** regularly for warnings
3. **Test on localhost** before deploying
4. **Keep documentation** up to date
5. **Monitor performance** metrics
6. **Backup data** regularly
7. **Update dependencies** cautiously
8. **Test cross-browser** compatibility
9. **Log errors** with context
10. **Handle edge cases** properly

---

## 🔧 **MAINTENANCE CHECKLIST**

### Daily:
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify real-time updates working

### Weekly:
- [ ] Review system performance
- [ ] Check database size
- [ ] Test critical workflows
- [ ] Update documentation if needed

### Monthly:
- [ ] Security audit
- [ ] Performance optimization
- [ ] Dependency updates
- [ ] Backup verification

---

*Last Updated: October 12, 2025*  
*Version: 2.0.0*

**Remember: Most issues can be solved with a hard refresh and checking the console!** 🔧
