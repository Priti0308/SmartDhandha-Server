const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

const { protect, isBusinessMember } = require('../middleware/authMiddleware');

router.get('/invoices', protect, isBusinessMember, reportController.getInvoices);

router.get('/products', protect, isBusinessMember, reportController.getProducts);

router.get('/cashflows', protect, isBusinessMember, reportController.getCashflows);

router.get('/ledger', protect, isBusinessMember, reportController.getLedgers);

module.exports = router;