// controllers/reportController.js

// Import your models (THIS MUST BE CORRECT)
const { Invoice, Product, Cashflow } = require('../models/Inventory'); 
const { Transaction, Customer } = require('../models/Ledger'); 

/**
 * Controller to fetch all sales and purchase invoices
 */
const getInvoices = async (req, res) => {
    try {
        const vendorId = req.user.id; // 👈 CHANGED from req.user.userId
        const invoices = await Invoice.find({ 
            userId: vendorId, 
            type: { $in: ['sale', 'purchase'] } 
        }).lean();
        res.status(200).json(invoices);
    } catch (error) {
        console.error("Error fetching invoices for reports:", error);
        res.status(500).json({ message: "Failed to fetch invoices data." });
    }
};

/**
 * Controller to fetch all product inventory items
 */
const getProducts = async (req, res) => {
    try {
        const vendorId = req.user.id; // 👈 CHANGED from req.user.userId
        const products = await Product.find({ 
            userId: vendorId 
        }).lean(); 
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products for reports:", error);
        res.status(500).json({ message: "Failed to fetch products data." });
    }
};

/**
 * Controller to fetch all cashflow entries
 */
const getCashflows = async (req, res) => {
    try {
        const vendorId = req.user.id; // 👈 CHANGED from req.user.userId
        const cashflows = await Cashflow.find({ 
            userId: vendorId 
        }).lean(); 
        res.status(200).json(cashflows);
    } catch (error) {
        console.error("Error fetching cashflows for reports:", error);
        res.status(500).json({ message: "Failed to fetch cashflows data." });
    }
};

/**
 * 🚨 UNCHANGED: Controller to fetch all ledger transactions
 * We leave this as req.user.userId because you said it works.
 */
const getLedgers = async (req, res) => {
    try {
        const vendorId = req.user.userId; // 👈 KEPT AS IS
        
        const ledgers = await Transaction.find({ 
            userId: vendorId 
        })
        .populate('customerId', 'name') 
        .lean(); 

        const formattedLedgers = ledgers.map(t => ({
            _id: t._id,
            date: t.date,
            type: t.type,
            amount: t.amount,
            note: t.note,
            customerName: t.customerId.name, 
           customerId: t.customerId._id
        }));

        res.status(200).json(formattedLedgers);
    } catch (error) {
        console.error("Error fetching ledgers for reports:", error);
        res.status(500).json({ message: "Failed to fetch ledger data." });
    }
};

module.exports = {
    getInvoices,
    getProducts,
    getCashflows,
    getLedgers,
};