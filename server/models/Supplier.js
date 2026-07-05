const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING
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
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Supplier;
