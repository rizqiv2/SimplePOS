const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const generateTransactionId = require('../utils/transactionId');

exports.createSale = async (req, res, next) => {
  try {
    const { items, customer, subtotal, tax, discount, total, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item'
      });
    }

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
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
      customer: customer || null,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      cashier: req.user._id,
      status: 'completed'
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    if (customer) {
      const loyaltyPoints = Math.floor(total / 10);
      await Customer.findByIdAndUpdate(
        customer,
        {
          $inc: {
            loyaltyPoints: loyaltyPoints,
            totalPurchases: total
          },
          lastPurchase: new Date()
        }
      );
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('items.product', 'name sku')
      .populate('customer', 'name email')
      .populate('cashier', 'username');

    res.status(201).json({
      success: true,
      data: populatedSale,
      message: 'Sale completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      cashier,
      status,
      paymentMethod,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (cashier) query.cashier = cashier;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const sales = await Sale.find(query)
      .populate('items.product', 'name sku')
      .populate('customer', 'name')
      .populate('cashier', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name sku price')
      .populate('customer', 'name email phone')
      .populate('cashier', 'username email');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

exports.holdTransaction = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status: 'hold' },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
      message: 'Transaction placed on hold'
    });
  } catch (error) {
    next(error);
  }
};

exports.completeTransaction = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
      message: 'Transaction completed'
    });
  } catch (error) {
    next(error);
  }
};

exports.voidTransaction = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    if (sale.customer) {
      const loyaltyPoints = Math.floor(sale.total / 10);
      await Customer.findByIdAndUpdate(
        sale.customer,
        {
          $inc: {
            loyaltyPoints: -loyaltyPoints,
            totalPurchases: -sale.total
          }
        }
      );
    }

    sale.status = 'void';
    await sale.save();

    res.status(200).json({
      success: true,
      message: 'Transaction voided successfully'
    });
  } catch (error) {
    next(error);
  }
};
