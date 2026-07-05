const express = require('express');
const router = express.Router();
const {
  getSalesSummary,
  getRevenue,
  getTopProducts,
  getInventoryValue,
  getCashierPerformance
} = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/sales-summary', auth, authorize('admin', 'manager', 'cashier'), getSalesSummary);
router.get('/revenue', auth, authorize('admin', 'manager'), getRevenue);
router.get('/top-products', auth, authorize('admin', 'manager'), getTopProducts);
router.get('/inventory-value', auth, authorize('admin', 'manager'), getInventoryValue);
router.get('/cashier-performance', auth, authorize('admin', 'manager'), getCashierPerformance);

module.exports = router;
