# 🚀 Local Development Setup Guide - PharmaCare

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** (for version control) - [Download here](https://git-scm.com/)
- **Code Editor** - We recommend [VS Code](https://code.visualstudio.com/)

### Check Your Installation
Open your terminal/command prompt and run:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## 📥 Step 1: Download the Project

### Option A: Download as ZIP (Easiest)
1. If you have the project files, extract the ZIP to a folder
2. Open terminal/command prompt
3. Navigate to the project folder:
   ```bash
   cd path/to/pharmacare-project
   ```

### Option B: Clone from GitHub (If hosted)
```bash
git clone https://github.com/yourusername/pharmacare.git
cd pharmacare
```

---

## 📦 Step 2: Install Dependencies

In the project folder, run:

```bash
npm install
```

This will install all required packages including:
- React
- Vite
- Tailwind CSS
- Supabase Client
- All UI components (shadcn/ui)
- And other dependencies

**This may take 2-5 minutes depending on your internet speed.**

---

## ⚙️ Step 3: Configure Environment Variables

### Create Environment File

1. In the project root, create a new file called `.env`
2. Add the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Backend API URL (if using custom backend)
VITE_API_URL=http://localhost:3000
```

### Get Supabase Credentials

**If you don't have Supabase set up yet, the app will work in localStorage mode!**

To get Supabase credentials:
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Project Settings > API
5. Copy the "Project URL" and "anon/public key"
6. Paste them into your `.env` file

---

## 🏃 Step 4: Run the Development Server

Start the development server:

```bash
npm run dev
```

You should see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Open your browser and go to:** `http://localhost:5173/`

---

## 🎉 Step 5: Login to the Application

The app will start in authentication mode. Use these default credentials:

### Admin Account
```
Email:    john@pharmacare.com
Password: admin123
```

### Pharmacist Account
```
Email:    sarah@pharmacare.com
Password: pharma123
```

### Accountant Account
```
Email:    mike@pharmacare.com
Password: account123
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Port 5173 Already in Use
**Solution:** Stop other applications using that port or change the port:
```bash
npm run dev -- --port 3000
```

### Issue 2: Module Not Found Errors
**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Supabase Connection Errors
**Solution:** The app works without Supabase! It uses localStorage as a fallback. Just ignore the warnings.

### Issue 4: TypeScript Errors
**Solution:** Restart your code editor or run:
```bash
npm run build
```

### Issue 5: Slow Initial Load
**Solution:** This is normal on first run. Subsequent loads will be faster.

---

## 🛠️ Development Commands

### Start Development Server
```bash
npm run dev
```
Opens at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```
Creates optimized files in `/dist` folder

### Preview Production Build
```bash
npm run preview
```
Test the production build locally

### Lint Code
```bash
npm run lint
```
Check for code quality issues

---

## 📱 Testing on Mobile Devices

### Test on Same Network
1. Make sure your phone and computer are on the same WiFi
2. Start the dev server: `npm run dev`
3. Look for the Network URL in the terminal (e.g., `http://192.168.1.5:5173/`)
4. Open that URL on your phone's browser

### Test Responsive Design in Browser
1. Open the app in Chrome
2. Press `F12` to open DevTools
3. Click the device toggle button (or press `Ctrl+Shift+M`)
4. Select different devices to test

---

## 🏗️ Project Structure

```
pharmacare/
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
├── index.html             # HTML template
│
├── components/            # React components
│   ├── AuthProvider.tsx   # Authentication logic
│   ├── DashboardOverview.tsx
│   ├── MedicineInventory.tsx
│   ├── PatientManagement.tsx
│   ├── PrescriptionManagement.tsx
│   ├── PaymentProcessing.tsx
│   └── ui/               # Reusable UI components
│
├── utils/                # Helper functions
│   ├── api.ts           # API utilities
│   ├── currencyContext.tsx
│   ├── mobileUtils.ts   # Mobile utilities
│   └── localStorageService.ts
│
├── hooks/               # Custom React hooks
│   └── useResponsive.ts
│
├── styles/              # Global styles
│   └── globals.css      # Tailwind + custom CSS
│
├── supabase/            # Backend functions
│   └── functions/server/
│
└── public/              # Static assets
```

---

## 🎨 Customization

### Change Primary Color
Edit `/styles/globals.css`:
```css
:root {
  --primary: #0066ff;  /* Change this color */
}
```

### Change App Name
Edit `/App.tsx` and search for "PharmaCare" to replace

### Add New Features
1. Create new component in `/components/`
2. Import in `App.tsx`
3. Add to navigation menu

---

## 📊 Data Storage

### Development Mode (Default)
- All data stored in browser's **localStorage**
- Data persists between sessions
- Independent per browser
- No backend required

### Production Mode (with Supabase)
- Data synced to Supabase backend
- Accessible from any device
- Real-time updates
- Automatic backups

---

## 🔍 Debugging

### Open Browser Console
- **Chrome/Edge:** Press `F12`
- **Firefox:** Press `F12`
- **Safari:** Enable Dev Tools in Settings, then `Cmd+Option+I`

### View Console Logs
The app includes detailed logging:
- 🔐 Authentication events
- 💾 Data operations
- 🔄 Sync status
- ❌ Errors with context

### Debug Authentication
Click the version number **5 times** on the login page to open the Auth Debugger

---

## 🚀 Deploying to Production

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Run `npm run build`
2. Drag `/dist` folder to [netlify.com/drop](https://app.netlify.com/drop)

### Deploy to Your Server
1. Run `npm run build`
2. Upload `/dist` folder contents to your web server
3. Point your domain to the folder

See `DEPLOYMENT.md` for detailed deployment instructions.

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Docs](https://supabase.com/docs)

### Project Guides
- `MOBILE_RESPONSIVE_GUIDE.md` - Mobile optimization
- `AUTH_DEBUG_GUIDE.md` - Authentication debugging
- `FEATURES.md` - Complete feature list
- `TROUBLESHOOTING_GUIDE.md` - Common issues

### Get Help
- Check the console for error messages
- Review the documentation files
- Use the Auth Debugger (click v1.0.0 5x on login)

---

## ✅ Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] Project files downloaded/extracted
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Application opened in browser
- [ ] Logged in successfully
- [ ] Mobile responsive view tested

---

## 🎯 Next Steps

1. **Explore the Dashboard** - View stats and analytics
2. **Add Test Data** - Create medicines, patients, prescriptions
3. **Test Workflows** - Try the pharmacist → accountant workflow
4. **Customize Settings** - Change currency, theme, etc.
5. **Test on Mobile** - Open on your phone
6. **Deploy** - When ready, deploy to production

---

## 💡 Tips for Development

### Hot Module Replacement (HMR)
Changes to your code will instantly appear in the browser without refresh!

### Component Development
Create new components in `/components/` and they'll auto-reload

### State Management
All data is managed through React state and localStorage

### Mobile Testing
Use the bottom navigation bar on mobile for quick access

### Performance
- First load may be slower
- Subsequent loads are instant with caching
- Build for production for best performance

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the console** - Press F12 and look for errors
2. **Review error messages** - They include helpful context
3. **Use the debugger** - Click v1.0.0 5x on login page
4. **Restart the server** - Stop (Ctrl+C) and run `npm run dev` again
5. **Clear cache** - In browser, press Ctrl+Shift+Delete
6. **Reinstall dependencies** - Delete `node_modules` and run `npm install`

---

## 📝 Development Notes

- The app works **offline-first** with localStorage
- All data is saved automatically
- No database required for development
- Mobile-responsive by default
- Multi-currency support built-in
- Role-based access control included

---

**Last Updated:** October 15, 2025
**Version:** 2.0.0
**Support:** Check documentation files for detailed guides

---

Happy coding! 🎉 Your PharmaCare system is ready for development.
