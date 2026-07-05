const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getSettings);
router.put('/', auth, authorize('admin'), updateSettings);

module.exports = router;
