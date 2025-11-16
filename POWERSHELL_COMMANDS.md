# Quick PowerShell Commands for Future Reference

## Full Fix (Run These In Order)

### 1. Install Dependencies
```powershell
cd "C:\Users\Khat Ayon\Downloads\Pharmacy Management V3.0"
npm install -D postcss autoprefixer tailwindcss @tailwindcss/postcss
```

### 2. Start Development Server
```powershell
npm run dev
```
Browser will open at http://localhost:3000

### 3. Build for Production
```powershell
npm run build
```
Output: `./build/` directory

## If You Get Errors

### Port Already in Use
```powershell
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Try again
npm run dev
```

### Styles Still Not Showing
```powershell
# Deep clean
Remove-Item -Recurse node_modules -Force
Remove-Item package-lock.json -Force
npm install

# Restart
npm run dev
```

### Check Versions
```powershell
node -v          # Should be ≥20.16.0
npm -v           # Should be ≥10.8.1
npm list tailwindcss  # Show installed Tailwind version
```

## What Was Fixed

✅ **Removed Invalid Package**: `pharmacare-management` was not in npm registry
✅ **Added PostCSS Support**: Installed `postcss`, `autoprefixer`, `@tailwindcss/postcss`
✅ **Created tailwind.config.js**: Required for Tailwind v4
✅ **Created postcss.config.js**: Configured PostCSS plugins correctly
✅ **Fixed Syntax**: Changed from ES6 export to CommonJS (module.exports)

## File Structure After Fix
```
Project Root/
├── package.json (fixed - removed pharmacare-management)
├── postcss.config.js (NEW - CommonJS syntax)
├── tailwind.config.js (NEW - Tailwind v4 config)
├── vite.config.ts (no changes needed)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css (already correct - Tailwind v4)
│   └── styles/
│       └── globals.css (custom styles + CSS variables)
└── node_modules/ (updated with new packages)
```

## Environment
- **OS**: Windows 11
- **Node**: v20.16.0
- **npm**: 10.8.1
- **Project**: Pharmacy Management Dashboard v3.0
- **Build Tool**: Vite 6.3.5
- **UI Framework**: React 18.3.1 + TypeScript
- **CSS**: Tailwind v4 + PostCSS

## Useful Resources
- Tailwind v4 Migration: https://tailwindcss.com/docs/upgrade-guide
- Vite Docs: https://vitejs.dev/
- PostCSS Config: https://postcss.org/
