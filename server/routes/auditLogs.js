const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, authorize('admin'), getAuditLogs);

module.exports = router;
