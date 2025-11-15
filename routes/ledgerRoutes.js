const express = require("express");
const router = express.Router();
const ledgerController = require("../controllers/ledgerController");

// --- 1. CHANGE THIS LINE ---
// Import the specific functions you need
const { protect, isBusinessMember } = require("../middleware/authMiddleware");

router.use(protect, isBusinessMember);

// --- Customer Routes ---
router.get("/customers", ledgerController.getCustomers);
router.post("/customers", ledgerController.addCustomer);
router.put("/customers/:id", ledgerController.updateCustomer);
router.delete("/customers/:id", ledgerController.deleteCustomer);
// router.post('/customers/:id/send-whatsapp-offer', ledgerController.sendOfferViaWhatsapp);

// --- Transaction Routes ---
router.get("/transactions", ledgerController.getTransactions);
router.post("/transactions", ledgerController.addTransaction);
router.delete("/transactions/:id", ledgerController.deleteTransaction);

// --- Reminder Routes ---
router.get("/reminders", ledgerController.getReminders);
router.post("/reminders", ledgerController.addReminder);
router.put("/reminders/:id", ledgerController.updateReminder);
router.delete("/reminders/:id", ledgerController.deleteReminder);
// router.post('/reminders/:id/send-whatsapp', ledgerController.sendReminderViaWhatsapp);

module.exports = router;