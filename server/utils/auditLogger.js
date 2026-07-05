const { AuditLog } = require('../models');

const auditLog = async (userId, action, resource, resourceId, details, req) => {
  try {
    await AuditLog.create({
      userId: userId || null,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      details: details ? JSON.stringify(details) : null,
      ip: req?.ip || req?.connection?.remoteAddress || null
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = auditLog;
