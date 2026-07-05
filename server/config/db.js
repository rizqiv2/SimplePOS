const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected');
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
