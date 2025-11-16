# Health Haven Pharmacy - Project Structure

## 📁 Directory Organization

```
health-haven-pharmacy/
├── components/           # React components
│   ├── ui/              # shadcn/ui components (buttons, cards, etc.)
│   ├── figma/           # Figma-imported assets
│   ├── index.ts         # Component barrel exports
│   └── *.tsx            # Application components
├── utils/               # Utility functions and services
│   ├── supabase/        # Supabase configuration
│   ├── index.ts         # Utility barrel exports
│   └── *.ts             # Utility modules
├── hooks/               # Custom React hooks
├── styles/              # Global styles
│   └── globals.css      # Tailwind + custom CSS
├── supabase/            # Backend configuration
│   └── functions/       # Edge functions
│       └── server/      # Hono server implementation
├── docs/                # Documentation
├── public/              # Static assets
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── *.config.*           # Configuration files
```

## 🧩 Component Architecture

### Core Application Components
Located in `/components/`

#### Authentication & Layout
- `AuthProvider.tsx` - Authentication context and state management
- `LoginPage.tsx` - User login interface
- `SignupPage.tsx` - User registration interface

#### Main Dashboard Views
- `DashboardOverview.tsx` - Main dashboard with metrics and quick actions
- `MedicineInventory.tsx` - Medicine stock management
- `PatientManagement.tsx` - Patient records and information
- `PrescriptionManagement.tsx` - Prescription creation and billing
- `PaymentProcessing.tsx` - Payment acceptance and receipt printing
- `SalesManagement.tsx` - Sales history and analytics
- `SupplierManagement.tsx` - Supplier contacts and orders
- `ReportsAnalytics.tsx` - Business intelligence and reports
- `SettingsManagement.tsx` - System settings and configuration

#### System Components
- `NotificationSystem.tsx` - Real-time notifications
- `BackendStatusIndicator.tsx` - Backend connection status
- `SyncIndicator.tsx` - Data synchronization status
- `ThermalPrinter.tsx` - Receipt and order slip printing

#### Settings Sub-Components
- `UserManagement.tsx` - User account management (Admin only)
- `AllTransactionsOverview.tsx` - Complete transaction history (Admin only)
- `CompletionStatus.tsx` - Feature completion tracking
- `SystemHealthDashboard.tsx` - System health monitoring
- `SystemValidator.tsx` - Automated system validation

#### Debug & Development Components
**Note**: These components are for development and testing only
- `AuthDebugger.tsx` - Authentication debugging tools
- `CSSDebugger.tsx` - CSS styling debugging
- `DataFlowDebugger.tsx` - Data flow visualization
- `SystemMonitoring.tsx` - System performance monitoring
- `SystemStatus.tsx` - System status display
- `WorkflowStatus.tsx` - Workflow state tracking
- `PaymentProcessingTest.tsx` - Payment flow testing
- `PrescriptionEventTest.tsx` - Prescription event testing
- `PrescriptionFlowTest.tsx` - Prescription workflow testing
- `ProductionReadyReport.tsx` - Production readiness report
- `SimpleStorageTest.tsx` - Storage functionality testing
- `WorkflowTest.tsx` - Workflow testing suite

### UI Components
Located in `/components/ui/`

Based on shadcn/ui library with Tailwind CSS styling:
- Form elements: `button`, `input`, `select`, `textarea`, `checkbox`, `switch`, etc.
- Layout: `card`, `dialog`, `sheet`, `tabs`, `accordion`, etc.
- Navigation: `navigation-menu`, `breadcrumb`, `pagination`
- Data display: `table`, `badge`, `avatar`, `separator`
- Feedback: `alert`, `toast`, `progress`, `skeleton`
- Overlays: `popover`, `tooltip`, `hover-card`, `context-menu`
- Charts: `chart` (using recharts)

## 🛠 Utility Modules

### API & Backend Services
- `api.ts` - Frontend API client
- `backendApi.ts` - Backend API endpoints
- `localStorageService.ts` - Local storage operations
- `dashboardCache.ts` - Dashboard data caching

### Context & State Management
- `currencyContext.tsx` - Currency display context (Ghanaian Cedis)

### Logging & Analytics
- `audit.ts` - Audit logging utilities
- `exportUtils.ts` - Data export functionality

### Mobile & Responsive
- `mobileUtils.ts` - Mobile-specific utilities
- `hooks/useResponsive.ts` - Responsive design hook

### Supabase Integration
- `supabase/info.tsx` - Supabase project configuration

## 🎨 Styling System

### Global Styles
`/styles/globals.css` contains:
- Tailwind CSS imports and configuration
- CSS custom properties (colors, spacing, typography)
- Global typography defaults
- Component-specific overrides

### Design Tokens
- **Colors**: Defined using CSS variables for theme consistency
- **Typography**: Default font sizes and weights for semantic HTML
- **Spacing**: Consistent spacing scale via Tailwind
- **Shadows**: Minimal shadow system for depth
- **Borders**: Subtle borders with consistent colors

### Responsive Design
- Mobile-first approach using Tailwind breakpoints
- `sm:` (640px) - Small tablets
- `md:` (768px) - Tablets
- `lg:` (1024px) - Desktops
- `xl:` (1280px) - Large desktops

## 🔧 Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript Node configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - Dependencies and scripts
- `eslint.config.js` - ESLint rules

## 🗄 Backend Structure

### Supabase Edge Functions
Located in `/supabase/functions/server/`

#### Server Architecture
- `index.tsx` - Main server entry point
- `server.ts` - Hono server configuration
- `kv_store.tsx` - Key-value store utilities

#### Routes
- `routes/auth.routes.ts` - Authentication endpoints
- `routes/user.routes.ts` - User management
- `routes/medicine.routes.ts` - Medicine inventory
- `routes/patient.routes.ts` - Patient records
- `routes/sale.routes.ts` - Sales transactions
- `routes/supplier.routes.ts` - Supplier management
- `routes/analytics.routes.ts` - Analytics and reports

#### Controllers
- `controllers/auth.controller.ts` - Auth logic
- `controllers/user.controller.ts` - User operations
- `controllers/medicine.controller.ts` - Medicine CRUD
- `controllers/patient.controller.ts` - Patient CRUD
- `controllers/sale.controller.ts` - Sales processing
- `controllers/supplier.controller.ts` - Supplier management
- `controllers/analytics.controller.ts` - Analytics generation

#### Services
- `services/auth.service.ts` - Authentication service
- `services/data.service.ts` - Data access layer
- `services/audit.service.ts` - Audit logging

#### Middleware
- `middleware/auth.middleware.ts` - Auth verification
- `middleware/error.middleware.ts` - Error handling

#### Models
- `models/types.ts` - TypeScript type definitions

## 📦 Key Dependencies

### Core Framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **Recharts** - Chart library

### Backend & Data
- **Supabase** - Backend as a Service
- **Hono** - Edge function web server
- **LocalStorage** - Offline-first data persistence

### State & Forms
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

## 🔐 Security & Authentication

### Role-Based Access Control (RBAC)
Three user roles with distinct permissions:

1. **Admin** - Full system access
   - All dashboard views
   - User management
   - System settings
   - Transaction history
   - Reports and analytics

2. **Pharmacist** - Clinical operations
   - Dashboard overview
   - Medicine inventory
   - Patient management
   - Prescription creation
   - Walk-in customer support

3. **Accountant** - Financial operations
   - Dashboard overview
   - Payment processing
   - Receipt printing
   - Account approval workflow

### Authentication Flow
- Email/password login
- Secure session management
- Role verification on protected routes
- Audit logging for all actions

## 📊 Data Flow

### Offline-First Architecture
1. All data stored in localStorage
2. UI updates immediately
3. Backend sync when available
4. Conflict resolution on reconnect

### Workflow Integration
1. **Pharmacist** creates prescription/bill
2. System generates prescription event
3. **Accountant** receives notification
4. **Accountant** processes payment
5. Thermal receipt printed
6. Transaction logged in system

## 📝 Development Guidelines

### Component Standards
- Use TypeScript for type safety
- Follow React hooks best practices
- Implement proper error boundaries
- Use loading states for async operations
- Add proper accessibility attributes

### Styling Standards
- Use Tailwind utility classes
- Avoid inline styles unless necessary
- Maintain consistent spacing
- Follow mobile-first approach
- Use semantic HTML elements

### Code Organization
- Keep components focused and single-purpose
- Extract reusable logic into hooks
- Use barrel exports for clean imports
- Document complex logic with comments
- Follow naming conventions

## 🚀 Performance Optimization

### Implemented Optimizations
- Code splitting via React lazy loading
- Image optimization and lazy loading
- Dashboard data caching
- Debounced search inputs
- Memoized expensive calculations
- Efficient re-render prevention

### Bundle Size
- Tree-shaking enabled
- Minimal dependencies
- Dynamic imports for large components
- Optimized build output

## 🧪 Testing Strategy

### Manual Testing
- Comprehensive testing checklist
- Role-based workflow testing
- Cross-browser compatibility
- Mobile responsiveness
- Offline functionality

### Debug Tools
- Auth debugger for login issues
- CSS debugger for styling problems
- Data flow debugger for state tracking
- System validator for health checks

## 📖 Documentation

All documentation is organized in the `/docs` folder:
- Setup and deployment guides
- API reference
- Troubleshooting guides
- Development guides
- Testing procedures

See `/docs/README.md` for the complete documentation index.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready
