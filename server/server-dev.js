const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

let mongoServer;

const startInMemoryMongo = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`In-memory MongoDB started at ${mongoUri}`);
  return mongoUri;
};

const seedDatabase = async () => {
  const User = require('./models/User');
  const Category = require('./models/Category');
  const Product = require('./models/Product');
  const Customer = require('./models/Customer');
  const Supplier = require('./models/Supplier');

  console.log('Seeding database...');

  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await Customer.deleteMany();
  await Supplier.deleteMany();

  const users = await User.create([
    { username: 'admin', email: 'admin@pos.com', password: 'admin123', role: 'admin' },
    { username: 'manager', email: 'manager@pos.com', password: 'manager123', role: 'manager' },
    { username: 'cashier', email: 'cashier@pos.com', password: 'cashier123', role: 'cashier' }
  ]);

  const categories = await Category.create([
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Food & Beverage', description: 'Food and drink products' },
    { name: 'Home & Garden', description: 'Home improvement and garden supplies' }
  ]);

  const suppliers = await Supplier.create([
    { name: 'Tech Supply Co', contact: 'John Smith', email: 'john@techsupply.com', phone: '555-0101', address: '123 Tech Street, Silicon Valley, CA' },
    { name: 'Fashion Distributors', contact: 'Jane Doe', email: 'jane@fashiondist.com', phone: '555-0102', address: '456 Fashion Ave, New York, NY' }
  ]);

  await Product.create([
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', sku: 'ELEC-001', barcode: '1234567890123', category: categories[0]._id, price: 29.99, cost: 15.00, stock: 50, minStock: 10, supplier: suppliers[0]._id, status: 'active' },
    { name: 'USB-C Cable', description: 'High-speed USB-C charging cable, 6ft', sku: 'ELEC-002', barcode: '1234567890124', category: categories[0]._id, price: 12.99, cost: 5.00, stock: 100, minStock: 20, supplier: suppliers[0]._id, status: 'active' },
    { name: 'Bluetooth Headphones', description: 'Noise-cancelling wireless headphones', sku: 'ELEC-003', barcode: '1234567890125', category: categories[0]._id, price: 79.99, cost: 40.00, stock: 25, minStock: 5, supplier: suppliers[0]._id, status: 'active' },
    { name: 'T-Shirt - Blue', description: 'Cotton crew neck t-shirt in blue', sku: 'CLO-001', barcode: '1234567890126', category: categories[1]._id, price: 19.99, cost: 8.00, stock: 75, minStock: 15, supplier: suppliers[1]._id, status: 'active' },
    { name: 'Jeans - Black', description: 'Classic fit denim jeans in black', sku: 'CLO-002', barcode: '1234567890127', category: categories[1]._id, price: 49.99, cost: 25.00, stock: 40, minStock: 10, supplier: suppliers[1]._id, status: 'active' },
    { name: 'Sneakers - White', description: 'Comfortable athletic sneakers', sku: 'CLO-003', barcode: '1234567890128', category: categories[1]._id, price: 69.99, cost: 35.00, stock: 30, minStock: 8, supplier: suppliers[1]._id, status: 'active' },
    { name: 'Coffee Beans - Dark Roast', description: 'Premium dark roast coffee beans, 1lb', sku: 'FOOD-001', barcode: '1234567890129', category: categories[2]._id, price: 15.99, cost: 7.00, stock: 60, minStock: 20, status: 'active' },
    { name: 'Organic Tea - Green', description: 'Organic green tea, 20 bags', sku: 'FOOD-002', barcode: '1234567890130', category: categories[2]._id, price: 8.99, cost: 4.00, stock: 80, minStock: 25, status: 'active' },
    { name: 'Energy Drink', description: 'Sugar-free energy drink, 16oz', sku: 'FOOD-003', barcode: '1234567890131', category: categories[2]._id, price: 2.99, cost: 1.00, stock: 120, minStock: 40, status: 'active' },
    { name: 'Plant Pot - Ceramic', description: 'Medium ceramic plant pot with drainage', sku: 'HOME-001', barcode: '1234567890132', category: categories[3]._id, price: 24.99, cost: 12.00, stock: 35, minStock: 10, status: 'active' },
    { name: 'Garden Tools Set', description: '5-piece garden tool set with carrying case', sku: 'HOME-002', barcode: '1234567890133', category: categories[3]._id, price: 39.99, cost: 20.00, stock: 20, minStock: 5, status: 'active' },
    { name: 'LED Light Bulb', description: 'Energy-efficient LED bulb, 60W equivalent', sku: 'HOME-003', barcode: '1234567890134', category: categories[3]._id, price: 9.99, cost: 4.50, stock: 8, minStock: 15, status: 'active' }
  ]);

  await Customer.create([
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-1001', address: '789 Oak Street, Cityville, ST 12345', loyaltyPoints: 150, totalPurchases: 450.00 },
    { name: 'Bob Williams', email: 'bob@example.com', phone: '555-1002', address: '321 Pine Avenue, Townsburg, ST 54321', loyaltyPoints: 200, totalPurchases: 680.00 },
    { name: 'Carol Martinez', email: 'carol@example.com', phone: '555-1003', address: '654 Elm Road, Villageton, ST 67890', loyaltyPoints: 75, totalPurchases: 220.00 },
    { name: 'David Brown', email: 'david@example.com', phone: '555-1004', address: '987 Maple Drive, Hamletville, ST 98765', loyaltyPoints: 300, totalPurchases: 920.00 },
    { name: 'Emma Davis', email: 'emma@example.com', phone: '555-1005', loyaltyPoints: 50, totalPurchases: 150.00 }
  ]);

  console.log('Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@pos.com / admin123');
  console.log('Manager: manager@pos.com / manager123');
  console.log('Cashier: cashier@pos.com / cashier123');
};

const startServer = async () => {
  try {
    const mongoUri = await startInMemoryMongo();

    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');

    await seedDatabase();

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/api/health', (req, res) => {
      res.json({ success: true, message: 'POS API is running' });
    });

    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/categories', require('./routes/categories'));
    app.use('/api/customers', require('./routes/customers'));
    app.use('/api/sales', require('./routes/sales'));
    app.use('/api/reports', require('./routes/reports'));

    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend will be available at http://localhost:5173\n`);
    });

  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

startServer();
