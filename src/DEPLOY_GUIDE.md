# 🚀 Deployment Guide

## Quick Deploy Options

### 🔥 Deploy to Vercel (Recommended - 2 minutes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pharmacare-management)

**Or manually:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Set production domain
vercel --prod
```

### 🌐 Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/pharmacare-management)

**Manual steps:**
1. Connect GitHub repo to Netlify
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. Add environment variables in Netlify dashboard

### ☁️ Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## Environment Variables for Production

Add these to your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Production Checklist

### ✅ Before Deployment
- [ ] Test all features locally
- [ ] Set up production Supabase project  
- [ ] Configure environment variables
- [ ] Set up proper RLS policies
- [ ] Test authentication flows
- [ ] Verify role permissions work

### ✅ After Deployment
- [ ] Test live site functionality
- [ ] Create admin user in production
- [ ] Set up monitoring/analytics
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL certificate
- [ ] Test mobile responsiveness

## Custom Domain Setup

### Vercel:
1. Go to your project dashboard
2. **Settings** → **Domains**
3. Add your domain
4. Configure DNS records

### Netlify:
1. **Site settings** → **Domain management**
2. Add custom domain
3. Configure DNS

## Troubleshooting

### Common Issues:

**❌ Build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**❌ Environment variables not working:**
- Ensure variables start with `VITE_` for frontend
- Restart build after adding variables
- Check variable names match exactly

**❌ Supabase connection fails:**
- Verify URL and keys are correct
- Check RLS policies allow access
- Ensure project is not paused

**❌ Authentication not working:**
- Set correct site URL in Supabase Auth settings
- Add redirect URLs for production domain
- Verify email templates work

## Performance Optimization

### Image Optimization:
```bash
# Install image optimization
npm install sharp

# Add to vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', 'lucide-react']
        }
      }
    }
  }
})
```

### Bundle Analysis:
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/
```

## Monitoring & Analytics

### Add Analytics:
```typescript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Monitoring:
```bash
# Add Sentry
npm install @sentry/react @sentry/tracing

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## Backup & Recovery

### Database Backup:
1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Enable **Point in Time Recovery**
4. Set up automated backups

### Code Backup:
```bash
# Regular git commits
git add .
git commit -m "Production update"
git push origin main

# Create release tags
git tag v1.0.0
git push origin v1.0.0
```

## Scaling Considerations

### Database:
- Monitor query performance
- Add indexes for frequently queried columns
- Consider read replicas for high traffic

### Frontend:
- Implement code splitting
- Use React.lazy for route-based splitting
- Optimize image loading with lazy loading

### Caching:
```typescript
// Add service worker for offline support
// Add to public/sw.js and register in main.tsx
```

## Support & Maintenance

### Regular Tasks:
- [ ] Monitor error logs weekly
- [ ] Update dependencies monthly
- [ ] Review user feedback
- [ ] Backup database regularly
- [ ] Check security updates

### Update Process:
```bash
# Update dependencies
npm update

# Test locally
npm run dev
npm run build

# Deploy to staging first
# Then deploy to production
vercel --prod
```

## 🎉 Your app is now live!

Visit your deployed URL and start managing your pharmacy! 🏥✨