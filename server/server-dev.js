const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { User, Product, Category, Customer, Supplier, Sale, Setting, AuditLog } = require('./models');
const { sequelize } = require('./config/db');

dotenv.config({ path: __dirname + '/.env' });

const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

const seedDatabase = async () => {
  console.log('Seeding database...');

  // Delete in reverse FK dependency order
  await Sale.destroy({ where: {} });
  await Product.destroy({ where: {} });
  await AuditLog.destroy({ where: {} });
  await Customer.destroy({ where: {} });
  await User.destroy({ where: {} });
  await Category.destroy({ where: {} });
  await Supplier.destroy({ where: {} });

  // Reset SQLite auto-increment counters
  await sequelize.query("DELETE FROM sqlite_sequence");

  const users = await User.bulkCreate([
    { username: 'admin', email: 'admin@pos.com', password: 'admin123', role: 'admin' },
    { username: 'manager', email: 'manager@pos.com', password: 'manager123', role: 'manager' },
    { username: 'cashier', email: 'cashier@pos.com', password: 'cashier123', role: 'cashier' }
  ], { individualHooks: true });

  const categories = await Category.bulkCreate([
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Food & Beverage', description: 'Food and drink products' },
    { name: 'Home & Garden', description: 'Home improvement and garden supplies' }
  ]);

  const suppliers = await Supplier.bulkCreate([
    { name: 'Tech Supply Co', contact: 'John Smith', email: 'john@techsupply.com', phone: '555-0101', address: '123 Tech Street, Silicon Valley, CA' },
    { name: 'Fashion Distributors', contact: 'Jane Doe', email: 'jane@fashiondist.com', phone: '555-0102', address: '456 Fashion Ave, New York, NY' }
  ]);

  await Product.bulkCreate([
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', sku: 'ELEC-001', barcode: '1234567890123', categoryId: categories[0].id, price: 29.99, cost: 15.00, stock: 50, minStock: 10, supplierId: suppliers[0].id, status: 'active' },
    { name: 'USB-C Cable', description: 'High-speed USB-C charging cable, 6ft', sku: 'ELEC-002', barcode: '1234567890124', categoryId: categories[0].id, price: 12.99, cost: 5.00, stock: 100, minStock: 20, supplierId: suppliers[0].id, status: 'active' },
    { name: 'Bluetooth Headphones', description: 'Noise-cancelling wireless headphones', sku: 'ELEC-003', barcode: '1234567890125', categoryId: categories[0].id, price: 79.99, cost: 40.00, stock: 25, minStock: 5, supplierId: suppliers[0].id, status: 'active' },
    { name: 'T-Shirt - Blue', description: 'Cotton crew neck t-shirt in blue', sku: 'CLO-001', barcode: '1234567890126', categoryId: categories[1].id, price: 19.99, cost: 8.00, stock: 75, minStock: 15, supplierId: suppliers[1].id, status: 'active' },
    { name: 'Jeans - Black', description: 'Classic fit denim jeans in black', sku: 'CLO-002', barcode: '1234567890127', categoryId: categories[1].id, price: 49.99, cost: 25.00, stock: 40, minStock: 10, supplierId: suppliers[1].id, status: 'active' },
    { name: 'Sneakers - White', description: 'Comfortable athletic sneakers', sku: 'CLO-003', barcode: '1234567890128', categoryId: categories[1].id, price: 69.99, cost: 35.00, stock: 30, minStock: 8, supplierId: suppliers[1].id, status: 'active' },
    { name: 'Coffee Beans - Dark Roast', description: 'Premium dark roast coffee beans, 1lb', sku: 'FOOD-001', barcode: '1234567890129', categoryId: categories[2].id, price: 15.99, cost: 7.00, stock: 60, minStock: 20, status: 'active' },
    { name: 'Organic Tea - Green', description: 'Organic green tea, 20 bags', sku: 'FOOD-002', barcode: '1234567890130', categoryId: categories[2].id, price: 8.99, cost: 4.00, stock: 80, minStock: 25, status: 'active' },
    { name: 'Energy Drink', description: 'Sugar-free energy drink, 16oz', sku: 'FOOD-003', barcode: '1234567890131', categoryId: categories[2].id, price: 2.99, cost: 1.00, stock: 120, minStock: 40, status: 'active' },
    { name: 'Plant Pot - Ceramic', description: 'Medium ceramic plant pot with drainage', sku: 'HOME-001', barcode: '1234567890132', categoryId: categories[3].id, price: 24.99, cost: 12.00, stock: 35, minStock: 10, status: 'active' },
    { name: 'Garden Tools Set', description: '5-piece garden tool set with carrying case', sku: 'HOME-002', barcode: '1234567890133', categoryId: categories[3].id, price: 39.99, cost: 20.00, stock: 20, minStock: 5, status: 'active' },
    { name: 'LED Light Bulb', description: 'Energy-efficient LED bulb, 60W equivalent', sku: 'HOME-003', barcode: '1234567890134', categoryId: categories[3].id, price: 9.99, cost: 4.50, stock: 8, minStock: 15, status: 'active' }
  ]);

  await Customer.bulkCreate([
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-1001', address: '789 Oak Street, Cityville, ST 12345', loyaltyPoints: 150, totalPurchases: 450.00 },
    { name: 'Bob Williams', email: 'bob@example.com', phone: '555-1002', address: '321 Pine Avenue, Townsburg, ST 54321', loyaltyPoints: 200, totalPurchases: 680.00 },
    { name: 'Carol Martinez', email: 'carol@example.com', phone: '555-1003', address: '654 Elm Road, Villageton, ST 67890', loyaltyPoints: 75, totalPurchases: 220.00 },
    { name: 'David Brown', email: 'david@example.com', phone: '555-1004', address: '987 Maple Drive, Hamletville, ST 98765', loyaltyPoints: 300, totalPurchases: 920.00 },
    { name: 'Emma Davis', email: 'emma@example.com', phone: '555-1005', loyaltyPoints: 50, totalPurchases: 150.00 }
  ]);

  await Setting.bulkCreate([
    { key: 'currency', value: 'USD' },
    { key: 'locale', value: 'en-US' },
    { key: 'tax_rate', value: '8' },
    { key: 'tax_inclusive', value: 'false' },
    { key: 'service_charge_enabled', value: 'false' },
    { key: 'service_charge_rate', value: '5' },
    { key: 'rounding_mode', value: 'none' },
    { key: 'default_payment', value: 'cash' },
    { key: 'receipt_auto_print', value: 'false' },
    { key: 'cashier_hide_prices', value: 'false' },
    { key: 'cashier_hide_stock', value: 'false' },
    { key: 'order_types', value: '["Dine-in","Takeaway","Delivery"]' },
    { key: 'store_name', value: 'My Store' },
    { key: 'store_address', value: '' },
    { key: 'store_phone', value: '' },
    { key: 'receipt_footer', value: 'Thank you for your purchase!' }
  ], { ignoreDuplicates: true });

  console.log('Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@pos.com / admin123');
  console.log('Manager: manager@pos.com / manager123');
  console.log('Cashier: cashier@pos.com / cashier123');
};

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/api/health', (req, res) => {
      res.json({ success: true, message: 'POS API is running with SQLite' });
    });

    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/categories', require('./routes/categories'));
    app.use('/api/customers', require('./routes/customers'));
    app.use('/api/sales', require('./routes/sales'));
    app.use('/api/reports', require('./routes/reports'));
    app.use('/api/settings', require('./routes/settings'));
    app.use('/api/audit-logs', require('./routes/auditLogs'));

    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Using SQLite database at server/database.sqlite`);
      console.log(`✓ Frontend available at http://localhost:5173\n`);
    });

  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});

startServer();
