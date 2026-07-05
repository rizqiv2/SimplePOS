const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  parentCategoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Category;
