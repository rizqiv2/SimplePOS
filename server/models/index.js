const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Customer = require('./Customer');
const Sale = require('./Sale');
const Supplier = require('./Supplier');
const Setting = require('./Setting');
const AuditLog = require('./AuditLog');

// Set up associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });

Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });

Sale.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });
User.hasMany(Sale, { foreignKey: 'cashierId', as: 'sales' });

Category.belongsTo(Category, { foreignKey: 'parentCategoryId', as: 'parentCategory' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Product,
  Category,
  Customer,
  Sale,
  Supplier,
  Setting,
  AuditLog
};
