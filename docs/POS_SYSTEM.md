# POS (Point of Sale) System - Complete Setup Guide

## ✅ What Was Created

### 1. Database Schema
**File**: `lib/pos-schema.sql`

**Tables Created:**
- `cart_items` - Temporary storage for current shopping cart
- `sales_transactions` - Completed sales records
- `sales_transaction_items` - Line items for each transaction

**Features:**
- Session-based cart management
- Transaction number generation
- Multiple payment methods support
- Automatic inventory updates on sale
- Full audit trail with timestamps

### 2. API Endpoints

#### Cart Management API
**File**: `pages/api/pos/cart.ts`

**Endpoints:**
- `GET /api/pos/cart?sessionId={id}` - Get cart items
- `POST /api/pos/cart` - Add item to cart
- `PUT /api/pos/cart` - Update cart item quantity
- `DELETE /api/pos/cart?id={id}` - Remove item from cart
- `DELETE /api/pos/cart?sessionId={id}` - Clear entire cart

#### Checkout API
**File**: `pages/api/pos/checkout.ts`

**Endpoint:**
- `POST /api/pos/checkout` - Complete sale transaction

**Features:**
- Creates sales transaction
- Records transaction items
- Updates product inventory
- Clears cart after successful sale
- Calculates change amount
- Supports multiple payment methods

### 3. Frontend POS Page
**File**: `pages/pos.tsx`

**Features:**
- Product search and filtering
- Retail/Wholesale price mode toggle
- Product grid with stock information
- Real-time cart management
- Quantity adjustment
- Checkout modal with payment processing
- Customer information capture
- Change calculation
- Session-based cart persistence

## 🎨 UI Components

### Product Card
- Product image placeholder
- Stock quantity badge
- Product name and SKU
- Retail and wholesale prices
- Add to cart button
- Hover effects

### Cart Sidebar
- Cart items list
- Quantity controls (+/-)
- Remove item button
- Cart total
- Clear all button
- Checkout button

### Checkout Modal
- Customer name (optional)
- Phone number (optional)
- Payment method selector (Cash, M-Pesa, Card, Bank)
- Amount paid input
- Change calculation
- Complete sale button

## 📊 Database Setup

### Step 1: Run SQL Schema in Supabase

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `lib/pos-schema.sql`
4. Run the SQL script

This will create:
- 3 new tables
- Indexes for performance
- Triggers for automatic timestamps

### Step 2: Verify Tables

Check that these tables exist:
```sql
SELECT * FROM cart_items LIMIT 1;
SELECT * FROM sales_transactions LIMIT 1;
SELECT * FROM sales_transaction_items LIMIT 1;
```

## 🚀 How to Use the POS System

### For Cashiers:

1. **Navigate to POS**
   - Click "Point of Sale" in the sidebar
   - Or visit `/pos` directly

2. **Search Products**
   - Use the search bar to find products by name, SKU, or description
   - Products display with current stock levels

3. **Select Price Mode**
   - Toggle between Retail and Wholesale pricing
   - Prices update automatically

4. **Add Items to Cart**
   - Click on any product card to add it to cart
   - Items are added with quantity 1
   - Duplicate items increase quantity

5. **Manage Cart**
   - Use +/- buttons to adjust quantities
   - Click X to remove items
   - Click "Clear All" to empty cart

6. **Checkout**
   - Click "Proceed to Checkout"
   - Enter customer details (optional)
   - Select payment method
   - Enter amount paid
   - System calculates change automatically
   - Click "Complete Sale"

7. **After Sale**
   - Cart clears automatically
   - Inventory updates automatically
   - Transaction is recorded
   - Ready for next customer

## 🔧 Technical Details

### Session Management
- Each browser session gets a unique session ID
- Cart persists during the session
- Multiple cashiers can work simultaneously

### Price Modes
- **Retail**: Uses `retail_price` from products table
- **Wholesale**: Uses `wholesale_price` from products table
- Mode can be switched anytime before adding to cart

### Inventory Updates
- Stock automatically decreases on completed sale
- Updates `stock_quantity` in products table
- Prevents overselling (frontend shows stock levels)

### Transaction Numbers
- Auto-generated format: `TXN-{timestamp}-{random}`
- Example: `TXN-1703001234567-ABC123XYZ`
- Unique for each transaction

### Payment Methods
- Cash
- M-Pesa
- Card
- Bank Transfer

## 📱 Features

### Product Display
- ✅ Grid layout with responsive design
- ✅ Product images (with placeholder)
- ✅ Stock quantity badges
- ✅ SKU display
- ✅ Dual pricing (retail/wholesale)
- ✅ Quick add to cart

### Cart Management
- ✅ Real-time updates
- ✅ Quantity adjustment
- ✅ Item removal
- ✅ Clear all
- ✅ Running total
- ✅ Item count

### Checkout Process
- ✅ Customer information capture
- ✅ Multiple payment methods
- ✅ Change calculation
- ✅ Transaction recording
- ✅ Inventory updates
- ✅ Receipt data generation

## 🎯 API Usage Examples

### Add Item to Cart
```javascript
fetch('/api/pos/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-123',
    productId: 'prod-456',
    productName: 'Product Name',
    sku: 'SKU-001',
    quantity: 1,
    unitPrice: 100.00,
    priceType: 'retail'
  })
});
```

### Complete Checkout
```javascript
fetch('/api/pos/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-123',
    customerName: 'John Doe',
    customerPhone: '+254712345678',
    subtotal: 500.00,
    discount: 0,
    tax: 0,
    total: 500.00,
    amountPaid: 1000.00,
    paymentMethod: 'cash',
    cashierName: 'Jane Smith'
  })
});
```

## 🔐 Security Considerations

- Session IDs are client-generated (consider server-side generation for production)
- No authentication on cart endpoints (add middleware for production)
- Consider adding rate limiting
- Validate stock availability before checkout
- Add transaction rollback on errors

## 📈 Future Enhancements

Potential improvements:
- Barcode scanner integration
- Receipt printing
- Customer loyalty points
- Discount codes
- Tax calculations
- Split payments
- Refund processing
- Daily sales reports
- Cashier performance tracking
- Low stock alerts during sale

## 🧪 Testing

### Test the POS System:

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to POS**
   - Visit http://localhost:3000/pos

3. **Test Workflow**
   - Search for products
   - Add items to cart
   - Adjust quantities
   - Complete checkout
   - Verify inventory updates

4. **Check Database**
   - View `sales_transactions` table
   - View `sales_transaction_items` table
   - Verify `products.stock_quantity` decreased

## 📝 Notes

- The POS page is fully integrated with your existing product database
- All transactions are recorded for reporting and analytics
- The system supports concurrent users (multiple cashiers)
- Cart data is temporary and session-based
- Completed transactions are permanent records

## 🎉 Ready to Use!

Your POS system is now complete and ready for use. The page matches the reference design with:
- ✅ Product grid with search
- ✅ Retail/Wholesale toggle
- ✅ Shopping cart sidebar
- ✅ Checkout modal
- ✅ Full database integration
- ✅ Inventory management
- ✅ Transaction recording

Navigate to `/pos` to start selling!
