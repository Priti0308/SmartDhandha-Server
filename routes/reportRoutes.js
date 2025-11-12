const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// --- 1. CHANGE THIS LINE ---
// Import the specific middleware functions you need
const { protect, isBusinessMember } = require('../middleware/authMiddleware');

// All routes are protected by middleware

// 1. get('invoices')
// --- 2. UPDATE THIS LINE ---
router.get('/invoices', protect, isBusinessMember, reportController.getInvoices);

// 2. get('products')
// --- 3. UPDATE THIS LINE ---
router.get('/products', protect, isBusinessMember, reportController.getProducts);

// 3. get('cashflows')
// --- 4. UPDATE THIS LINE ---
router.get('/cashflows', protect, isBusinessMember, reportController.getCashflows);

// 4. get('ledger')
// --- 5. UPDATE THIS LINE ---
router.get('/ledger', protect, isBusinessMember, reportController.getLedgers);

module.exports = router;