# PharmaCare Management System - Backend API

## Overview

This is the backend API server for the PharmaCare Management System, built with modern best practices for scalability, maintainability, and security. The system follows a three-tier architecture with comprehensive role-based access control, audit logging, and enterprise-grade error handling.

## Architecture

```
Frontend (React/TypeScript) 
    ↓
API Server (Hono/TypeScript)
    ↓
Database (Supabase KV Store)
```

## Directory Structure

```
/supabase/functions/server/
├── index.tsx                 # Server entry point
├── server.ts                 # Main application setup
├── kv_store.tsx             # Database abstraction layer
├── README.md                # This documentation
│
├── controllers/             # Request handlers
│   ├── analytics.controller.ts
│   ├── auth.controller.ts
│   ├── medicine.controller.ts
│   ├── patient.controller.ts
│   ├── sale.controller.ts
│   ├── supplier.controller.ts
│   └── user.controller.ts
│
├── middleware/              # Request middleware
│   ├── auth.middleware.ts   # Authentication & authorization
│   └── error.middleware.ts  # Error handling & logging
│
├── models/                  # Data models & types
│   └── types.ts            # TypeScript interfaces
│
├── routes/                  # API route definitions
│   ├── analytics.routes.ts
│   ├── auth.routes.ts
│   ├── medicine.routes.ts
│   ├── patient.routes.ts
│   ├── sale.routes.ts
│   ├── supplier.routes.ts
│   └── user.routes.ts
│
└── services/               # Business logic
    ├── audit.service.ts    # Audit logging & compliance
    ├── auth.service.ts     # Authentication services
    └── data.service.ts     # Data management services
```

## Key Features

### 🔐 Authentication & Authorization
- **Supabase Auth Integration**: Secure user authentication with JWT tokens
- **Role-Based Access Control (RBAC)**: Admin, Pharmacist, and Accountant roles
- **Token Verification**: Automatic token validation for protected routes
- **Session Management**: Secure session handling with automatic expiration

### 📊 Audit & Compliance
- **Comprehensive Audit Logging**: All user actions are logged for compliance
- **Activity Tracking**: Real-time activity monitoring and reporting
- **Change Tracking**: Detailed before/after change logs for critical operations
- **Compliance Reporting**: Generate audit reports for regulatory requirements

### 🛡️ Security
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: User-friendly error messages without exposing internals
- **Rate Limiting**: Protection against abuse and DoS attacks
- **CORS Configuration**: Proper cross-origin resource sharing setup

### 📈 Monitoring & Health Checks
- **Health Endpoints**: System health and status monitoring
- **Performance Metrics**: Request timing and performance tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Graceful Shutdown**: Proper cleanup on system shutdown

## API Endpoints

### Authentication
```
POST /auth/signup           # Create new user account
POST /auth/signin           # User authentication
POST /auth/signout          # User logout
GET  /auth/me              # Get current user info
```

### Core Data Management
```
GET    /medicines          # List all medicines
POST   /medicines          # Create new medicine
PUT    /medicines/:id      # Update medicine
DELETE /medicines/:id      # Delete medicine

GET    /patients           # List all patients
POST   /patients           # Create new patient
PUT    /patients/:id       # Update patient

GET    /sales              # List all sales
POST   /sales              # Create new sale

GET    /suppliers          # List all suppliers
POST   /suppliers          # Create new supplier
```

### User Management (Admin Only)
```
GET    /users              # List all users
POST   /users              # Create new user
PUT    /users/:id/status   # Approve/reject user
DELETE /users/:id          # Remove user
```

### Analytics & Reporting
```
GET /analytics/dashboard    # Dashboard metrics
GET /analytics/audit        # Audit trail data
GET /analytics/reports      # Generate reports
```

### System Monitoring
```
GET /health                # Basic health check
GET /status                # Detailed system status
```

## Role-Based Access Control

### Admin Role
- **Full System Access**: Complete control over all system functions
- **User Management**: Create, approve, suspend, and delete users
- **System Configuration**: Modify system settings and configurations
- **Analytics & Reports**: Access to all analytics and reporting features
- **Audit Access**: View all audit logs and compliance reports

### Pharmacist Role
- **Clinical Operations**: Manage patients, prescriptions, and medical records
- **Inventory Management**: Add, update, and monitor medicine inventory
- **Prescription Management**: Create and manage patient prescriptions
- **Patient Care**: Access to patient information and medical history

### Accountant Role
- **Financial Operations**: Process payments and manage billing
- **Receipt Printing**: Generate and print thermal receipts
- **Payment Processing**: Handle payment transactions and refunds
- **Financial Reporting**: Access to sales and financial reports

## Data Models

### Core Entities
- **Medicine**: Inventory items with stock tracking and expiration management
- **Patient**: Customer records with medical history and contact information
- **Prescription**: Medical prescriptions with dosage and instructions
- **Sale**: Transaction records with payment and item details
- **Supplier**: Vendor information and contact details
- **User**: System users with roles and permissions

### Audit & Compliance
- **AuditLog**: Detailed change tracking for compliance
- **ActivityLog**: User activity monitoring and reporting
- **SystemHealth**: System status and performance metrics

## Security Considerations

### Data Protection
- **Encryption**: All sensitive data is encrypted at rest and in transit
- **Access Control**: Strict role-based access to sensitive information
- **Data Validation**: Comprehensive input validation and sanitization
- **Audit Trails**: Complete audit trails for all data modifications

### Authentication Security
- **Token-Based Auth**: Secure JWT token authentication
- **Session Management**: Automatic session expiration and renewal
- **Password Security**: Strong password requirements and hashing
- **Account Lockout**: Protection against brute force attacks

### API Security
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Strict validation of all API inputs
- **Error Handling**: Secure error messages without information leakage
- **CORS Policy**: Proper cross-origin request handling

## Environment Variables

```bash
SUPABASE_URL              # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY # Supabase service role key
SUPABASE_ANON_KEY        # Supabase anonymous key
NODE_ENV                 # Environment (development/production)
```

## Development Guidelines

### Code Organization
- **Separation of Concerns**: Clear separation between controllers, services, and models
- **Type Safety**: Comprehensive TypeScript typing throughout
- **Error Handling**: Consistent error handling patterns
- **Logging**: Structured logging for debugging and monitoring

### Testing
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database interactions
- **Security Tests**: Validate authentication and authorization
- **Performance Tests**: Ensure optimal response times

### Best Practices
- **Clean Code**: Follow established TypeScript and Node.js best practices
- **Documentation**: Comprehensive inline documentation and comments
- **Version Control**: Proper git workflow with meaningful commit messages
- **Code Reviews**: All changes require peer review before deployment

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup procedures in place
- [ ] Security audit completed

### Scaling Considerations
- **Database**: Consider read replicas for high-read workloads
- **Caching**: Implement Redis for frequently accessed data
- **Load Balancing**: Use load balancers for high availability
- **CDN**: Static assets served through CDN for performance

## Monitoring & Maintenance

### Health Monitoring
- **Uptime Monitoring**: Continuous health check monitoring
- **Performance Metrics**: Response time and throughput tracking
- **Error Tracking**: Real-time error alerting and reporting
- **Resource Usage**: CPU, memory, and disk usage monitoring

### Maintenance Tasks
- **Audit Log Cleanup**: Regular cleanup of old audit logs
- **Database Optimization**: Regular database maintenance and optimization
- **Security Updates**: Keep all dependencies updated
- **Backup Verification**: Regular backup testing and verification

## Support & Troubleshooting

### Common Issues
1. **Authentication Failures**: Check token expiration and user status
2. **Permission Errors**: Verify user roles and permissions
3. **Database Errors**: Check connection and data integrity
4. **Performance Issues**: Monitor response times and resource usage

### Logging Levels
- **ERROR**: Critical errors requiring immediate attention
- **WARN**: Important warnings that should be investigated
- **INFO**: General information about system operation
- **DEBUG**: Detailed debugging information (development only)

### Contact Information
For technical support and questions about this system, please contact the development team or system administrators.

---

**PharmaCare Management System v2.0.0**  
Built with ❤️ for healthcare professionals