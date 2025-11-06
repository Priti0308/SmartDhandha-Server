const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController'); 
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication to all inventory routes
router.use(authMiddleware);

// --- Product Routes ---
router.get("/products", inventoryController.getProducts);
router.post("/products", inventoryController.addProduct);
router.put("/products/:id", inventoryController.updateProduct);
router.delete("/products/:id", inventoryController.deleteProduct);

// --- Invoice Routes (Sales & Purchases) ---
router.get("/invoices", inventoryController.getInvoices);
router.post("/invoices", inventoryController.addInvoice);
router.post("/invoices/:id/payments", inventoryController.recordInvoicePayment);
router.delete("/invoices/:id", inventoryController.deleteInvoice);


// --- Cashflow Routes ---
router.get("/cashflows", inventoryController.getCashflows);
router.post("/cashflows", inventoryController.addCashflow);
router.delete("/cashflows/:id", inventoryController.deleteCashflow);

// --- Supplier Routes ---
router.get("/suppliers", inventoryController.getSuppliers);
router.post("/suppliers", inventoryController.addSupplier);
router.put("/suppliers/:id", inventoryController.updateSupplier);
router.delete("/suppliers/:id", inventoryController.deleteSupplier);

// --- Customer Routes ---
router.get("/customers", inventoryController.getCustomers);
router.post("/customers", inventoryController.addCustomer);
router.put("/customers/:id", inventoryController.updateCustomer);
router.delete("/customers/:id", inventoryController.deleteCustomer);

module.exports = router;
