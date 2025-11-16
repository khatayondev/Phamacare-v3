# ⚡ Quick Start - PharmaCare (5 Minutes)

## TL;DR - Get Running Fast

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm run dev

# 3. Open browser
# Go to: http://localhost:5173

# 4. Login
# Email: john@pharmacare.com
# Password: admin123
```

---

## 📋 Prerequisites
- Node.js 18+ installed ([Download](https://nodejs.org/))
- Terminal/Command Prompt

---

## 🚀 Three Commands to Run

### 1️⃣ Install
```bash
npm install
```
*Takes 2-3 minutes*

### 2️⃣ Run
```bash
npm run dev
```
*Opens at http://localhost:5173*

### 3️⃣ Login
```
Admin:      john@pharmacare.com / admin123
Pharmacist: sarah@pharmacare.com / pharma123
Accountant: mike@pharmacare.com / account123
```

---

## ✅ That's It!

You're now running PharmaCare locally. The app uses localStorage - no backend setup needed!

### What You Can Do Now:
- ✅ View the dashboard
- ✅ Add medicines to inventory
- ✅ Create prescriptions
- ✅ Process payments
- ✅ Generate reports
- ✅ Test on mobile (open the network URL on your phone)

---

## 🔧 Useful Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📱 Test on Mobile

1. Start the app: `npm run dev`
2. Look for the **Network URL** in terminal (e.g., `http://192.168.1.5:5173`)
3. Open that URL on your phone

---

## 🐛 Quick Fixes

**Port already in use?**
```bash
npm run dev -- --port 3000
```

**Errors after installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Need to reset data?**
- Open browser console (F12)
- Run: `localStorage.clear()`
- Refresh page

---

## 📚 More Help?

- Full Setup Guide: `LOCAL_SETUP_GUIDE.md`
- Mobile Guide: `MOBILE_RESPONSIVE_GUIDE.md`
- Features List: `FEATURES.md`
- Troubleshooting: `TROUBLESHOOTING_GUIDE.md`

---

**Ready to customize?** Check the full documentation!
