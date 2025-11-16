# 🚀 PharmaCare - Quick Test Guide
## Test the Entire System in 5 Minutes

---

## Default Login Credentials

```
👨‍💼 ADMIN
Email: john@pharmacare.com
Password: admin123

👨‍⚕️ PHARMACIST  
Email: sarah@pharmacare.com
Password: pharma123

💰 ACCOUNTANT
Email: mike@pharmacare.com
Password: account123
```

---

## ⚡ 1-Minute Core Workflow Test

This tests the MOST IMPORTANT feature: Prescription → Payment

### Step 1: Create Prescription (30 seconds)
1. Login as **Pharmacist** (sarah@pharmacare.com / pharma123)
2. Click **"Prescriptions & Bills"**
3. Click **"New Prescription"**
4. Select any patient (or create walk-in)
5. Add a medicine, quantity 10
6. Click **"Create Prescription"**
7. ✅ Should see: "Prescription created successfully!"

### Step 2: Process Payment (30 seconds)
1. **Logout** → Login as **Accountant** (mike@pharmacare.com / account123)
2. Click **"Payment Processing"**
3. ✅ **CRITICAL CHECK**: You should see the prescription you just created!
4. Click **"Process Payment"**
5. Select "Cash"
6. Enter amount > total
7. Click **"Complete Payment"**
8. ✅ Should see: "Payment processed successfully!"
9. Click **"Print Receipt"** to verify receipt

### ✅ If both steps work, core system is FUNCTIONAL!

---

## 🏃‍♂️ 5-Minute Full Feature Test

### Test 1: Admin Dashboard (1 minute)
1. Login as **Admin** (john@pharmacare.com / admin123)
2. ✅ Check: Dashboard shows revenue, sales, patients
3. ✅ Check: Can navigate to all 9 menu items

### Test 2: Medicine Management (1 minute)
1. Go to **"Medicine Inventory"**
2. Click **"Add Medicine"**
   - Name: Test Medicine
   - Price: 10
   - Stock: 100
3. ✅ Check: Medicine added
4. Search for it
5. ✅ Check: Search works
6. Delete it
7. ✅ Check: Medicine removed

### Test 3: User Management (1 minute)
1. Go to **"Settings"** → **"User Management"**
2. ✅ Check: All 3 default users shown
3. Click **"Add User"**
   - Name: Test Person
   - Email: test@test.com
   - Role: Pharmacist
   - Password: test123
4. ✅ Check: User created
5. Test password change: Click password icon, change password
6. ✅ Check: Password changed successfully

### Test 4: System Validator (1 minute)
1. In **Settings**, click **"System Validator"** tab
2. Click **"Run Full Validation"**
3. Wait for tests to complete (~10 seconds)
4. ✅ Check: Most tests show "PASS" (green)
5. ✅ Check: Summary shows pass count

### Test 5: Currency System (30 seconds)
1. Go to **Settings** → **"General"** tab
2. Find "Currency & Regional Settings"
3. Change from GHS to USD
4. ✅ Check: Toast notification appears
5. Go to Dashboard
6. ✅ Check: Amounts now show $ instead of ₵
7. Change back to GHS
8. ✅ Check: Back to ₵

### Test 6: Audit Logs (30 seconds)
1. Go to **Settings** → **"Audit Logs"**
2. ✅ Check: All your recent actions are logged
3. Search for "User Created"
4. ✅ Check: Search filters logs

---

## 🎯 Critical Features Checklist

Quick check that everything works:

### Authentication ✅
- [ ] Can login as Admin
- [ ] Can login as Pharmacist
- [ ] Can login as Accountant
- [ ] Can logout
- [ ] Wrong password shows error

### Role-Based Access ✅
- [ ] Admin sees 9 menu items
- [ ] Pharmacist sees 4 menu items
- [ ] Accountant sees 2 menu items

### CRUD Operations ✅
- [ ] Can CREATE medicine, patient, prescription, user
- [ ] Can READ all data in tables
- [ ] Can UPDATE medicine, patient, user password
- [ ] Can DELETE medicine, user

### Prescription Workflow ✅
- [ ] Pharmacist can create prescription
- [ ] Accountant receives it INSTANTLY
- [ ] Payment can be processed
- [ ] Receipt can be printed
- [ ] Stock is deducted

### Currency ✅
- [ ] Default is Ghanaian Cedis (₵)
- [ ] Can change to other currencies
- [ ] Change persists across navigation

### System Health ✅
- [ ] System Validator runs
- [ ] All tests pass (or minor warnings only)
- [ ] No console errors

---

## 🔍 What to Look For

### ✅ GOOD SIGNS:
- Green success messages
- Data appears immediately after creation
- Smooth navigation
- No console errors
- Fast loading (< 1 second)
- Currency symbol shows as ₵

### ❌ BAD SIGNS:
- Red error messages that shouldn't appear
- Data doesn't save
- Page crashes
- Console shows errors
- Slow loading (> 3 seconds)
- Features don't work as expected

---

## 🎊 Success Criteria

**System is WORKING if:**
1. ✅ You can complete the "1-Minute Core Workflow Test"
2. ✅ System Validator shows mostly "PASS" results
3. ✅ No critical console errors
4. ✅ All three user roles can login
5. ✅ Data persists after page refresh

**If all 5 criteria met → System is 100% OPERATIONAL!**

---

## 📱 Mobile Test (Optional - 2 minutes)

1. Resize browser to phone size (< 640px wide)
2. ✅ Check: Bottom navigation appears
3. ✅ Check: Sidebar accessible via hamburger menu
4. ✅ Check: Forms are usable
5. ✅ Check: Touch targets are large enough
6. Login and test creating a prescription
7. ✅ Check: Everything works on mobile

---

## 🐛 Quick Troubleshooting

### Problem: Can't login
**Solution**: Use exact credentials from top of this page

### Problem: Prescription doesn't appear in Payment Processing
**Solution**: 
1. Check you're in the SAME browser
2. Verify both users are logged in to same site
3. Try refreshing payment processing page

### Problem: Data disappeared
**Solution**: 
1. Logout completely
2. Clear browser cache/localStorage
3. Login again (default data will reinitialize)

### Problem: System Validator shows failures
**Solution**:
1. Read the error messages
2. Fix the specific issue mentioned
3. Run validator again

---

## 🎓 Learning the System

### For New Users:
1. Start with **Admin** account
2. Explore all menu items
3. Try the **System Validator**
4. Read the tooltips and help text
5. Test with sample data first

### For Developers:
1. Open browser console (F12)
2. Check for any errors
3. Review **SYSTEM_AUDIT_AND_FIXES.md**
4. Review **TESTING_CHECKLIST.md**
5. Run System Validator for diagnostics

---

## 📊 Performance Expectations

### Load Times (should be):
- Login: < 0.5 seconds
- Dashboard: < 1 second
- Create prescription: < 0.2 seconds
- Process payment: < 0.3 seconds
- Search: Instant (< 0.05 seconds)

### If slower:
1. Check internet connection (for external resources)
2. Clear browser cache
3. Check browser dev tools for slow requests

---

## 🎯 Next Steps After Testing

### If Everything Works:
1. ✅ Change all default passwords
2. ✅ Customize currency to your region
3. ✅ Add your real medicines to inventory
4. ✅ Add your real patients
5. ✅ Create real users for your team
6. ✅ Start using for actual operations!

### If Issues Found:
1. Document the exact error
2. Check browser console
3. Run System Validator
4. Review audit logs
5. Check TROUBLESHOOTING_GUIDE.md

---

## 📞 System Information

- **Version**: 1.0.0
- **Last Tested**: November 10, 2025
- **Status**: ✅ All Features Operational
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: ✅ Fully Responsive

---

## 🎉 Congratulations!

If you've completed this quick test successfully, you have a **fully functional pharmacy management system** ready for use!

**Total Test Time**: ~5-7 minutes
**Features Tested**: All critical features
**Confidence Level**: High

**🚀 You're ready to manage your pharmacy with PharmaCare!**

---

**Pro Tip**: Bookmark this page for quick reference during daily use.

**Security Reminder**: Change all default passwords before production use!

---

For detailed testing, see: **TESTING_CHECKLIST.md**
For system information, see: **SYSTEM_AUDIT_AND_FIXES.md**
For features list, see: **FEATURES.md**
