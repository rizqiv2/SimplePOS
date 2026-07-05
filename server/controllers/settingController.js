const { Setting } = require('../models');
const auditLog = require('../utils/auditLogger');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findAll({ raw: true });
    const map = {};
    for (const s of settings) map[s.key] = s.value;
    res.status(200).json({ success: true, data: map });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const entries = req.body;
    for (const key of Object.keys(entries)) {
      await Setting.upsert({ key, value: String(entries[key]) });
    }
    const settings = await Setting.findAll({ raw: true });
    const map = {};
    for (const s of settings) map[s.key] = s.value;
    await auditLog(req.user.id, 'UPDATE', 'Setting', null, { changes: entries }, req);
    res.status(200).json({ success: true, data: map, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};
