const { Sale, Product, Customer } = require('../models');
const { Op } = require('sequelize');
const auditLog = require('../utils/auditLogger');

const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

exports.createSale = async (req, res, next) => {
  try {
    const { items, customerId, subtotal, tax, discount, serviceCharge, orderType, total, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one item' });
    }

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }
    }

    const transactionId = generateTransactionId();
    const saleItems = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    const sale = await Sale.create({
      transactionId,
      items: saleItems,
      customerId: customerId || null,
      subtotal,
      tax,
      discount,
      serviceCharge: serviceCharge || 0,
      orderType: orderType || 'Dine-in',
      total,
      paymentMethod,
      cashierId: req.user.id,
      status: 'completed'
    });

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      await product.update({ stock: product.stock - item.quantity });
    }

    if (customerId) {
      const customer = await Customer.findByPk(customerId);
      if (customer) {
        const loyaltyPoints = Math.floor(total / 10);
        await customer.update({
          loyaltyPoints: customer.loyaltyPoints + loyaltyPoints,
          totalPurchases: parseFloat(customer.totalPurchases) + parseFloat(total),
          lastPurchase: new Date()
        });
      }
    }

    await auditLog(req.user.id, 'CREATE', 'Sale', sale.id, { transactionId: sale.transactionId, total: sale.total, paymentMethod: sale.paymentMethod, orderType: sale.orderType }, req);
    res.status(201).json({ success: true, data: sale, message: 'Sale completed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, cashierId, status, paymentMethod, page = 1, limit = 20 } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    if (cashierId) where.cashierId = cashierId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const offset = (page - 1) * limit;
    const { count, rows } = await Sale.findAndCountAll({
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

exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

exports.holdTransaction = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    await sale.update({ status: 'hold' });
    res.status(200).json({ success: true, data: sale, message: 'Transaction placed on hold' });
  } catch (error) {
    next(error);
  }
};

exports.completeTransaction = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    await sale.update({ status: 'completed' });
    res.status(200).json({ success: true, data: sale, message: 'Transaction completed' });
  } catch (error) {
    next(error);
  }
};

exports.voidTransaction = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    const items = sale.items;
    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (product) {
        await product.update({ stock: product.stock + item.quantity });
      }
    }

    if (sale.customerId) {
      const customer = await Customer.findByPk(sale.customerId);
      if (customer) {
        const loyaltyPoints = Math.floor(sale.total / 10);
        await customer.update({
          loyaltyPoints: Math.max(0, customer.loyaltyPoints - loyaltyPoints),
          totalPurchases: Math.max(0, parseFloat(customer.totalPurchases) - parseFloat(sale.total))
        });
      }
    }

    await sale.update({ status: 'void' });
    await auditLog(req.user.id, 'VOID', 'Sale', sale.id, { transactionId: sale.transactionId, total: sale.total }, req);
    res.status(200).json({ success: true, message: 'Transaction voided successfully' });
  } catch (error) {
    next(error);
  }
};