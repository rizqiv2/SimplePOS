const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  supplierId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Suppliers',
      key: 'id'
    }
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  updatedAt: 'updatedAt'
});

module.exports = Product;
