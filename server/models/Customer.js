const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPurchases: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  lastPurchase: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Customer;
