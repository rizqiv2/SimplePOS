const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchases,
  updateLoyaltyPoints
} = require('../controllers/customerController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getCustomers);
router.get('/:id', auth, getCustomer);
router.post('/', auth, authorize('admin', 'manager', 'cashier'), createCustomer);
router.put('/:id', auth, authorize('admin', 'manager'), updateCustomer);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteCustomer);
router.get('/:id/purchases', auth, getCustomerPurchases);
router.put('/:id/points', auth, authorize('admin', 'manager'), updateLoyaltyPoints);

module.exports = router;
