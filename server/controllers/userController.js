const { User } = require('../models');
const auditLog = require('../utils/auditLogger');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const mapped = users.map(u => ({
      _id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);
    const updated = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });

    await auditLog(req.user.id, 'UPDATE', 'User', user.id, { username: user.username, changes: Object.keys(updateData) }, req);
    res.status(200).json({ success: true, data: updated, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.destroy();
    await auditLog(req.user.id, 'DELETE', 'User', user.id, { username: user.username, email: user.email }, req);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};