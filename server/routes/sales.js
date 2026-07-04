const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSale,
  holdTransaction,
  completeTransaction,
  voidTransaction
} = require('../controllers/salesController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, createSale);
router.get('/', auth, getSales);
router.get('/:id', auth, getSale);
router.put('/:id/hold', auth, holdTransaction);
router.put('/:id/complete', auth, completeTransaction);
router.put('/:id/void', auth, authorize('admin', 'manager'), voidTransaction);

module.exports = router;
