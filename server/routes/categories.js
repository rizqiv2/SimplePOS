const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getCategories);
router.get('/:id', auth, getCategory);
router.post('/', auth, authorize('admin', 'manager'), createCategory);
router.put('/:id', auth, authorize('admin', 'manager'), updateCategory);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteCategory);

module.exports = router;
