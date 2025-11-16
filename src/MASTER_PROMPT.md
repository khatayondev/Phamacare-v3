# 🏥 Pharmacy Management System - Master Prompt

## System Overview
Build a complete **Pharmacy Management System** with role-based access control, walk-in customer sales workflow, and automated stock management using React, TypeScript, Tailwind CSS, and Supabase backend.

## 🎯 Core Requirements

### 1. **User Roles & Permissions**

#### **👨‍💼 Admin**
- **Full system access** - can do everything
- **Drug Management**: Add new drugs, update details, restock inventory
- **User Management**: Create/manage pharmacist and accountant accounts
- **Reports & Analytics**: View all sales, revenue, stock reports
- **System Settings**: Configure pharmacy details, backup data

#### **👩‍⚕️ Pharmacist**
- **Walk-in Sales Only**: Sell drugs to customers who walk into the pharmacy
- **Drug Selection**: Search/dropdown to select drugs and quantities
- **Order Generation**: System auto-generates unique **Order Numbers** (format: ORD-YYYYMMDD-XXXX)
- **Sales Slip Printing**: Print sales details with drugs list, quantities, order number, total price
- **Stock Visibility**: View current drug stock levels (read-only)

#### **👨‍💰 Accountant**
- **Payment Confirmation**: Verify and confirm payments for pharmacist-generated orders
- **Receipt Printing**: Print official receipts after payment confirmation
- **Transaction Reports**: View sales history and transaction details
- **Payment Methods**: Handle cash, card, mobile payments

### 2. **System Workflow**

```
🚶‍♂️ Customer walks in 
    ↓
👩‍⚕️ Pharmacist selects drugs & quantities
    ↓
🔢 System generates Order Number
    ↓
🖨️ Pharmacist prints Sales Slip
    ↓
🚶‍♂️ Customer takes slip to Accountant
    ↓
👨‍💰 Accountant verifies payment
    ↓
✅ Payment confirmed in system
    ↓
🖨️ Accountant prints Official Receipt
    ↓
📦 Stock automatically updated
```

### 3. **Database Schema**

#### **Drugs Table**
```typescript
interface Drug {
  id: string;
  name: string;
  category: 'Tablet' | 'Syrup' | 'Injection' | 'Capsule' | 'Cream' | 'Drops';
  price: number;
  stock: number;
  minStock: number;
  expiryDate: string;
  manufacturer: string;
  batchNumber: string;
  description?: string;
}
```

#### **Orders Table**
```typescript
interface Order {
  id: string;
  orderNumber: string; // ORD-YYYYMMDD-XXXX
  pharmacistId: string;
  pharmacistName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending Payment' | 'Paid' | 'Cancelled';
  createdAt: string;
  paidAt?: string;
  accountantId?: string;
  paymentMethod?: 'Cash' | 'Card' | 'Mobile';
}

interface OrderItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

#### **Users Table**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Pharmacist' | 'Accountant';
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
}
```

### 4. **Technical Implementation**

#### **Frontend Structure**
```
/components
├── DrugManagement.tsx        # Admin only - Add/edit drugs
├── WalkInSales.tsx          # Pharmacist - Create sales orders
├── PaymentProcessing.tsx    # Accountant - Confirm payments
├── OrderTracking.tsx        # View order status
├── StockReports.tsx         # Admin - Inventory reports
├── SalesReports.tsx         # Admin/Accountant - Sales analytics
├── ThermalPrinter.tsx       # Print sales slips & receipts
└── Dashboard.tsx            # Role-based dashboard
```

#### **API Endpoints**
```
POST /drugs              # Admin: Add new drug
PUT /drugs/:id           # Admin: Update drug
GET /drugs               # All: Get drugs list
POST /orders             # Pharmacist: Create order
PUT /orders/:id/payment  # Accountant: Confirm payment
GET /orders              # Get orders (filtered by role)
GET /reports/sales       # Admin/Accountant: Sales reports
GET /reports/stock       # Admin: Stock reports
```

### 5. **Key Features**

#### **🏪 Walk-In Sales Process**
1. **Drug Selection Interface**:
   - Search bar with autocomplete
   - Category filters (Tablet, Syrup, etc.)
   - Stock availability display
   - Bulk quantity selection

2. **Order Generation**:
   - Auto-generate order number: `ORD-20241225-0001`
   - Calculate subtotal, tax (if applicable), total
   - Validate stock availability
   - Temporary stock reservation

3. **Sales Slip Format**:
   ```
   PHARMACARE SALES SLIP
   Order: ORD-20241225-0001
   Date: 25/12/2024 14:30
   Pharmacist: Sarah Johnson
   
   ITEMS:
   Paracetamol 500mg    x2    $3.00
   Vitamin C 1000mg     x1    $5.95
   
   SUBTOTAL:            $8.95
   TAX (0%):            $0.00
   TOTAL:               $8.95
   
   Please proceed to cashier for payment
   ```

#### **💰 Payment Processing**
1. **Payment Queue**:
   - List all pending orders
   - Order details preview
   - Customer verification

2. **Payment Confirmation**:
   - Multiple payment methods
   - Change calculation for cash
   - Payment notes/reference

3. **Receipt Format**:
   ```
   PHARMACARE OFFICIAL RECEIPT
   Receipt: RCP-20241225-0001
   Order: ORD-20241225-0001
   Date: 25/12/2024 14:35
   Cashier: Mike Wilson
   
   ITEMS:
   Paracetamol 500mg    x2    $3.00
   Vitamin C 1000mg     x1    $5.95
   
   SUBTOTAL:            $8.95
   TAX (0%):            $0.00
   TOTAL:               $8.95
   
   PAYMENT: Cash        $10.00
   CHANGE:              $1.05
   
   Thank you for choosing PharmaCare!
   ```

#### **📊 Reporting & Analytics**
1. **Stock Reports** (Admin):
   - Current inventory levels
   - Low stock alerts
   - Expiry date tracking
   - Stock movement history

2. **Sales Reports** (Admin/Accountant):
   - Daily/weekly/monthly sales
   - Top-selling drugs
   - Revenue analytics
   - Payment method breakdown

#### **🔐 Security & Access Control**
- Role-based navigation menus
- API endpoint protection
- Audit logging for all transactions
- Session management

### 6. **UI/UX Requirements**

#### **Design System**
- Use existing Tailwind V4 setup with custom CSS variables
- Maintain current shadcn/ui components
- Professional pharmacy color scheme (blues, whites, greens)
- Mobile-responsive design

#### **Navigation Structure**
```
Admin:
├── Dashboard
├── Drug Inventory
├── Sales Management
├── User Management
├── Reports & Analytics
└── Settings

Pharmacist:
├── Dashboard
├── Walk-In Sales
├── Drug Lookup
└── My Sales History

Accountant:
├── Dashboard
├── Payment Queue
├── Transaction History
└── Sales Reports
```

### 7. **Implementation Instructions**

#### **Step 1: Database Setup**
```sql
-- Create tables in Supabase
-- Set up RLS policies
-- Create indexes for performance
```

#### **Step 2: Backend API**
```typescript
// Update existing Supabase Edge Functions
// Add new endpoints for orders and payments
// Implement role-based access control
```

#### **Step 3: Frontend Components**
```typescript
// Refactor existing components to match new workflow
// Create new walk-in sales interface
// Update payment processing component
// Add thermal printing functionality
```

#### **Step 4: Testing**
```
// Test complete workflow end-to-end
// Verify role permissions
// Test printing functionality
// Validate stock updates
```

### 8. **Success Criteria**

✅ **Functional Requirements**:
- Admin can add/manage drugs and users
- Pharmacist can create orders for walk-in customers
- Accountant can process payments and print receipts
- Stock updates automatically after payment confirmation

✅ **Technical Requirements**:
- Role-based access control working
- Real-time stock updates
- Thermal printer integration
- Mobile-responsive interface

✅ **Business Requirements**:
- Clear audit trail for all transactions
- Professional receipts and sales slips
- Accurate inventory management
- Fast checkout process for customers

---

## 🚀 Implementation Command

Use this prompt with any AI to generate the complete system:

**"Build a pharmacy management system using the specifications above. Include all database schemas, API endpoints, React components, and implement the complete walk-in customer sales workflow with role-based access control. Use React, TypeScript, Tailwind CSS, and Supabase. Follow the exact workflow: Customer → Pharmacist creates order → Accountant processes payment → Stock updates automatically."**

---

*This prompt ensures a complete, production-ready pharmacy management system with the exact workflow and features you specified.*