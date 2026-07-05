const { Sale, Product, Customer, User } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getSalesSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, cashierId } = req.query;
    const where = { status: 'completed' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    if (cashierId) where.cashierId = cashierId;

    const summary = await Sale.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalSales'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'totalRevenue'],
        [fn('COALESCE', fn('AVG', col('total')), 0), 'averageOrderValue'],
        [fn('COALESCE', fn('SUM', col('discount')), 0), 'totalDiscount'],
        [fn('COALESCE', fn('SUM', col('tax')), 0), 'totalTax']
      ],
      raw: true
    });

    const paymentMethodBreakdown = await Sale.findAll({
      where,
      attributes: [
        'paymentMethod',
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'total']
      ],
      group: ['paymentMethod'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        summary: summary || { totalSales: 0, totalRevenue: 0, averageOrderValue: 0, totalDiscount: 0, totalTax: 0 },
        paymentMethods: paymentMethodBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRevenue = async (req, res, next) => {
  try {
    const where = { status: 'completed' };
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
      if (req.query.endDate) where.createdAt[Op.lte] = new Date(req.query.endDate);
    }

    const revenue = await Sale.findAll({
      where,
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'revenue'],
        [fn('COUNT', col('id')), 'sales']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    const result = revenue.map(r => ({
      _id: r.date,
      revenue: parseFloat(r.revenue),
      sales: parseInt(r.sales)
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const where = { status: 'completed' };
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
      if (req.query.endDate) where.createdAt[Op.lte] = new Date(req.query.endDate);
    }

    const sales = await Sale.findAll({ where, raw: true });
    const productMap = {};

    for (const sale of sales) {
      const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
      for (const item of items) {
        if (!productMap[item.product]) {
          productMap[item.product] = { productId: item.product, productName: item.productName || 'Unknown', totalQuantity: 0, totalRevenue: 0, timesSold: 0 };
        }
        productMap[item.product].totalQuantity += item.quantity;
        productMap[item.product].totalRevenue += item.subtotal || (item.price * item.quantity);
        productMap[item.product].timesSold += 1;
      }
    }

    const limit = parseInt(req.query.limit || 10);
    const topProducts = Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);
    res.status(200).json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};

exports.getInventoryValue = async (req, res, next) => {
  try {
    const products = await Product.findAll({ where: { status: 'active' }, raw: true });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalCostValue = products.reduce((sum, p) => sum + (parseFloat(p.cost || 0) * p.stock), 0);
    const totalRetailValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0);
    const lowStockCount = products.filter(p => p.stock < p.minStock).length;

    const categoryMap = {};
    for (const p of products) {
      const catId = p.categoryId || 'uncategorized';
      if (!categoryMap[catId]) categoryMap[catId] = { _id: catId, category: null, count: 0, totalStock: 0, value: 0 };
      categoryMap[catId].count += 1;
      categoryMap[catId].totalStock += p.stock;
      categoryMap[catId].value += parseFloat(p.price) * p.stock;
    }

    res.status(200).json({
      success: true,
      data: { summary: { totalProducts, totalStock, totalCostValue, totalRetailValue }, lowStockCount, byCategory: Object.values(categoryMap) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCashierPerformance = async (req, res, next) => {
  try {
    const where = { status: 'completed' };
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
      if (req.query.endDate) where.createdAt[Op.lte] = new Date(req.query.endDate);
    }

    const performance = await Sale.findAll({
      where,
      attributes: ['cashierId', [fn('COUNT', col('id')), 'totalSales'], [fn('COALESCE', fn('SUM', col('total')), 0), 'totalRevenue'], [fn('COALESCE', fn('AVG', col('total')), 0), 'averageOrderValue']],
      group: ['cashierId'],
      raw: true
    });

    const users = await User.findAll({ attributes: ['id', 'username'], raw: true });
    const userMap = {};
    for (const u of users) userMap[u.id] = u.username;

    const result = performance.map(p => ({
      _id: p.cashierId,
      cashier: { username: userMap[p.cashierId] || 'Unknown' },
      totalSales: parseInt(p.totalSales),
      totalRevenue: parseFloat(p.totalRevenue),
      averageOrderValue: parseFloat(p.averageOrderValue)
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};