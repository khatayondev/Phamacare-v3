# ⚡ Quick CSS Fix Reference

## 🚨 CSS Not Working? Try These in Order:

### 1️⃣ FIRST - Run Auto-Fix Script (1 minute)

**Mac/Linux:**
```bash
chmod +x fix-css-auto.sh
bash fix-css-auto.sh
npm run dev
```

**Windows:**
```bash
fix-css-auto.bat
```

**What it does:** Cleans everything and reinstalls properly

---

### 2️⃣ If Still Broken - Browser Check (30 seconds)

1. Open http://localhost:5173
2. Press **F12** (DevTools)
3. Go to **Console** tab
4. Look for red errors ❌

**Common errors you might see:**

| Error Message | Solution |
|--------------|----------|
| `Failed to fetch` | Vite server not running → `npm run dev` |
| `Cannot find module` | Missing dependency → `npm install` |
| `Unexpected token` | Syntax error in code → Check error location |
| `Failed to load resource: globals.css` | CSS path wrong → Check import |

5. Go to **Network** tab
6. Filter by "CSS"
7. Look for `globals.css`

**Should see:**
- ✅ Status: 200 (green)
- ✅ Size: ~100KB or more
- ✅ Type: text/css

**If you see:**
- ❌ Status: 404 → File not found
- ❌ Size: 1KB or less → Tailwind not processing
- ❌ File not listed → Not imported

---

### 3️⃣ If DevTools Shows No Errors - Test File (2 minutes)

**Move test file to public folder:**
```bash
# Mac/Linux
cp css-test.html public/

# Windows
copy css-test.html public\
```

**Open in browser:**
```
http://localhost:5173/css-test.html
```

**Check results:**
- ✅ All boxes colored → CSS works, React issue
- ❌ Boxes not colored → Tailwind issue

---

### 4️⃣ Nuclear Option - Fresh Start (5 minutes)

```bash
# Stop server
Ctrl+C

# Delete everything
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall
npm install

# Start again
npm run dev
```

---

## 🔍 Quick Diagnostic Commands

```bash
# Check if Tailwind installed
npm list tailwindcss

# Check Node version (need 16+)
node -v

# Check for TypeScript errors
npx tsc --noEmit

# Check if globals.css has correct import
head -1 styles/globals.css
# Should output: @import "tailwindcss";

# Check if main.tsx imports CSS
grep "globals.css" main.tsx
# Should find the import line

# Check for conflicting config
ls tailwind.config.*
# Should say: No such file or directory
```

---

## 📊 Troubleshooting Decision Tree

```
CSS Not Working?
    │
    ├─→ Browser Console has RED errors?
    │    ├─→ YES: Fix the error shown
    │    └─→ NO: Continue ↓
    │
    ├─→ Network tab shows globals.css?
    │    ├─→ NO: Import missing, check main.tsx
    │    ├─→ YES, but tiny (<10KB): Tailwind not processing
    │    └─→ YES, large (>50KB): Continue ↓
    │
    ├─→ css-test.html shows styling?
    │    ├─→ YES: React/component issue
    │    └─→ NO: Build/config issue
    │
    └─→ Still broken: Read COMPLETE_DEBUG_WORKFLOW.md
```

---

## 🎯 Most Common Issues & Fixes

### Issue: Only HTML skeleton, no colors

**Cause:** CSS not loading

**Fix:**
```bash
# Check import in main.tsx
grep globals.css main.tsx

# If missing, add to main.tsx:
import './styles/globals.css'
```

---

### Issue: Some Tailwind classes work, custom ones don't

**Cause:** Theme not configured

**Fix:** Check `@theme inline` section in globals.css

---

### Issue: Works locally but not after build

**Cause:** Build optimization issue

**Fix:**
```bash
# Clean build
rm -rf dist

# Rebuild
npm run build

# Test production
npm run preview
```

---

### Issue: Worked yesterday, broken today

**Cause:** Dependency update or cache

**Fix:**
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 🚀 Performance Checks

```bash
# Check dev server startup time
time npm run dev
# Should start in < 10 seconds

# Check build size
npm run build
ls -lh dist/assets/*.css
# Should be 100-200KB

# Check for warnings
npm run build 2>&1 | grep -i warn
```

---

## 📱 Test on Different Browsers

Sometimes it's browser-specific:

1. ✅ Chrome/Edge - Best for debugging
2. ✅ Firefox - Good alternative
3. ✅ Safari - Test for Mac users
4. ⚠️ Mobile - Test responsive design

**How to test:**
1. Start dev server: `npm run dev`
2. Get your local IP: `ipconfig` (Windows) or `ifconfig` (Mac)
3. Open on phone: `http://YOUR_IP:5173`

---

## 🔧 Environment Check

```bash
# Check everything at once
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "Tailwind: $(npm list tailwindcss | grep tailwindcss)"
echo "Vite: $(npm list vite | grep vite)"
echo "React: $(npm list react | grep react)"
```

**Should see:**
- Node: v18+ or v20+
- NPM: v8+ or v9+
- Tailwind: 4.0.0-alpha
- Vite: 5.x
- React: 18.x

---

## 💾 Files to Check

```bash
# These must exist and be correct:
ls -la styles/globals.css      # Should exist
ls -la main.tsx                 # Should exist
ls -la postcss.config.js        # Should exist
ls -la vite.config.ts           # Should exist
ls -la tailwind.config.*        # Should NOT exist
```

---

## 🆘 When to Ask for Help

If you've tried:
- ✅ Auto-fix script
- ✅ Browser DevTools check
- ✅ Clean reinstall
- ✅ Test HTML file
- ✅ Different browser

And it's STILL not working, provide:

1. Output of: `npm run dev`
2. Screenshot of browser Console
3. Screenshot of browser Network tab
4. Output of: `npm list tailwindcss`
5. First 20 lines of globals.css: `head -20 styles/globals.css`

---

## ✅ Success Checklist

- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:5173
- [ ] No red errors in Console
- [ ] globals.css shows in Network tab
- [ ] Page has background color #f8fafc (light gray)
- [ ] Buttons are styled with blue color
- [ ] Cards have rounded corners and subtle borders
- [ ] Text is in Inter font

---

## 🎓 Understanding the Stack

```
Your App Flow:
┌─────────────────────────────────────┐
│  1. Vite Dev Server Starts          │
│     - Loads vite.config.ts          │
│     - Reads postcss.config.js       │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  2. index.html Loads                │
│     - Points to main.tsx            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  3. main.tsx Executes               │
│     - Imports globals.css           │
│     - Imports App.tsx               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  4. PostCSS Processes globals.css   │
│     - Sees @import "tailwindcss"    │
│     - Generates Tailwind utilities  │
│     - Processes custom CSS          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  5. Browser Receives Final CSS      │
│     - All Tailwind classes          │
│     - Custom theme variables        │
│     - Component styles              │
└─────────────────────────────────────┘
```

**If it breaks at:**
- Step 1: Vite config issue → Check vite.config.ts
- Step 2: HTML issue → Check index.html
- Step 3: Import issue → Check main.tsx
- Step 4: Tailwind issue → Check globals.css and postcss
- Step 5: Browser issue → Clear cache, try different browser

---

**Remember:** 90% of CSS issues are fixed by deleting `node_modules` and running `npm install` again!
