-- ========================================
-- COMPLETE DATA RESTORATION
-- Products: 121
-- Customers: 54
-- Returns: 18
-- Expenses: 10
-- Debts: 4
-- Shop Settings: 1
-- ========================================

-- CLEAN UP EXISTING DATA
DELETE FROM products WHERE sku LIKE 'TEST-%';
DELETE FROM returns;
DELETE FROM expenses;
DELETE FROM debts;
DELETE FROM shop_settings;

-- INSERT PRODUCTS (121)
INSERT INTO products (sku, name, category, stock_quantity, retail_price, wholesale_price, cost_price, status, description, barcode, image_url, minimum_stock_level)
VALUES
('UC-002', 'USB-C Cable', 'Accessories', 500, 9.99, 8.49, 5.99, 'active', NULL, NULL, NULL, 10),
('PC-003', 'Phone Case', 'Accessories', 300, 5, 4.25, 3, 'active', NULL, NULL, NULL, 10),
('SP-004', 'Screen Protector', 'Accessories', 1000, 2, 1.7, 1.2, 'active', NULL, NULL, NULL, 10),
('PB-005', 'Power Bank', 'Electronics', 45, 20, 17, 12, 'inactive', NULL, NULL, NULL, 10),
('BS-006', 'Bluetooth Speaker', 'Electronics', 80, 35, 29.75, 21, 'active', NULL, NULL, NULL, 10),
('#33', 'Earpods', 'Electronics', 12, 450, 382.5, 270, 'inactive', NULL, NULL, NULL, 10),
('PROD002', 'Bread (Loaf)', 'Bakery', 50, 80, 68, 40, 'active', 'Fresh bread', '1234567890002', NULL, 5),
('SKU-00001', 'Product 1', 'Clothing', 105, 115, 92, 60, 'inactive', 'Demo product description for item 1', NULL, NULL, 20),
('PROD004', 'Rice (2kg)', 'Grains', 120, 1000, 900, 10, 'active', 'White rice', '1234567890004', NULL, 15),
('SKU-00002', 'Product 2', 'Food & Beverages', 110, 130, 104, 70, 'inactive', 'Demo product description for item 2', NULL, NULL, 20),
('SKU-00003', 'Product 3', 'Home & Garden', 115, 145, 116, 80, 'inactive', 'Demo product description for item 3', NULL, NULL, 20),
('PROD034', 'Soap', 'Detergents', 36, 210, 180, 100, 'inactive', 'Menengai', '345672920333', 'https://i.imgur.com/kEuV0PA.jpeg', 5),
('SKU-00004', 'Product 4', 'Sports', 120, 160, 128, 90, 'inactive', 'Demo product description for item 4', NULL, NULL, 20),
('SKU-00005', 'Product 5', 'Books', 125, 175, 140, 100, 'inactive', 'Demo product description for item 5', NULL, NULL, 20),
('SKU-00006', 'Product 6', 'Toys', 130, 190, 152, 110, 'inactive', 'Demo product description for item 6', NULL, NULL, 20),
('SKU-00007', 'Product 7', 'Health & Beauty', 135, 205, 164, 120, 'inactive', 'Demo product description for item 7', NULL, NULL, 20),
('SKU-00008', 'Product 8', 'Electronics', 140, 220, 176, 130, 'inactive', 'Demo product description for item 8', NULL, NULL, 20),
('SKU-00009', 'Product 9', 'Clothing', 145, 235, 188, 140, 'inactive', 'Demo product description for item 9', NULL, NULL, 20),
('SKU-00011', 'Product 11', 'Home & Garden', 155, 265, 212, 160, 'inactive', 'Demo product description for item 11', NULL, NULL, 20),
('SKU-00012', 'Product 12', 'Sports', 160, 280, 224, 170, 'inactive', 'Demo product description for item 12', NULL, NULL, 20),
('SKU-00013', 'Product 13', 'Books', 165, 295, 236, 180, 'inactive', 'Demo product description for item 13', NULL, NULL, 20),
('SKU-00014', 'Product 14', 'Toys', 170, 310, 248, 190, 'inactive', 'Demo product description for item 14', NULL, NULL, 20),
('SKU-00015', 'Product 15', 'Health & Beauty', 175, 325, 260, 200, 'inactive', 'Demo product description for item 15', NULL, NULL, 20),
('SKU-00016', 'Product 16', 'Electronics', 180, 340, 272, 210, 'inactive', 'Demo product description for item 16', NULL, NULL, 20),
('SKU-00017', 'Product 17', 'Clothing', 185, 355, 284, 220, 'inactive', 'Demo product description for item 17', NULL, NULL, 20),
('SKU-00018', 'Product 18', 'Food & Beverages', 190, 370, 296, 230, 'inactive', 'Demo product description for item 18', NULL, NULL, 20),
('SKU-00019', 'Product 19', 'Home & Garden', 195, 385, 308, 240, 'inactive', 'Demo product description for item 19', NULL, NULL, 20),
('SKU-00020', 'Product 20', 'Sports', 200, 400, 320, 250, 'inactive', 'Demo product description for item 20', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00021', 'Product 21', 'Books', 205, 415, 332, 260, 'inactive', 'Demo product description for item 21', NULL, NULL, 20),
('SKU-00022', 'Product 22', 'Toys', 210, 430, 344, 270, 'inactive', 'Demo product description for item 22', NULL, NULL, 20),
('SKU-00023', 'Product 23', 'Health & Beauty', 215, 445, 356, 280, 'inactive', 'Demo product description for item 23', NULL, NULL, 20),
('PROD005', 'Sugar (1kg)', 'Groceries', 90, 120, 110, 70, 'active', 'White sugar', '1234567890005', NULL, 10),
('PROD009', 'Tea Leaves (250g)', 'Beverages', 60, 180, 170, 100, 'active', 'Premium tea', '1234567890009', NULL, 10),
('PROD001', 'Milk (1L)', 'Dairy', 100, 150, 140, 90, 'active', 'Fresh milk', '1234567890001', NULL, 10),
('PROD007', 'Beans (1kg)', 'Grains', 80, 180, 170, 100, 'active', 'Dried beans', '1234567890007', NULL, 10),
('PROD011', 'Salt (1kg)', 'Groceries', 150, 50, 45, 25, 'active', 'Iodized salt', '1234567890011', NULL, 20),
('PROD012', 'Pasta (500g)', 'Grains', 70, 120, 110, 65, 'active', 'Spaghetti pasta', '1234567890012', NULL, 10),
('PROD008', 'Flour (2kg)', 'Grains', 70, 140, 130, 80, 'active', 'Wheat flour', '1234567890008', 'https://i.postimg.cc/Qxtq5xdt/120048-main.avif', 15),
('PROD010', 'Coffee (500g)', 'Beverages', 40, 350, 330, 200, 'active', 'Ground coffee', '1234567890010', NULL, 5),
('PROD006', 'Cooking Oil (1L)', 'Oils', 60, 250, 240, 150, 'active', 'Vegetable oil', '1234567890006', NULL, 10),
('PROD045', 'Toilex', 'Toilet papers', 100, 40, 30, 24, 'inactive', 'Original', '3420292994', NULL, 10),
('SKU-00010', 'Product 10', 'Food & Beverages', 150, 250, 200, 150, 'inactive', 'Demo product description for item 10', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('WH-001', 'Wireless Headphones', 'Electronics', 150, 49.99, 42.49, 29.99, 'active', NULL, NULL, NULL, 10),
('SKU-00024', 'Product 24', 'Electronics', 220, 460, 368, 290, 'inactive', 'Demo product description for item 24', NULL, NULL, 20),
('SKU-00025', 'Product 25', 'Clothing', 225, 475, 380, 300, 'inactive', 'Demo product description for item 25', NULL, NULL, 20),
('SKU-00026', 'Product 26', 'Food & Beverages', 230, 490, 392, 310, 'inactive', 'Demo product description for item 26', NULL, NULL, 20),
('SKU-00027', 'Product 27', 'Home & Garden', 235, 505, 404, 320, 'inactive', 'Demo product description for item 27', NULL, NULL, 20),
('SKU-00028', 'Product 28', 'Sports', 240, 520, 416, 330, 'inactive', 'Demo product description for item 28', NULL, NULL, 20),
('SKU-00029', 'Product 29', 'Books', 245, 535, 428, 340, 'inactive', 'Demo product description for item 29', NULL, NULL, 20),
('SKU-00030', 'Product 30', 'Toys', 250, 550, 440, 350, 'inactive', 'Demo product description for item 30', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00031', 'Product 31', 'Health & Beauty', 255, 565, 452, 360, 'inactive', 'Demo product description for item 31', NULL, NULL, 20),
('SKU-00032', 'Product 32', 'Electronics', 260, 580, 464, 370, 'inactive', 'Demo product description for item 32', NULL, NULL, 20),
('SKU-00033', 'Product 33', 'Clothing', 265, 595, 476, 380, 'inactive', 'Demo product description for item 33', NULL, NULL, 20),
('SKU-00034', 'Product 34', 'Food & Beverages', 270, 610, 488, 390, 'inactive', 'Demo product description for item 34', NULL, NULL, 20),
('SKU-00035', 'Product 35', 'Home & Garden', 275, 625, 500, 400, 'inactive', 'Demo product description for item 35', NULL, NULL, 20),
('SKU-00036', 'Product 36', 'Sports', 280, 640, 512, 410, 'inactive', 'Demo product description for item 36', NULL, NULL, 20),
('SKU-00037', 'Product 37', 'Books', 285, 655, 524, 420, 'inactive', 'Demo product description for item 37', NULL, NULL, 20),
('SKU-00038', 'Product 38', 'Toys', 290, 670, 536, 430, 'inactive', 'Demo product description for item 38', NULL, NULL, 20),
('SKU-00039', 'Product 39', 'Health & Beauty', 295, 685, 548, 440, 'inactive', 'Demo product description for item 39', NULL, NULL, 20),
('SKU-00040', 'Product 40', 'Electronics', 300, 700, 560, 450, 'inactive', 'Demo product description for item 40', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00041', 'Product 41', 'Clothing', 305, 715, 572, 460, 'inactive', 'Demo product description for item 41', NULL, NULL, 20),
('SKU-00042', 'Product 42', 'Food & Beverages', 310, 730, 584, 470, 'inactive', 'Demo product description for item 42', NULL, NULL, 20),
('SKU-00043', 'Product 43', 'Home & Garden', 315, 745, 596, 480, 'inactive', 'Demo product description for item 43', NULL, NULL, 20),
('SKU-00044', 'Product 44', 'Sports', 320, 760, 608, 490, 'inactive', 'Demo product description for item 44', NULL, NULL, 20),
('SKU-00045', 'Product 45', 'Books', 325, 775, 620, 500, 'inactive', 'Demo product description for item 45', NULL, NULL, 20),
('SKU-00046', 'Product 46', 'Toys', 330, 790, 632, 510, 'inactive', 'Demo product description for item 46', NULL, NULL, 20),
('SKU-00047', 'Product 47', 'Health & Beauty', 335, 805, 644, 520, 'inactive', 'Demo product description for item 47', NULL, NULL, 20),
('SKU-00048', 'Product 48', 'Electronics', 340, 820, 656, 530, 'inactive', 'Demo product description for item 48', NULL, NULL, 20),
('SKU-00049', 'Product 49', 'Clothing', 345, 835, 668, 540, 'inactive', 'Demo product description for item 49', NULL, NULL, 20),
('SKU-00050', 'Product 50', 'Food & Beverages', 350, 850, 680, 550, 'inactive', 'Demo product description for item 50', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00051', 'Product 51', 'Home & Garden', 355, 865, 692, 560, 'inactive', 'Demo product description for item 51', NULL, NULL, 20),
('SKU-00052', 'Product 52', 'Sports', 360, 880, 704, 570, 'inactive', 'Demo product description for item 52', NULL, NULL, 20),
('SKU-00053', 'Product 53', 'Books', 365, 895, 716, 580, 'inactive', 'Demo product description for item 53', NULL, NULL, 20),
('SKU-00054', 'Product 54', 'Toys', 370, 910, 728, 590, 'inactive', 'Demo product description for item 54', NULL, NULL, 20),
('SKU-00055', 'Product 55', 'Health & Beauty', 375, 925, 740, 600, 'inactive', 'Demo product description for item 55', NULL, NULL, 20),
('SKU-00056', 'Product 56', 'Electronics', 380, 940, 752, 610, 'inactive', 'Demo product description for item 56', NULL, NULL, 20),
('SKU-00057', 'Product 57', 'Clothing', 385, 955, 764, 620, 'inactive', 'Demo product description for item 57', NULL, NULL, 20),
('SKU-00058', 'Product 58', 'Food & Beverages', 390, 970, 776, 630, 'inactive', 'Demo product description for item 58', NULL, NULL, 20),
('SKU-00059', 'Product 59', 'Home & Garden', 395, 985, 788, 640, 'inactive', 'Demo product description for item 59', NULL, NULL, 20),
('SKU-00060', 'Product 60', 'Sports', 400, 1000, 800, 650, 'inactive', 'Demo product description for item 60', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00061', 'Product 61', 'Books', 405, 1015, 812, 660, 'inactive', 'Demo product description for item 61', NULL, NULL, 20),
('SKU-00062', 'Product 62', 'Toys', 410, 1030, 824, 670, 'inactive', 'Demo product description for item 62', NULL, NULL, 20),
('SKU-00063', 'Product 63', 'Health & Beauty', 415, 1045, 836, 680, 'inactive', 'Demo product description for item 63', NULL, NULL, 20),
('SKU-00064', 'Product 64', 'Electronics', 420, 1060, 848, 690, 'inactive', 'Demo product description for item 64', NULL, NULL, 20),
('SKU-00065', 'Product 65', 'Clothing', 425, 1075, 860, 700, 'inactive', 'Demo product description for item 65', NULL, NULL, 20),
('SKU-00066', 'Product 66', 'Food & Beverages', 430, 1090, 872, 710, 'inactive', 'Demo product description for item 66', NULL, NULL, 20),
('SKU-00067', 'Product 67', 'Home & Garden', 435, 1105, 884, 720, 'inactive', 'Demo product description for item 67', NULL, NULL, 20),
('SKU-00068', 'Product 68', 'Sports', 440, 1120, 896, 730, 'inactive', 'Demo product description for item 68', NULL, NULL, 20),
('SKU-00069', 'Product 69', 'Books', 445, 1135, 908, 740, 'inactive', 'Demo product description for item 69', NULL, NULL, 20),
('SKU-00070', 'Product 70', 'Toys', 450, 1150, 920, 750, 'inactive', 'Demo product description for item 70', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00071', 'Product 71', 'Health & Beauty', 455, 1165, 932, 760, 'inactive', 'Demo product description for item 71', NULL, NULL, 20),
('SKU-00072', 'Product 72', 'Electronics', 460, 1180, 944, 770, 'inactive', 'Demo product description for item 72', NULL, NULL, 20),
('SKU-00073', 'Product 73', 'Clothing', 465, 1195, 956, 780, 'inactive', 'Demo product description for item 73', NULL, NULL, 20),
('SKU-00074', 'Product 74', 'Food & Beverages', 470, 1210, 968, 790, 'inactive', 'Demo product description for item 74', NULL, NULL, 20),
('SKU-00075', 'Product 75', 'Home & Garden', 475, 1225, 980, 800, 'inactive', 'Demo product description for item 75', NULL, NULL, 20),
('SKU-00076', 'Product 76', 'Sports', 480, 1240, 992, 810, 'inactive', 'Demo product description for item 76', NULL, NULL, 20),
('SKU-00077', 'Product 77', 'Books', 485, 1255, 1004, 820, 'inactive', 'Demo product description for item 77', NULL, NULL, 20),
('SKU-00078', 'Product 78', 'Toys', 490, 1270, 1016, 830, 'inactive', 'Demo product description for item 78', NULL, NULL, 20),
('SKU-00079', 'Product 79', 'Health & Beauty', 495, 1285, 1028, 840, 'inactive', 'Demo product description for item 79', NULL, NULL, 20),
('SKU-00080', 'Product 80', 'Electronics', 500, 1300, 1040, 850, 'inactive', 'Demo product description for item 80', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00081', 'Product 81', 'Clothing', 505, 1315, 1052, 860, 'inactive', 'Demo product description for item 81', NULL, NULL, 20),
('SKU-00082', 'Product 82', 'Food & Beverages', 510, 1330, 1064, 870, 'inactive', 'Demo product description for item 82', NULL, NULL, 20),
('SKU-00083', 'Product 83', 'Home & Garden', 515, 1345, 1076, 880, 'inactive', 'Demo product description for item 83', NULL, NULL, 20),
('SKU-00084', 'Product 84', 'Sports', 520, 1360, 1088, 890, 'inactive', 'Demo product description for item 84', NULL, NULL, 20),
('SKU-00085', 'Product 85', 'Books', 525, 1375, 1100, 900, 'inactive', 'Demo product description for item 85', NULL, NULL, 20),
('SKU-00086', 'Product 86', 'Toys', 530, 1390, 1112, 910, 'inactive', 'Demo product description for item 86', NULL, NULL, 20),
('SKU-00087', 'Product 87', 'Health & Beauty', 535, 1405, 1124, 920, 'inactive', 'Demo product description for item 87', NULL, NULL, 20),
('SKU-00088', 'Product 88', 'Electronics', 540, 1420, 1136, 930, 'inactive', 'Demo product description for item 88', NULL, NULL, 20),
('SKU-00089', 'Product 89', 'Clothing', 545, 1435, 1148, 940, 'inactive', 'Demo product description for item 89', NULL, NULL, 20),
('SKU-00090', 'Product 90', 'Food & Beverages', 550, 1450, 1160, 950, 'inactive', 'Demo product description for item 90', NULL, 'https://i.imgur.com/placeholder.jpg', 20),
('SKU-00091', 'Product 91', 'Home & Garden', 555, 1465, 1172, 960, 'inactive', 'Demo product description for item 91', NULL, NULL, 20),
('SKU-00092', 'Product 92', 'Sports', 560, 1480, 1184, 970, 'inactive', 'Demo product description for item 92', NULL, NULL, 20),
('SKU-00093', 'Product 93', 'Books', 565, 1495, 1196, 980, 'inactive', 'Demo product description for item 93', NULL, NULL, 20),
('SKU-00094', 'Product 94', 'Toys', 570, 1510, 1208, 990, 'inactive', 'Demo product description for item 94', NULL, NULL, 20),
('SKU-00095', 'Product 95', 'Health & Beauty', 575, 1525, 1220, 1000, 'inactive', 'Demo product description for item 95', NULL, NULL, 20),
('SKU-00096', 'Product 96', 'Electronics', 580, 1540, 1232, 1010, 'inactive', 'Demo product description for item 96', NULL, NULL, 20),
('SKU-00097', 'Product 97', 'Clothing', 585, 1555, 1244, 1020, 'inactive', 'Demo product description for item 97', NULL, NULL, 20),
('SKU-00098', 'Product 98', 'Food & Beverages', 590, 1570, 1256, 1030, 'inactive', 'Demo product description for item 98', NULL, NULL, 20),
('SKU-00099', 'Product 99', 'Home & Garden', 595, 1585, 1268, 1040, 'inactive', 'Demo product description for item 99', NULL, NULL, 20),
('PROD003', 'Eggs (Dozen)', 'Dairy', 61, 100, 90, 200, 'active', 'Fresh eggs', '1234567890003', 'https://i.postimg.cc/dVRDVGcC/eggs-in-paper-tray-on-black-background-free-photo.jpg', 10),
('SKU-00100', 'Product 100', 'Sports', 600, 1600, 1280, 1050, 'inactive', 'Demo product description for item 100', NULL, 'https://i.imgur.com/placeholder.jpg', 20);

-- INSERT CUSTOMERS (54)
INSERT INTO customers (name, email, phone, address, customer_type, status)
VALUES
('Ann Wachira', 'annwachira123@gmail.com', '01134990987', NULL, 'retail', 'inactive'),
('Sam Ngungu', 'samngungu123@gmail.com', '0721889007', NULL, 'retail', 'inactive'),
('Customer 22', 'customer22@example.com', '+254700000022', '22 Main Street', 'retail', 'inactive'),
('Customer 23', 'customer23@example.com', '+254700000023', '23 Main Street', 'retail', 'inactive'),
('Customer 47', 'customer47@example.com', '+254700000047', '47 Main Street', 'retail', 'inactive'),
('Customer 25', 'customer25@example.com', '+254700000025', '25 Main Street', 'retail', 'inactive'),
('Customer 7', 'customer7@example.com', '+254700000007', '7 Main Street', 'retail', 'inactive'),
('Customer 16', 'customer16@example.com', '+254700000016', '16 Main Street', 'retail', 'inactive'),
('Customer 24', 'customer24@example.com', '+254700000024', '24 Main Street', 'wholesale', 'inactive'),
('Customer 14', 'customer14@example.com', '+254700000014', '14 Main Street', 'retail', 'inactive'),
('Customer 38', 'customer38@example.com', '+254700000038', '38 Main Street', 'retail', 'inactive'),
('Customer 10', 'customer10@example.com', '+254700000010', '10 Main Street', 'retail', 'inactive'),
('Customer 35', 'customer35@example.com', '+254700000035', '35 Main Street', 'retail', 'inactive'),
('Customer 44', 'customer44@example.com', '+254700000044', '44 Main Street', 'retail', 'inactive'),
('Customer 2', 'customer2@example.com', '+254700000002', '2 Main Street', 'retail', 'inactive'),
('Customer 1', 'customer1@example.com', '+254700000001', '1 Main Street', 'retail', 'inactive'),
('Customer 15', 'customer15@example.com', '+254700000015', '15 Main Street', 'wholesale', 'inactive'),
('Customer 32', 'customer32@example.com', '+254700000032', '32 Main Street', 'retail', 'inactive'),
('Customer 33', 'customer33@example.com', '+254700000033', '33 Main Street', 'wholesale', 'inactive'),
('Customer 12', 'customer12@example.com', '+254700000012', '12 Main Street', 'wholesale', 'inactive'),
('Customer 40', 'customer40@example.com', '+254700000040', '40 Main Street', 'retail', 'inactive'),
('Customer 37', 'customer37@example.com', '+254700000037', '37 Main Street', 'retail', 'inactive'),
('Customer 46', 'customer46@example.com', '+254700000046', '46 Main Street', 'retail', 'inactive'),
('Customer 11', 'customer11@example.com', '+254700000011', '11 Main Street', 'retail', 'inactive'),
('Customer 4', 'customer4@example.com', '+254700000004', '4 Main Street', 'retail', 'inactive'),
('Customer 30', 'customer30@example.com', '+254700000030', '30 Main Street', 'wholesale', 'inactive'),
('Customer 49', 'customer49@example.com', '+254700000049', '49 Main Street', 'retail', 'inactive'),
('Customer 6', 'customer6@example.com', '+254700000006', '6 Main Street', 'wholesale', 'inactive'),
('Customer 17', 'customer17@example.com', '+254700000017', '17 Main Street', 'retail', 'inactive'),
('Customer 34', 'customer34@example.com', '+254700000034', '34 Main Street', 'retail', 'inactive'),
('Customer 27', 'customer27@example.com', '+254700000027', '27 Main Street', 'wholesale', 'inactive'),
('Customer 5', 'customer5@example.com', '+254700000005', '5 Main Street', 'retail', 'inactive'),
('Customer 31', 'customer31@example.com', '+254700000031', '31 Main Street', 'retail', 'inactive'),
('Customer 29', 'customer29@example.com', '+254700000029', '29 Main Street', 'retail', 'inactive'),
('Customer 13', 'customer13@example.com', '+254700000013', '13 Main Street', 'retail', 'inactive'),
('Customer 41', 'customer41@example.com', '+254700000041', '41 Main Street', 'retail', 'inactive'),
('Customer 3', 'customer3@example.com', '+254700000003', '3 Main Street', 'wholesale', 'inactive'),
('Customer 43', 'customer43@example.com', '+254700000043', '43 Main Street', 'retail', 'inactive'),
('Customer 26', 'customer26@example.com', '+254700000026', '26 Main Street', 'retail', 'inactive'),
('Customer 9', 'customer9@example.com', '+254700000009', '9 Main Street', 'wholesale', 'inactive'),
('Customer 8', 'customer8@example.com', '+254700000008', '8 Main Street', 'retail', 'inactive'),
('Customer 50', 'customer50@example.com', '+254700000050', '50 Main Street', 'retail', 'inactive'),
('Customer 45', 'customer45@example.com', '+254700000045', '45 Main Street', 'wholesale', 'inactive'),
('Customer 42', 'customer42@example.com', '+254700000042', '42 Main Street', 'wholesale', 'inactive'),
('Customer 39', 'customer39@example.com', '+254700000039', '39 Main Street', 'wholesale', 'inactive'),
('Customer 36', 'customer36@example.com', '+254700000036', '36 Main Street', 'wholesale', 'inactive'),
('Customer 48', 'customer48@example.com', '+254700000048', '48 Main Street', 'wholesale', 'inactive'),
('Customer 18', 'customer18@example.com', '+254700000018', '18 Main Street', 'wholesale', 'inactive'),
('Customer 28', 'customer28@example.com', '+254700000028', '28 Main Street', 'retail', 'inactive'),
('Customer 21', 'customer21@example.com', '+254700000021', '21 Main Street', 'wholesale', 'inactive'),
('Customer 19', 'customer19@example.com', '+254700000019', '19 Main Street', 'retail', 'inactive'),
('free nan', NULL, NULL, NULL, 'retail', 'inactive'),
('Customer 20', 'customer20@example.com', '+254700000020', '20 Main Street', 'retail', 'inactive'),
('Job Phonix', 'jobphnonix123@gmail.com', '0112343567', NULL, 'retail', 'inactive');

-- INSERT RETURNS (18)
INSERT INTO returns (product_id, quantity, reason, status, refund_amount, created_at)
VALUES
(NULL, 1, 'Exchanging', 'Completed', 0, '2026-04-17T09:01:31.129122+00:00'),
(NULL, 10, 'A lot', 'Completed', 0, '2026-04-17T09:01:31.129122+00:00'),
(NULL, 12, 'Too much expensive', 'Completed', 0, '2026-04-17T09:01:31.129122+00:00'),
(NULL, 2, 'Gzzz', 'Completed', 0, '2026-04-17T09:01:31.129122+00:00'),
(NULL, 2, 'Quality Issues', 'Completed', 160, '2026-04-18T12:21:29.214696+00:00'),
(NULL, 1, 'Wrong Item', 'Completed', 1600, '2026-04-25T19:23:49.710319+00:00'),
(NULL, 1, 'Changed Mind', 'Completed', 170, '2026-04-18T12:24:45.265605+00:00'),
(NULL, 6, 'Zzz', 'Completed', 299.94, '2026-04-17T09:01:31.129122+00:00'),
(NULL, 1, 'Quality Issues', 'Completed', 350, '2026-04-18T12:39:28.88924+00:00'),
(NULL, 1, 'Not as Described', 'Completed', 250, '2026-04-18T12:41:59.265476+00:00'),
(NULL, 1, 'Damaged', 'Completed', 150, '2026-04-18T12:43:59.385701+00:00'),
(NULL, 1, 'Wrong Item', 'Completed', 180, '2026-04-18T12:53:13.841918+00:00'),
(NULL, 1, 'Wrong Item', 'Completed', 170, '2026-04-18T12:55:03.902864+00:00'),
(NULL, 1, 'Wrong Item', 'Completed', 180, '2026-04-18T13:16:26.836621+00:00'),
(NULL, 1, 'Other', 'Completed', 140, '2026-04-18T13:40:04.155336+00:00'),
(NULL, 1, 'Other', 'Completed', 170, '2026-04-18T13:40:04.175973+00:00'),
(NULL, 4, 'Not as Described', 'Completed', 480, '2026-04-18T14:10:45.34373+00:00'),
(NULL, 2, 'Not as Described', 'Completed', 660, '2026-04-18T14:10:45.343706+00:00');

-- INSERT EXPENSES (10)
INSERT INTO expenses (category, amount, description, date, created_at)
VALUES
('Rent', 35000, 'Monthly office rent', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Utilities', 4500, 'Electricity bill', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Salaries', 85000, 'Staff salaries for December', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Marketing', 12000, 'Facebook ads campaign', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Maintenance', 8500, 'AC repair', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Food & Dining', 2500, 'Team lunch', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Transportation', 6000, 'Fuel for delivery van', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Supplies', 3500, 'Office stationery', NOW(), '2026-04-17T09:19:34.466841+00:00'),
('Food & Dining', 800, NULL, NOW(), '2026-04-20T09:06:00.551634+00:00'),
('Maintenance', 1500, 'Bulb & Switch repairs', NOW(), '2026-04-21T18:56:14.901112+00:00');

-- INSERT DEBTS (4)
INSERT INTO debts (customer_id, amount, paid_amount, status, due_date, created_at)
VALUES
('6252fa87-ed23-4628-b1e8-60b30ee04f11', 0, 0, 'Paid', '2026-05-23', '2026-04-23T15:02:26.173447+00:00'),
('32530ac7-2f5e-40fc-8eab-e9d022a5450b', 0, 0, 'Outstanding', '2026-05-25', '2026-04-25T11:26:07.080664+00:00'),
('984faa0a-6e5c-452f-b3c5-d31841b9d4db', 0, 0, 'Paid', '2026-05-17', '2026-04-17T08:43:36.775306+00:00'),
('7e18cae8-47fd-4fab-821b-b789e1a86e2c', 0, 0, 'Paid', '2026-05-17', '2026-04-17T08:43:36.775306+00:00');

-- INSERT SHOP SETTINGS
INSERT INTO shop_settings (shop_name, address, phone, email, currency, tax_rate, logo_url)
VALUES ('My Shop', NULL, NULL, NULL, 'KES', 0, 'https://ugemjqouxnholwlgvzer.supabase.co/storage/v1/object/public/logos/WhatsApp%20Image%202026-04-23%20at%2011.27.20.jpeg');

-- VERIFY DATA
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as total_returns FROM returns;
SELECT COUNT(*) as total_expenses FROM expenses;
SELECT COUNT(*) as total_debts FROM debts;
SELECT COUNT(*) as total_shop_settings FROM shop_settings;
