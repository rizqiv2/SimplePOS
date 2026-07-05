const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  }
}, {
  timestamps: true,
  updatedAt: 'updatedAt'
});

module.exports = Setting;
