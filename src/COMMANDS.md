# 📋 Quick Command Reference

## 🚀 Run & Debug Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Check TypeScript errors
npx tsc --noEmit
```

---

## 🔧 Fix CSS Issues

```bash
# Mac/Linux - Auto fix script
chmod +x fix-css-auto.sh
bash fix-css-auto.sh

# Windows - Auto fix script
fix-css-auto.bat

# Manual clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Clear all caches
rm -rf node_modules package-lock.json node_modules/.vite
npm cache clean --force
npm install
```

---

## 🔍 Debug Commands

```bash
# Run CSS debug script (Mac/Linux)
bash debug-css.sh

# Run CSS debug script (Windows)
debug-css.bat

# Check Tailwind installation
npm list tailwindcss

# Check all dependencies
npm list

# Check for outdated packages
npm outdated

# Check Node & npm versions
node -v && npm -v
```

---

## 📁 File Checks

```bash
# Check if globals.css has correct import
head -1 styles/globals.css
# Should output: @import "tailwindcss";

# Check if main.tsx imports CSS
grep "globals.css" main.tsx

# Check for conflicting Tailwind config
ls tailwind.config.*
# Should say: No such file or directory

# List all CSS files
find . -name "*.css" -not -path "./node_modules/*"

# Check file sizes
ls -lh styles/
ls -lh dist/assets/*.css
```

---

## 🌐 Browser Testing

```bash
# Get local IP for mobile testing
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig | findstr "IPv4"

# Then open on mobile:
# http://YOUR_IP:5173
```

---

## 🧹 Clean & Reset

```bash
# Clean everything
rm -rf node_modules package-lock.json .vite dist

# Fresh install
npm install

# Reset to working state (if using git)
git stash
git reset --hard HEAD

# See what files changed
git status
```

---

## 📦 Package Management

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Install specific version
npm install package-name@version

# Uninstall package
npm uninstall package-name

# Update all packages
npm update

# Check for security issues
npm audit
npm audit fix
```

---

## 🎨 Tailwind Specific

```bash
# Check Tailwind version
npm list tailwindcss

# Reinstall Tailwind v4
npm uninstall tailwindcss
npm install -D tailwindcss@4.0.0-alpha.25

# Generate CSS manually (with PostCSS CLI)
npm install -D postcss-cli
npx postcss styles/globals.css -o test-output.css
head -100 test-output.css
```

---

## 🔬 Testing

```bash
# Create simple test file
echo "console.log('Test works')" > test.js
node test.js

# Test if fetch works
node -e "fetch('http://localhost:5173/styles/globals.css').then(r=>r.text()).then(t=>console.log(t.length))"

# Test PostCSS
npx postcss --version

# Test Vite
npx vite --version
```

---

## 📊 Performance

```bash
# Check bundle size
npm run build
ls -lh dist/assets/

# Analyze what's slow
npm run dev -- --debug

# Build with sourcemaps
npm run build -- --sourcemap
```

---

## 🐛 Advanced Debugging

```bash
# Run with verbose logging
DEBUG=* npm run dev

# Check for port conflicts
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows

# Kill process on port 5173
# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
# Note the PID, then:
taskkill /PID <PID> /F

# Check environment variables
env | grep npm
env | grep NODE

# Test with different port
npm run dev -- --port 3000
```

---

## 🔄 Git Commands (if using version control)

```bash
# Save current work
git add .
git commit -m "Before CSS fix"

# Create backup branch
git branch backup-$(date +%Y%m%d)

# Reset to previous commit
git log --oneline  # Find commit hash
git reset --hard <commit-hash>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See what changed
git diff
git diff --cached
git status
```

---

## 📝 Quick File Operations

```bash
# Backup important files
cp -r components components_backup
cp -r styles styles_backup
cp package.json package.json.backup

# Restore backup
cp package.json.backup package.json

# Compare files
diff styles/globals.css styles_backup/globals.css

# Find text in files
grep -r "search-term" components/
grep -r "import.*css" .
```

---

## 💾 Export/Backup

```bash
# Create project backup (excluding node_modules)
tar -czf pharmacy-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.vite' \
  --exclude='dist' \
  .

# List files in backup
tar -tzf pharmacy-backup-*.tar.gz | head -20

# Restore from backup
tar -xzf pharmacy-backup-*.tar.gz
```

---

## 🚨 Emergency Commands

```bash
# Force quit everything
pkill -9 node  # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Check disk space
df -h  # Mac/Linux
dir  # Windows

# Check system resources
top  # Mac/Linux
tasklist  # Windows

# Restart terminal (if commands not working)
exec $SHELL  # Mac/Linux
# Or just close and reopen terminal
```

---

## ✅ Verification Commands

```bash
# Verify everything is correct
echo "=== Node Version ===" && node -v
echo "=== NPM Version ===" && npm -v  
echo "=== Tailwind ===" && npm list tailwindcss
echo "=== Globals.css First Line ===" && head -1 styles/globals.css
echo "=== Main.tsx CSS Import ===" && grep globals.css main.tsx
echo "=== No Config File ===" && ls tailwind.config.* 2>&1
echo "=== Vite Config ===" && ls -la vite.config.ts
echo "=== PostCSS Config ===" && ls -la postcss.config.js
```

---

## 🎯 One-Liner Fixes

```bash
# Complete reset and restart
rm -rf node_modules package-lock.json && npm cache clean --force && npm install && npm run dev

# Quick cache clear and restart  
rm -rf node_modules/.vite && npm run dev

# Force clean reinstall
rm -rf node_modules package-lock.json node_modules/.vite && npm install

# Check everything at once
node -v && npm -v && npm list tailwindcss && head -1 styles/globals.css
```

---

## 💡 Useful Aliases (add to ~/.bashrc or ~/.zshrc)

```bash
# Add these to your shell config for quick access
alias nrd="npm run dev"
alias nrb="npm run build"
alias nrp="npm run preview"
alias nci="rm -rf node_modules package-lock.json && npm cache clean --force && npm install"
alias ncv="rm -rf node_modules/.vite"
alias nrs="pkill -9 node && npm run dev"
```

After adding, run: `source ~/.bashrc` or `source ~/.zshrc`

Then you can use:
- `nrd` instead of `npm run dev`
- `nci` for clean install
- `ncv` to clear vite cache
- etc.

---

## 🎓 Learning Commands

```bash
# See all npm scripts available
npm run

# See package.json scripts
cat package.json | grep -A 20 '"scripts"'

# See what a command does
npm run dev --help

# See Vite config
cat vite.config.ts

# See PostCSS config
cat postcss.config.js

# See all Tailwind colors
grep "color-" styles/globals.css
```

---

## 📱 Mobile/Tablet Testing

```bash
# Start with network access
npm run dev -- --host

# Get all network interfaces
ip addr show  # Linux
ifconfig  # Mac
ipconfig  # Windows

# Test on local network
# Phone browser: http://192.168.x.x:5173
# Replace x.x with your local IP
```

---

**Save this file for quick reference!**

**Most used commands:**
1. `npm run dev` - Start server
2. `bash fix-css-auto.sh` - Fix CSS
3. `rm -rf node_modules/.vite && npm run dev` - Clear cache
4. `F12` in browser - Open DevTools
5. `Ctrl+C` in terminal - Stop server
