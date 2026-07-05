const { Product, Category, Supplier } = require('../models');
const { Op, where: seqWhere, col } = require('sequelize');

exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category) where.categoryId = category;
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
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

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.update(req.body);
    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.update({ status: 'inactive' });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.adjustStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide quantity' });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.update({ stock: quantity });
    res.status(200).json({ success: true, data: product, message: 'Stock adjusted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: {
        [Op.and]: [
          { status: 'active' },
          seqWhere(col('stock'), '<', col('minStock'))
        ]
      },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};