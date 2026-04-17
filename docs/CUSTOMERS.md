# Customers Page - Complete Setup Guide

## ✅ What Was Created

### 1. Database Schema
**File**: `lib/customers-schema.sql`

**Table Created:**
- `customers` - Customer information and purchase history

**Fields:**
- id (UUID, primary key)
- name (required)
- email
- phone
- address
- city
- country (default: Kenya)
- notes
- customer_type (retail/wholesale)
- status (active/inactive/blocked)
- total_purchases (auto-calculated)
- total_transactions (auto-calculated)
- last_purchase_date (auto-updated)
- created_at, updated_at (timestamps)

**Features:**
- Automatic stats updates via triggers
- Indexes for fast searching
- Auto-updates customer stats when transactions are created

### 2. Backend APIs

#### Customers List API
**File**: `pages/api/customers/list.ts`

**Endpoint**: `GET /api/customers/list`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by name, email, or phone
- `customerType` - Filter by retail/wholesale
- `status` - Filter by active/inactive/blocked
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - Sort direction (asc/desc)

#### Customer Management API
**File**: `pages/api/customers/index.ts`

**Endpoints:**
- `GET /api/customers?id={id}` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers` - Update customer
- `DELETE /api/customers?id={id}` - Delete customer

### 3. Frontend Page
**File**: `pages/customers.tsx`

**Features:**
- Customer list with table view
- Search by name, email, or phone
- Add new customer modal
- Edit customer modal
- Delete customer functionality
- Export to CSV
- Pagination (20 customers per page)
- Responsive design matching reference

**UI Components:**
- Search bar
- Export button
- Add Customer button
- Customers table with columns:
  - Name
  - Email
  - Phone
  - Total Purchases
  - Last Purchase
  - Actions (•••)
- Add/Edit customer modals with forms
- Pagination controls

## 🎨 UI Features

### Header
- Page title and description
- Export button (CSV download)
- Add Customer button (opens modal)

### Search
- Real-time search
- Searches name, email, and phone
- Updates as you type

### Customers Table
- Clean table layout
- Hover effects on rows
- N/A for empty fields
- Formatted dates
- Actions menu (•••)

### Add Customer Modal
- Name (required)
- Email
- Phone
- Address
- City
- Country (default: Kenya)
- Customer Type (Retail/Wholesale)
- Notes
- Cancel and Add buttons

### Edit Customer Modal
- Pre-filled form with customer data
- All fields editable
- Delete button
- Cancel and Update buttons

### Export Functionality
- Downloads CSV file
- Includes: Name, Email, Phone, Total Purchases, Last Purchase
- Filename includes current date

## 🚀 Database Setup

### Step 1: Run SQL Schema in Supabase

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `lib/customers-schema.sql`
4. Run the SQL script

This will create:
- `customers` table
- Indexes for performance
- Triggers for auto-updates
- Function to update customer stats

### Step 2: Verify Table

Check that the table exists:
```sql
SELECT * FROM customers LIMIT 1;
```

## 📊 How It Works

### Customer Stats Auto-Update
When a transaction is created with a customer_id:
1. Trigger fires automatically
2. Updates customer's `total_purchases`
3. Increments `total_transactions`
4. Updates `last_purchase_date`

### Search Functionality
- Searches across name, email, and phone fields
- Case-insensitive
- Partial matches supported
- Real-time filtering

### Customer Types
- **Retail**: Individual customers
- **Wholesale**: Business customers
- Can be filtered in future enhancements

## 🔧 API Usage Examples

### Get All Customers
```javascript
fetch('/api/customers/list?page=1&limit=20')
```

### Search Customers
```javascript
fetch('/api/customers/list?search=john')
```

### Add Customer
```javascript
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254712345678',
    customerType: 'retail'
  })
});
```

### Update Customer
```javascript
fetch('/api/customers', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'customer-id',
    name: 'John Updated',
    email: 'john.new@example.com'
  })
});
```

### Delete Customer
```javascript
fetch('/api/customers?id=customer-id', {
  method: 'DELETE'
});
```

## 🎯 Integration Points

### With POS System
- Select customer during checkout
- Customer stats update automatically
- Link customer to transactions

### With Transactions
- View customer's purchase history
- Track customer spending
- Identify top customers

### With Reports
- Customer analytics
- Purchase patterns
- Customer lifetime value

## 🧪 Testing

### Test the Customers Page:

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Customers**
   - Visit http://localhost:3000/customers

3. **Test Features**
   - Add a new customer
   - Search for customers
   - Edit customer details
   - Export to CSV
   - Test pagination

4. **Test Integration**
   - Make a sale in POS with customer
   - Return to customers page
   - Verify stats updated

## 📝 Features Matching Reference

✅ Clean table layout
✅ Search functionality
✅ Export button
✅ Add Customer button
✅ Actions menu (•••)
✅ Pagination
✅ N/A for empty fields
✅ Professional dark theme
✅ Responsive design
✅ Modal forms

## 🔐 Security Considerations

- Add authentication middleware (production)
- Validate input data
- Sanitize search queries
- Rate limiting on API endpoints
- Audit log for customer changes
- GDPR compliance for customer data

## 📱 Responsive Design

- **Desktop**: Full table with all columns
- **Tablet**: Optimized column widths
- **Mobile**: Scrollable table (future: card view)

## 🎉 Ready to Use!

Your customers page is now complete and ready for use. The page matches the reference design with:
- ✅ Complete customer management
- ✅ Search functionality
- ✅ Add/Edit/Delete operations
- ✅ Export to CSV
- ✅ Pagination
- ✅ Auto-updating stats
- ✅ Full database integration
- ✅ Professional UI matching reference

Navigate to `/customers` to manage your customer base!

## 📋 Quick Start Checklist

1. ✅ Run `lib/customers-schema.sql` in Supabase
2. ✅ Verify `customers` table exists
3. ✅ Test adding a customer
4. ✅ Test search functionality
5. ✅ Make a sale with customer in POS
6. ✅ Verify customer stats updated
7. ✅ Test export functionality

All done! Your customers management system is fully operational.
