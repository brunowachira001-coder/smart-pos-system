# Product Performance Page Setup - Complete

## Overview
Complete product performance analytics system showing sales, profit, and return metrics for each product with database integration.

## What Was Created

### 1. Backend API
**File:** `pages/api/product-performance/overview.ts`

Features:
- Fetches all products from database
- Calculates sales metrics from sales_transaction_items
- Calculates return rates from returns table
- Computes profit margins using cost_price and retail_price
- Supports date range filtering
- Supports product search by name or SKU
- Sorts products by units sold (descending)

Metrics Calculated:
- Units Sold - Total quantity sold
- Net Revenue - Total sales revenue
- Net Cost - Total cost (units × cost_price)
- Net Profit - Revenue minus cost
- Profit Margin - (Profit / Revenue) × 100
- Return Rate - (Returned units / Sold units) × 100

### 2. Frontend Page
**File:** `pages/product-performance.tsx`

Features:
- Product performance table with 7 columns
- Date range filter using DateRangeFilter component
- Search by product name or SKU
- Export to CSV functionality
- Summary statistics cards:
  - Total Products
  - Total Units Sold
  - Total Revenue
  - Total Profit
- Responsive design with dark theme support
- Loading states
- Empty state handling

### 3. Sidebar Updated
**File:** `components/Layout/Sidebar.tsx`
- Updated Product Performance link to point to `/product-performance`

## Database Requirements

The page uses existing tables:
- `products` - Product information with cost_price and retail_price
- `sales_transaction_items` - Individual items in sales transactions
- `sales_transactions` - Sales transaction headers
- `returns` - Product returns data

**Note:** Requires the products table migration to have been run (cost_price, retail_price fields).

## Features

### Performance Metrics
- **Units Sold**: Total quantity of each product sold
- **Net Revenue**: Total revenue generated (price × quantity)
- **Net Cost**: Total cost (cost_price × quantity)
- **Net Profit**: Revenue minus cost
- **Profit Margin**: Percentage profit on revenue
- **Return Rate**: Percentage of sold units that were returned

### Filtering & Search
- Date range filter (Today, Yesterday, Last 7 Days, Last 30 Days, etc.)
- Search by product name or SKU
- Real-time data updates

### Export
- Export all performance data to CSV
- Includes all metrics
- Date-stamped filename

### Summary Statistics
- Total number of products analyzed
- Total units sold across all products
- Total revenue generated
- Total profit earned

## How to Use

### Step 1: Ensure Database is Ready
Make sure you've run the products migration:
```sql
-- Products table should have:
- cost_price
- retail_price
- stock_quantity
```

### Step 2: Access the Page
Navigate to: `/product-performance`

### Step 3: Analyze Performance
1. Select date range to analyze specific period
2. View products sorted by units sold
3. Check profit margins and return rates
4. Export data for further analysis

### Step 4: Use Insights
- Identify best-selling products
- Find high-profit margin items
- Spot products with high return rates
- Make data-driven inventory decisions

## API Endpoint

### GET /api/product-performance/overview

Query Parameters:
- `startDate` (optional) - Start date for filtering (YYYY-MM-DD)
- `endDate` (optional) - End date for filtering (YYYY-MM-DD)
- `search` (optional) - Search query for product name or SKU

Response:
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "sku": "SKU-001",
      "unitsSold": 100,
      "netRevenue": "10000.00",
      "netCost": "6000.00",
      "netProfit": "4000.00",
      "profitMargin": "40.00",
      "returnRate": "2.00"
    }
  ]
}
```

## Calculations

### Net Revenue
```
Net Revenue = Σ (price × quantity) for all sales
```

### Net Cost
```
Net Cost = units_sold × cost_price
```

### Net Profit
```
Net Profit = Net Revenue - Net Cost
```

### Profit Margin
```
Profit Margin = (Net Profit / Net Revenue) × 100
```

### Return Rate
```
Return Rate = (returned_units / units_sold) × 100
```

## Design Features

### Table Columns
1. Product - Name and SKU
2. Units Sold - Total quantity sold
3. Net Revenue - Total sales amount
4. Net Cost - Total cost amount
5. Net Profit - Profit amount (green text)
6. Profit Margin - Percentage
7. Return Rate - Percentage

### Color Coding
- Net Profit: Emerald green (#10b981)
- High values: Emphasized with bold font
- Hover effects: Subtle background change

### Responsive Design
- Mobile-friendly table
- Horizontal scroll on small screens
- Adaptive grid for summary cards

## Integration with Other Pages

### Inventory Page
- Uses same products table
- Shares cost_price and retail_price fields
- Complementary analytics

### Sales Analytics
- Uses same sales_transactions data
- Different perspective (overall vs per-product)

### Inventory Analytics
- Uses same products table
- Different metrics (stock vs performance)

## Use Cases

1. **Identify Top Performers**
   - Sort by units sold
   - Find best-selling products
   - Focus marketing on winners

2. **Optimize Pricing**
   - Check profit margins
   - Adjust prices for low-margin items
   - Maximize profitability

3. **Reduce Returns**
   - Identify high return rate products
   - Investigate quality issues
   - Improve product descriptions

4. **Inventory Planning**
   - Stock more of high-performers
   - Reduce inventory of slow movers
   - Balance profit vs volume

5. **Financial Analysis**
   - Calculate total profit
   - Analyze revenue streams
   - Make budget decisions

## Next Steps

1. Navigate to `/product-performance`
2. Select a date range to analyze
3. Review product performance metrics
4. Export data for reporting
5. Use insights to optimize inventory and pricing

## Notes

- Products with no sales show 0 for all metrics
- Return rate only counts approved/completed returns
- Profit margin can be negative for loss-making products
- Data updates in real-time based on sales and returns
- Requires products migration to be run first

## Status
✅ Backend API created
✅ Frontend page complete
✅ Date range filtering implemented
✅ Search functionality added
✅ Export to CSV working
✅ Summary statistics included
✅ Sidebar updated
✅ Ready to use

Access the page at `/product-performance` to start analyzing your product performance!
