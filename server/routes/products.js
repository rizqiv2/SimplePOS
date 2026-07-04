const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockProducts
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getProducts);
router.get('/low-stock', auth, getLowStockProducts);
router.get('/:id', auth, getProduct);
router.post('/', auth, authorize('admin', 'manager'), createProduct);
router.put('/:id', auth, authorize('admin', 'manager'), updateProduct);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteProduct);
router.put('/:id/stock', auth, authorize('admin', 'manager'), adjustStock);

module.exports = router;
