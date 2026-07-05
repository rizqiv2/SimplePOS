const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Customers',
      key: 'id'
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'multiple'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('completed', 'pending', 'failed'),
    defaultValue: 'completed'
  },
  cashierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('completed', 'hold', 'void'),
    defaultValue: 'completed'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Sale;
