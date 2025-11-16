# CSS Styling Debug Guide

## Problem Summary
The application shows only HTML skeleton without CSS styling due to Tailwind v4 configuration issues.

## ✅ Fix Applied

Updated `vite.config.ts` to include PostCSS configuration:
```typescript
css: {
  postcss: './postcss.config.js',
}
```

## 🔍 How to Debug and Run Your Code

### Step 1: Clear All Caches
```bash
# Stop the dev server if running (Ctrl+C)

# Delete node_modules and lock files
rm -rf node_modules
rm package-lock.json  # or yarn.lock or pnpm-lock.yaml

# Clear Vite cache
rm -rf .vite
rm -rf dist
rm -rf node_modules/.vite

# Clear browser cache or use incognito mode
```

### Step 2: Reinstall Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Step 4: Check Browser DevTools

#### A. Check if CSS is loaded:
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to **Network** tab
3. Filter by **CSS**
4. Refresh the page
5. Look for `globals.css` or any CSS file - it should load with status 200

#### B. Check Console for errors:
1. Open **Console** tab
2. Look for any red errors
3. Common errors:
   - `Failed to resolve import "tailwindcss"`
   - PostCSS configuration errors
   - Module not found errors

#### C. Inspect Elements:
1. Right-click on any element
2. Click **Inspect**
3. Check **Styles** panel
4. You should see Tailwind classes applied (e.g., `bg-background`, `text-foreground`)

### Step 5: Verify File Structure
```bash
# Check if these files exist:
ls -la styles/globals.css
ls -la postcss.config.js
ls -la vite.config.ts
ls -la main.tsx
```

## 🔧 Common Issues and Solutions

### Issue 1: CSS Not Loading
**Symptoms:** No styling, plain HTML
**Solution:**
```bash
# Check if globals.css is imported in main.tsx
cat main.tsx | grep globals.css
# Should output: import './styles/globals.css'
```

### Issue 2: Tailwind Classes Not Applied
**Symptoms:** Some elements have no styling
**Check:**
1. Verify `@import "tailwindcss";` is the FIRST line in globals.css
2. Check postcss.config.js has both tailwindcss and autoprefixer
3. Restart dev server

### Issue 3: Module Resolution Errors
**Symptoms:** Can't resolve 'tailwindcss'
**Solution:**
```bash
# Reinstall Tailwind CSS v4
npm install -D tailwindcss@4.0.0-alpha.25
npm install -D autoprefixer
```

### Issue 4: Vite HMR Not Working
**Symptoms:** Changes don't reflect
**Solution:**
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

## 📋 Verification Checklist

- [ ] `vite.config.ts` has `css: { postcss: './postcss.config.js' }`
- [ ] `postcss.config.js` has tailwindcss and autoprefixer plugins
- [ ] `globals.css` starts with `@import "tailwindcss";`
- [ ] `main.tsx` imports `./styles/globals.css`
- [ ] No `tailwind.config.ts` or `tailwind.config.js` file exists (Tailwind v4 doesn't need it)
- [ ] Node modules installed: `ls node_modules/tailwindcss`
- [ ] Dev server running without errors
- [ ] Browser console has no errors
- [ ] Elements have Tailwind classes in DevTools

## 🐛 Advanced Debugging

### Check if PostCSS is processing CSS:
```bash
# Build the project and check output
npm run build

# Check if CSS was generated
ls -la dist/assets/*.css
```

### Inspect generated CSS:
```bash
# View the generated CSS file
cat dist/assets/*.css | head -50
# Should show Tailwind utility classes
```

### Test with minimal component:
Create a test file `/test.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/styles/globals.css">
</head>
<body class="bg-blue-500 text-white p-8">
  <h1 class="text-4xl font-bold">Test</h1>
  <p class="mt-4">If this is blue with white text, CSS is working!</p>
</body>
</html>
```

### Check Vite's CSS processing:
Add this to `vite.config.ts` temporarily for debug logging:
```typescript
export default defineConfig({
  // ... other config
  logLevel: 'info',
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true, // Enable CSS source maps
  },
})
```

## 🔍 Still Not Working?

### Check exact versions:
```bash
npm list tailwindcss
npm list autoprefixer
npm list vite
npm list @vitejs/plugin-react
```

Should be:
- tailwindcss: ~4.0.0-alpha.25
- autoprefixer: ~10.4.16
- vite: ~5.1.4
- @vitejs/plugin-react: ~4.2.1

### Check Node version:
```bash
node --version
# Should be v18 or higher
```

### Try different port:
```bash
# In vite.config.ts, change port:
server: {
  port: 3000,
  host: true
}
```

### Check file permissions:
```bash
# Ensure files are readable
chmod +r styles/globals.css
chmod +r postcss.config.js
chmod +r vite.config.ts
```

## 🎯 Quick Test Command
```bash
# One-liner to clean and restart
rm -rf node_modules .vite dist && npm install && npm run dev
```

## 📱 Browser Testing
1. Try in **Incognito/Private** mode
2. Try different browser (Chrome, Firefox, Safari)
3. Disable browser extensions
4. Check browser console for errors

## 🆘 Last Resort
If nothing works:
```bash
# Nuclear option - completely start fresh
rm -rf node_modules package-lock.json .vite dist
npm cache clean --force
npm install
npm run dev -- --force
```

## ✅ Success Indicators
When everything works:
1. Dev server starts without errors
2. Browser shows styled page
3. Elements have colors and spacing
4. Hover effects work
5. No console errors
6. Network tab shows CSS loaded with 200 status

## 🎨 Visual Verification
Your app should show:
- Light gray background (#f8fafc)
- Blue primary color (#0066ff)
- Proper spacing and borders
- Rounded corners on cards (12px)
- Inter font family

If you see this, **CSS is working correctly!** ✨
