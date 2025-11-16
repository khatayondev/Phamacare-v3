# 🚀 PharmaCare Deployment Guide

Complete guide for deploying PharmaCare Pharmacy Management System to production.

## 📋 Pre-Deployment Checklist

### ✅ System Requirements
- [ ] Node.js 18+ installed
- [ ] Git repository set up
- [ ] Domain name configured (optional)
- [ ] SSL certificate ready (for custom domains)
- [ ] Backup strategy planned

### ✅ Environment Preparation
- [ ] Production environment variables configured
- [ ] Database setup completed (if using Supabase)
- [ ] Print server configuration (for thermal printing)
- [ ] User access controls reviewed
- [ ] Security settings verified

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Quick Start)

#### Advantages
- Zero-configuration deployment
- Automatic HTTPS
- Global CDN
- Serverless functions support
- Free tier available

#### Steps
1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Configure environment variables (if using Supabase):
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```
   - Deploy

3. **Post-Deployment**
   - Test all functionality
   - Configure custom domain (optional)
   - Set up monitoring alerts

### Option 2: Netlify (Great for Static Hosting)

#### Advantages
- Excellent static site hosting
- Form handling capabilities
- Edge functions support
- Built-in CI/CD

#### Steps
1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Deploy to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Configure build settings
   - Add environment variables
   - Deploy

3. **Advanced Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Option 3: AWS S3 + CloudFront (Enterprise)

#### Advantages
- High scalability
- Global distribution
- Cost-effective for high traffic
- Integration with AWS services

#### Steps
1. **Build the Application**
   ```bash
   npm run build
   ```

2. **S3 Setup**
   - Create S3 bucket
   - Enable static website hosting
   - Upload `dist` folder contents
   - Configure bucket policy

3. **CloudFront Configuration**
   - Create CloudFront distribution
   - Configure SSL certificate
   - Set up custom domain
   - Configure caching rules

### Option 4: Self-Hosted (Full Control)

#### Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- Nginx or Apache web server
- SSL certificate (Let's Encrypt recommended)
- 2GB+ RAM, 20GB+ storage

#### Steps
1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install Git
   sudo apt install git -y
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/pharmacare-management.git
   cd pharmacare-management
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Copy to web directory
   sudo cp -r dist/* /var/www/html/
   ```

3. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/pharmacare
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
   }
   ```

4. **SSL Setup**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

## 🔧 Environment Configuration

### Environment Variables
```env
# Production Environment Variables
NODE_ENV=production

# Supabase Configuration (Optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Settings
VITE_APP_NAME=PharmaCare
VITE_APP_VERSION=1.0.0
VITE_CURRENCY=GHS
VITE_CURRENCY_SYMBOL=₵

# Print Server (Optional)
VITE_PRINT_SERVER_URL=http://localhost:3001
```

### Build Configuration
```json
// vite.config.ts
export default defineConfig({
  base: '/', // Change if deploying to subdirectory
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to true for debugging
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
})
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images (if any)
npm install -D imagemin imagemin-webp
```

### Runtime Optimization
1. **Code Splitting**: Implement lazy loading for routes
2. **Caching**: Configure appropriate cache headers
3. **Compression**: Enable gzip/brotli compression
4. **CDN**: Use CDN for static assets
5. **Service Worker**: Implement for offline functionality

### Nginx Performance Configuration
```nginx
# Enable compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 Security Configuration

### Security Headers
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### HTTPS Configuration
```nginx
# SSL configuration
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

## 📱 Mobile Deployment Considerations

### PWA Configuration
1. **Service Worker**: Enable for offline functionality
2. **App Manifest**: Configure for mobile app experience
3. **Touch Icons**: Add appropriate app icons
4. **Viewport Settings**: Ensure proper mobile scaling

### Mobile-Specific Features
- Offline data synchronization
- Touch-optimized interface
- Mobile printing integration
- Camera access for barcode scanning

## 🖨️ Print Server Setup (Optional)

For thermal receipt printing, you may need a local print server:

### Print Server Requirements
- Local network access
- Thermal printer drivers
- Print server software (Node.js based)

### Setup Steps
1. Install print server on local machine
2. Configure printer drivers
3. Set up network access
4. Configure application to use print server

## 📊 Monitoring & Analytics

### Application Monitoring
```javascript
// Add error tracking
window.addEventListener('error', (e) => {
  // Send error to monitoring service
  console.error('Application error:', e);
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    // Log performance metrics
  });
}
```

### Health Checks
```nginx
# Health check endpoint
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

## 🔄 Backup & Recovery

### Data Backup Strategy
1. **Local Storage Export**: Regular data exports
2. **Database Backups**: If using Supabase
3. **Configuration Backups**: Environment and config files
4. **Code Backups**: Regular Git commits

### Recovery Procedures
1. **Data Recovery**: Restore from backups
2. **System Recovery**: Redeploy from Git
3. **Configuration Recovery**: Restore environment variables
4. **Testing**: Verify all functionality after recovery

## 🚀 Continuous Deployment

### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 📞 Support & Maintenance

### Post-Deployment Checklist
- [ ] All features tested and working
- [ ] User accounts created and tested
- [ ] Print functionality verified
- [ ] Mobile responsiveness confirmed
- [ ] Security scan completed
- [ ] Performance optimization verified
- [ ] Backup procedures tested
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] User training completed

### Maintenance Schedule
- **Daily**: Monitor system health and performance
- **Weekly**: Review error logs and user feedback
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization and feature updates

---

Your PharmaCare system is now ready for production deployment! 🎉