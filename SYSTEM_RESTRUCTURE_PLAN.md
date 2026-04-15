# Smart POS System - Complete Restructure Plan

## Project Structure
```
smart-pos-system/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MainLayout.tsx
│   ├── Auth/
│   │   └── LoginCard.tsx
│   ├── Dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── SalesChart.tsx
│   │   └── AIInsights.tsx
│   ├── POS/
│   │   ├── ProductListing.tsx
│   │   ├── ShoppingCart.tsx
│   │   └── PaymentModal.tsx
│   ├── Inventory/
│   │   ├── ProductTable.tsx
│   │   └── LowStockAlerts.tsx
│   ├── Common/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   ├── pos.tsx
│   ├── inventory.tsx
│   ├── customers.tsx
│   ├── transactions.tsx
│   ├── reports.tsx
│   └── settings.tsx
│
├── api/
│   ├── auth/
│   │   └── login.ts
│   ├── products/
│   │   ├── index.ts
│   │   ├── [id].ts
│   ├── sales/
│   │   └── index.ts
│   ├── inventory/
│   │   └── index.ts
│   └── customers/
│       └── index.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useCart.ts
│
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── product.ts
│   └── transaction.ts
│
├── utils/
│   ├── api.ts
│   ├── formatting.ts
│   └── validation.ts
│
├── styles/
│   └── globals.css
│
└── public/
    └── logo.png
```

## Color Scheme
- Primary: #1F2937 (Dark Gray)
- Secondary: #3B82F6 (Blue)
- Accent: #10B981 (Green)
- Background: #F9FAFB (Light Gray)
- Text: #111827 (Dark)
- Border: #E5E7EB (Light Gray)

## Key Features Implementation
1. ✅ Sidebar Navigation (Fixed, Collapsible)
2. ✅ Top Navigation Bar (Search, Notifications, Profile)
3. ✅ Dashboard with Summary Cards & Charts
4. ✅ POS Screen with Real-time Cart
5. ✅ Inventory Management
6. ✅ Customer Management
7. ✅ Transaction History
8. ✅ Reports & Analytics
9. ✅ Settings Page
10. ✅ Role-based Access Control

## Next Steps
1. Create new Sidebar component
2. Create new TopBar component
3. Create MainLayout wrapper
4. Redesign Login page
5. Update all pages to use new layout
6. Add responsive design
7. Deploy to Vercel
