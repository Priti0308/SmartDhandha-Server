const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, isBusinessMember } = require("../middleware/authMiddleware");

router.use(protect, isBusinessMember);

// --- Existing Routes ---
router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-chart', dashboardController.getSalesChartData);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/low-stock', dashboardController.getLowStockItems);

// --- NEW Routes for Advanced Dashboard ---
router.get('/overdue-invoices', dashboardController.getOverdueInvoices);
router.get('/top-selling-products', dashboardController.getTopSellingProducts);
router.get('/income-expense-chart', dashboardController.getIncomeVsExpenseChartData);

module.exports = router;