// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// All routes are protected by authMiddleware

// 1. get('invoices')
router.get('/invoices', authMiddleware, reportController.getInvoices);

// 2. get('products')
router.get('/products', authMiddleware, reportController.getProducts);

// 3. get('cashflows')
router.get('/cashflows', authMiddleware, reportController.getCashflows);

// 4. get('ledger')
router.get('/ledger', authMiddleware, reportController.getLedgers);

module.exports = router;