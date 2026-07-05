const { Customer, Sale } = require('../models');
const { Op } = require('sequelize');

exports.getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    await customer.update(req.body);
    res.status(200).json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    await customer.destroy();
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerPurchases = async (req, res, next) => {
  try {
    const purchases = await Sale.findAll({
      where: { customerId: req.params.id, status: 'completed' },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    next(error);
  }
};

exports.updateLoyaltyPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    if (points === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide points' });
    }

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.update({ loyaltyPoints: points });
    res.status(200).json({ success: true, data: customer, message: 'Loyalty points updated successfully' });
  } catch (error) {
    next(error);
  }
};