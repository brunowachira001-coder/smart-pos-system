# Dropshipping Marketplace - Setup Guide

## 📋 Project Overview

**Repository**: https://github.com/brunowachira001-coder/dropshipping-marketplace

**What it is**: A full-stack PHP/MySQL dropshipping marketplace management system with:
- Product & inventory management
- Supplier management
- Customer management
- Order processing
- Dashboard & reports
- REST API

---

## ✅ What You Need

### 1. Software Requirements

**XAMPP** (Includes everything you need):
- Apache 2.4+
- PHP 7.4+
- MySQL 8.0+
- phpMyAdmin

**Download XAMPP**:
- Windows: https://www.apachefriends.org/download.html
- Mac: https://www.apachefriends.org/download.html
- Linux: https://www.apachefriends.org/download.html

**Code Editor** (Choose one):
- VS Code (Recommended): https://code.visualstudio.com/
- Sublime Text: https://www.sublimetext.com/
- Notepad++: https://notepad-plus-plus.org/

**Web Browser**:
- Chrome, Firefox, Safari, or Edge (latest version)

---

## 🚀 Step-by-Step Installation

### Step 1: Install XAMPP

1. **Download XAMPP** from https://www.apachefriends.org/
2. **Run the installer**
3. **Install to default location**:
   - Windows: `C:\xampp`
   - Mac: `/Applications/XAMPP`
   - Linux: `/opt/lampp`
4. **Open XAMPP Control Panel**
5. **Start Apache and MySQL** services

### Step 2: Download the Project

**Method A: Download ZIP (Easiest)**

1. Go to: https://github.com/brunowachira001-coder/dropshipping-marketplace
2. Click green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file
5. Rename folder to `DB_project`
6. Move to XAMPP htdocs folder:
   - Windows: `C:\xampp\htdocs\DB_project`
   - Mac: `/Applications/XAMPP/htdocs/DB_project`
   - Linux: `/opt/lampp/htdocs/DB_project`

**Method B: Using Git**

```bash
# Navigate to htdocs
cd C:\xampp\htdocs  # Windows
# or
cd /Applications/XAMPP/htdocs  # Mac

# Clone the repository
git clone https://github.com/brunowachira001-coder/dropshipping-marketplace.git DB_project

# Enter the folder
cd DB_project
```

### Step 3: Create Database

1. **Open phpMyAdmin**:
   - Go to: http://localhost/phpmyadmin
   - Or click "Admin" next to MySQL in XAMPP Control Panel

2. **Create New Database**:
   - Click "New" in left sidebar
   - Database name: `dropshipping_marketplace`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

3. **Import Database Schema**:
   - Click on `dropshipping_marketplace` database
   - Click "Import" tab at the top
   - Click "Choose File"
   - Navigate to: `DB_project/database/schema.sql`
   - Click "Go" at the bottom
   - Wait for success message

4. **Import Sample Data** (Optional but recommended):
   - Still in "Import" tab
   - Click "Choose File"
   - Navigate to: `DB_project/database/sample_data.sql`
   - Click "Go"
   - Wait for success message

### Step 4: Configure Database Connection

1. **Open the project** in your code editor
2. **Navigate to**: `backend/config/database.php`
3. **Check these settings** (usually default is fine):

```php
private $host = "localhost";
private $db_name = "dropshipping_marketplace";
private $username = "root";
private $password = ""; // Leave empty unless you set a MySQL password
```

4. **Save the file** if you made any changes

### Step 5: Launch the Application

1. **Make sure Apache and MySQL are running** in XAMPP
2. **Open your web browser**
3. **Go to**: http://localhost/DB_project/
4. **You should see the landing page**
5. **Click "Launch Dashboard"**

---

## 🎯 Project Structure

```
DB_project/
├── database/
│   ├── schema.sql              # Database structure (tables, triggers, views)
│   └── sample_data.sql         # Test data
│
├── backend/
│   ├── config/
│   │   ├── database.php        # Database connection
│   │   └── cors.php            # API configuration
│   │
│   └── api/
│       ├── products.php        # Products API
│       ├── suppliers.php       # Suppliers API
│       ├── customers.php       # Customers API
│       ├── orders.php          # Orders API
│       └── dashboard.php       # Dashboard stats API
│
├── frontend/
│   └── pages/
│       ├── dashboard.html      # Main dashboard
│       ├── products.html       # Products page
│       ├── suppliers.html      # Suppliers page
│       ├── customers.html      # Customers page
│       └── orders.html         # Orders page
│
├── assets/
│   ├── css/
│   │   └── style.css          # Styles
│   │
│   └── js/
│       └── app.js             # JavaScript
│
└── index.html                  # Landing page
```

---

## 📖 How to Use

### Dashboard
- View statistics (products, suppliers, customers, orders, revenue)
- Monitor low stock alerts
- See recent orders
- Check best-selling products

### Products Management
1. Click "Products" in sidebar
2. Click "Add Product" to create new product
3. Fill in: Name, Category, SKU, Price, Stock, etc.
4. Click "Save"
5. Edit or delete products using action buttons

### Suppliers Management
1. Click "Suppliers" in sidebar
2. Click "Add Supplier"
3. Enter: Name, Email, Phone, Country, Rating
4. Click "Save"
5. View supplier performance and products

### Customers Management
1. Click "Customers" in sidebar
2. Click "Add Customer"
3. Enter: Name, Email, Phone
4. Click "Save"
5. View customer orders and spending

### Orders Management
1. Click "Orders" in sidebar
2. Click "Create Order"
3. Select customer
4. Add products
5. Set shipping address
6. Click "Create Order"
7. Update order status as it progresses

---

## 🔧 Troubleshooting

### Issue 1: "Database Connection Error"

**Cause**: Wrong database credentials or MySQL not running

**Solution**:
1. Check MySQL is running in XAMPP
2. Verify database name is `dropshipping_marketplace`
3. Check `backend/config/database.php` settings
4. Make sure password is empty (default XAMPP)

### Issue 2: "404 Not Found" or Blank Page

**Cause**: Wrong folder location or Apache not running

**Solution**:
1. Check Apache is running in XAMPP
2. Verify folder is in `htdocs/DB_project`
3. Go to: http://localhost/DB_project/ (with trailing slash)
4. Check Apache error logs in XAMPP

### Issue 3: "Products Not Loading"

**Cause**: Database not imported or API error

**Solution**:
1. Check database was imported successfully
2. Open browser console (F12) and check for errors
3. Verify API endpoint: http://localhost/DB_project/backend/api/products.php
4. Check sample data was imported

### Issue 4: "Permission Denied" Errors

**Cause**: File permissions (mainly on Mac/Linux)

**Solution**:
```bash
# Mac/Linux only
cd /Applications/XAMPP/htdocs/DB_project
chmod -R 755 .
```

### Issue 5: Port 80 Already in Use

**Cause**: Another program using port 80

**Solution**:
1. Stop Skype, IIS, or other web servers
2. Or change Apache port in XAMPP config
3. Restart Apache

---

## 🎓 Features Overview

### What This System Does:

1. **Product Management**
   - Add/edit/delete products
   - Track inventory levels
   - Categorize products
   - Monitor stock levels
   - Get low stock alerts

2. **Supplier Management**
   - Manage supplier information
   - Track supplier performance
   - Link suppliers to products
   - Monitor supplier ratings

3. **Customer Management**
   - Customer accounts
   - Multiple delivery addresses
   - Order history
   - Spending analytics

4. **Order Processing**
   - Create multi-item orders
   - Track order status
   - Manage payments
   - Calculate shipping
   - Automatic stock updates

5. **Reports & Analytics**
   - Real-time statistics
   - Revenue tracking
   - Best-selling products
   - Top customers
   - Order status breakdown

---

## 💻 Technology Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL 8.0+
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API**: RESTful API
- **Icons**: Font Awesome
- **Server**: Apache

---

## 📊 Database Features

### Tables:
- products
- categories
- suppliers
- supplier_products (many-to-many)
- customers
- customer_addresses
- orders
- order_items
- inventory_transactions

### Advanced Features:
- **Triggers**: Auto-update stock on orders
- **Views**: Pre-built reports (low stock, order details, etc.)
- **Constraints**: Data integrity with foreign keys
- **Indexes**: Fast queries

---

## 🔒 Security Features

- SQL injection prevention (PDO prepared statements)
- Password hashing
- Input validation
- Error handling
- CORS configuration

---

## 🎨 UI Features

- Modern dashboard design
- Card-based layout
- Responsive design
- Real-time search
- Filters and pagination
- Modal forms
- Status badges
- Alert notifications

---

## 📝 Quick Start Checklist

- [ ] XAMPP installed
- [ ] Apache and MySQL running
- [ ] Project in htdocs/DB_project folder
- [ ] Database created (dropshipping_marketplace)
- [ ] Schema imported (schema.sql)
- [ ] Sample data imported (sample_data.sql)
- [ ] Database config checked
- [ ] Opened http://localhost/DB_project/
- [ ] Dashboard loads successfully
- [ ] Can view products, suppliers, customers, orders

---

## 🚀 Next Steps

After setup:

1. **Explore the dashboard** - See all features
2. **Add test data** - Create products, suppliers, customers
3. **Create test orders** - Test the order flow
4. **Check reports** - View analytics
5. **Customize** - Modify for your needs
6. **Deploy** - Move to production server when ready

---

## 📞 Getting Help

If you encounter issues:

1. Check this guide thoroughly
2. Verify all installation steps
3. Check browser console (F12) for errors
4. Check Apache/MySQL logs in XAMPP
5. Review the project's README on GitHub

---

## 🎉 You're Ready!

Your dropshipping marketplace system is now set up and ready to use. Access it at:

**http://localhost/DB_project/**

Enjoy exploring the system!
