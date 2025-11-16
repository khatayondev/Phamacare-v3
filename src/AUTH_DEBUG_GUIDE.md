# Authentication Debug Guide

## How to Debug Login Issues

### Step 1: Access the Debug Panel

1. Go to the **Login Page**
2. Click the version number **"v1.0.0"** at the bottom **5 times quickly**
3. The Authentication Debugger will open

### Step 2: View All Users

The debugger shows all users in the system with:
- **Email address**
- **Role** (Admin, Pharmacist, Accountant)
- **Status** (approved, pending, rejected)
- **Password** (click "Show Passwords" to reveal)

### Step 3: Test Login Credentials

1. Enter an email and password in the "Test Login Credentials" section
2. Click **"Test Login"**
3. The system will tell you:
   - ✅ If login would succeed
   - ❌ If email is correct but password is wrong
   - ❌ If email doesn't exist

### Step 4: Fix User Password

If a user can't login:
1. Find the user in the list
2. Click **"Fix Password"** button
3. Enter a new password (minimum 6 characters)
4. The password will be updated immediately
5. User can now login with the new password

### Step 5: Check Console Logs

For detailed debugging:
1. Open Browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in - you'll see detailed logs:
   - 🔐 Login attempt with email
   - 🔑 Password length
   - 👥 All available users
   - ✅ Success or ❌ Failure details

### Quick Actions

- **Copy Users JSON**: Copy all user data to clipboard
- **Copy All Logins**: Get a list of all email/password combinations

## Default Test Accounts

```
Admin:
  Email: john@pharmacare.com
  Password: admin123

Pharmacist:
  Email: sarah@pharmacare.com
  Password: pharma123

Accountant:
  Email: mike@pharmacare.com
  Password: account123
```

## Common Issues & Solutions

### Issue 1: "Invalid email or password"
**Solution**: Use the debugger to check:
1. Email is exactly as stored (check for typos, spaces)
2. Password matches exactly (case-sensitive)
3. User status is "approved" (pending/rejected users can't login)

### Issue 2: New user can't login after signup
**Solution**: 
1. Check browser console for signup logs
2. Verify user was created (check debugger)
3. Ensure password was saved correctly
4. For Accountants, verify status is "approved"

### Issue 3: Password change not working
**Solution**:
1. Check console logs when changing password
2. Verify password was saved (use debugger)
3. Ensure you're using the NEW password to login
4. Check password length is at least 6 characters

## Console Log Examples

### Successful Login:
```
🔐 Login attempt with email: john@pharmacare.com
🔑 Password length: 8
👥 Available users: [...]
✅ User found: john@pharmacare.com Role: Admin
✅ Login successful!
```

### Failed Login:
```
🔐 Login attempt with email: test@test.com
🔑 Password length: 8
👥 Available users: [...]
❌ Login failed: Invalid email or password
📧 Attempted email: test@test.com
```

## Tips

1. **Emails are case-insensitive**: "John@Test.com" = "john@test.com"
2. **Passwords are case-sensitive**: "Password123" ≠ "password123"
3. **Whitespace matters**: " password" ≠ "password"
4. **Use the Test Login feature** before trying actual login
5. **Check the Console** - it shows exactly what's happening

## Need More Help?

1. Open browser console (F12)
2. Double-click the version number on login page
3. This will print all users to console
4. Screenshot the console output for debugging
