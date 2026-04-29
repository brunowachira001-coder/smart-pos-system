# Smart POS System

<!-- Deployment trigger: Landing page + Mobile optimization update -->

A complete Point of Sale and Inventory Management System built with Next.js, React, and Supabase.

## 🚀 Live Demo

**Website**: [https://smart-pos-system.vercel.app](https://smart-pos-system.vercel.app)

## 📋 Features

- **Dashboard** - Real-time analytics and insights
- **Point of Sale (POS)** - Fast checkout and sales processing
- **Inventory Management** - Track stock levels and products
- **Customer Management** - Manage customer information
- **Transactions** - Complete transaction history
- **Returns Management** - Handle product returns
- **Expense Tracking** - Monitor business expenses
- **Debt Management** - Track customer debts
- **Sales Analytics** - Detailed sales reports
- **Inventory Analytics** - Stock analysis and insights
- **Product Performance** - Track product sales metrics
- **User Management** - Manage system users and roles
- **Profile Settings** - User profile and preferences

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Authentication**: Supabase Auth

## 📚 Documentation

All documentation is in the `docs/` folder:

- [Quick Start Guide](docs/README.md)
- [Database Setup](docs/DATABASE_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Feature Documentation](docs/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/brunowachira001-coder/smart-pos-system.git
cd smart-pos-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Setup Database

Run the SQL schemas in your Supabase SQL Editor:
- `lib/database.sql` - Main schema
- `lib/users-schema.sql` - Users table
- `lib/customers-step-by-step.sql` - Customers
- `lib/products-migration.sql` - Products updates
- Other schema files as needed

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
smart-pos-system/
├── components/        # React components
├── pages/            # Next.js pages and API routes
├── lib/              # Database schemas and utilities
├── styles/           # CSS styles
├── docs/             # Documentation
├── public/           # Static files
└── .env.local        # Environment variables
```

## 🔑 Default Login

- Email: `johnsmarttraders@gmail.com`
- Password: (Set in your system)

## 📝 License

This project is private and proprietary.

## 👨‍💻 Developer

Built by Bruno Wachira

## 🆘 Support

For issues or questions, check the documentation in the `docs/` folder.
