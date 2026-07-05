const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, userId, page = 1, limit = 50 } = req.query;
    const where = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (userId) where.userId = userId;

    const offset = (page - 1) * limit;
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
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
