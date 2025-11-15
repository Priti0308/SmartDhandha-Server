// Import all models required
const { Product, Cashflow, Invoice, Supplier, InventoryCustomer } = require("../models/Inventory");
const mongoose = require('mongoose');

// Helper function for ObjectId validation
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Customer Controllers
// --- Customer Controllers (ADD THIS ENTIRE NEW SECTION) ---
exports.getCustomers = async (req, res) => {
  try {
    const customers = await InventoryCustomer.find({ userId: req.user.id }).sort({ name: 1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
};

exports.addCustomer = async (req, res) => {
  try {
    const existing = await InventoryCustomer.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        userId: req.user.id
    });
    if (existing) {
        return res.status(400).json({ message: `A customer with the name '${req.body.name}' already exists.` });
    }
    const newCustomer = new InventoryCustomer({ ...req.body, userId: req.user.id });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error adding customer:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: "Validation Failed", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to add customer", error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid customer ID format" });
  }
  try {
    const updatedCustomer = await InventoryCustomer.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found or you do not have permission" });
    }
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid customer ID format" });
    }
    try {
        const customerToDelete = await InventoryCustomer.findOne({ _id: id, userId: req.user.id });
        if (!customerToDelete) {
            return res.status(404).json({ message: "Customer not found or you do not have permission." });
        }

        // Check if customer is used in any sale invoices
        const saleInvoiceExists = await Invoice.findOne({
            type: "sale",
            customerName: customerToDelete.name,
            userId: req.user.id
        });

        if (saleInvoiceExists) {
            return res.status(400).json({ message: "Cannot delete customer: They are linked to existing sales invoices." });
        }

        await InventoryCustomer.findByIdAndDelete(id);
        res.status(200).json({ message: "Customer deleted successfully", id: id });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: "Failed to delete customer", error: error.message });
    }
};

// --- Product Controllers ---
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id }).sort({ name: 1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body, userId: req.user.id });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
     console.error("Error adding product:", error);
     if (error.name === 'ValidationError') {
       console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
       return res.status(400).json({ message: "Validation Failed", errors: error.errors });
     }
     if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
       return res.status(400).json({ message: `Product with SKU '${error.keyValue.sku}' already exists.` });
     }
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
     return res.status(400).json({ message: "Invalid product ID format" });
  }
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found or you do not have permission" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
     console.error("Error updating product:", error);
     if (error.name === 'ValidationError') {
       console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
       return res.status(400).json({ message: "Validation Failed", errors: error.errors });
     }
     if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
       return res.status(400).json({ message: `Product with SKU '${error.keyValue.sku}' already exists.` });
     }
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
       return res.status(400).json({ message: "Invalid product ID format" });
    }
  try {
    const invoiceUsingProduct = await Invoice.findOne({ "items.productId": id, userId: req.user.id });
    if (invoiceUsingProduct) {
        return res.status(400).json({ message: "Cannot delete product: It is associated with your existing invoices/bills." });
    }

    const deletedProduct = await Product.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found or you do not have permission" });
    }
    res.status(200).json({ message: "Product deleted successfully", id: id });
  } catch (error) {
     console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

// --- Invoice Controllers ---

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
     console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Error fetching invoices", error: error.message });
  }
};

exports.addInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;
        const newInvoiceData = { ...invoiceData, userId: req.user.id, paidAmount: 0, paymentStatus: 'unpaid' };

        if (!newInvoiceData.items || !Array.isArray(newInvoiceData.items) || newInvoiceData.items.length === 0) {
            throw new Error("Invoice must contain at least one item.");
        }
        if (!newInvoiceData.customerName || typeof newInvoiceData.customerName !== 'string' || newInvoiceData.customerName.trim() === '') {
             throw new Error("Customer or Supplier name is required.");
        }

        for (const item of newInvoiceData.items) {
            if (!item.productId || !isValidObjectId(item.productId)) {
                 throw new Error(`Invalid or missing productId in invoice items: ${item.productId || 'undefined'}`);
            }
            const product = await Product.findOne({ _id: item.productId, userId: req.user.id });
            if (!product) {
                 throw new Error(`Product with ID ${item.productId} (${item.name || 'N/A'}) not found or you do not have permission.`);
            }
            const quantityChange = Number(item.qty);
            if (isNaN(quantityChange) || quantityChange <= 0) {
                throw new Error(`Invalid quantity (${item.qty}) for item ${item.name || item.productId}.`);
            }
            if (newInvoiceData.type === "sale" && product.stock < quantityChange) {
                 throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${quantityChange}.`);
            }
        }

        const newInvoice = new Invoice(newInvoiceData);
        await newInvoice.save();

        for (const item of newInvoice.items) {
            const quantityChange = Number(item.qty);
            const updateOperation = newInvoice.type === "sale"
                ? { $inc: { stock: -quantityChange } }
                : { $inc: { stock: +quantityChange } };
            await Product.findByIdAndUpdate(item.productId, updateOperation);
        }

        res.status(201).json(newInvoice.toJSON());

    } catch (error) {
        console.error("Error adding invoice:", error.message);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: "Invoice Validation Failed", error: error.message, details: error.errors });
        }
        if (error.message.includes("Invoice must contain") || error.message.includes("Insufficient stock")) {
             return res.status(400).json({ message: error.message, error: error.message });
        }
        res.status(500).json({ message: "Failed to add invoice due to an unexpected error.", error: error.message });
    }
};

// highlight-start
// --- UPDATED CONTROLLER: Delete Invoice (Without Transactions) ---
exports.deleteInvoice = async (req, res) => {
    const { id: invoiceId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(invoiceId)) {
        return res.status(400).json({ message: "Invalid Invoice ID format." });
    }

    try {
        // 1. Find the invoice to be deleted
        const invoice = await Invoice.findOne({ _id: invoiceId, userId });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found or you do not have permission." });
        }

        // 2. Reverse the stock changes for each item in the invoice
        for (const item of invoice.items) {
            const quantityChange = Number(item.qty);
            const stockUpdate = invoice.type === 'sale' ? quantityChange : -quantityChange;
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: stockUpdate } });
        }

        // 3. Delete all cashflow entries (payments) linked to this invoice
        await Cashflow.deleteMany({ invoiceId: invoiceId, userId });

        // 4. Delete the invoice itself
        await Invoice.findByIdAndDelete(invoiceId);

        res.status(200).json({ message: "Invoice and related records deleted successfully!", id: invoiceId });

    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: "Failed to delete invoice due to a server error.", error: error.message });
    }
};
// highlight-end

exports.recordInvoicePayment = async (req, res) => {
    const { id: invoiceId } = req.params;
    const { amount, date, paymentMethod, note } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(invoiceId)) {
        return res.status(400).json({ message: "Invalid Invoice ID format" });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount." });
    }

    try {
        const invoice = await Invoice.findOne({ _id: invoiceId, userId: userId });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found or you do not have permission." });
        }

        const balanceDue = invoice.balanceDue;
        if (paymentAmount > balanceDue + 0.01) {
            return res.status(400).json({ message: `Payment amount (₹${paymentAmount.toFixed(2)}) exceeds balance due (₹${balanceDue.toFixed(2)}).` });
        }

        const cashflowEntry = new Cashflow({
            userId: userId,
            invoiceId: invoice._id,
            kind: invoice.type === 'sale' ? 'income' : 'expense',
            date: date || new Date().toISOString().slice(0, 10),
            category: invoice.type === 'sale' ? 'Payment Received' : 'Payment Made',
            amount: paymentAmount,
            paymentMethod: paymentMethod || 'Cash',
            note: note || `Payment for ${invoice.type === 'sale' ? 'Invoice' : 'Bill'} #${invoice._id.toString().slice(-6)} (${invoice.customerName})`,
        });
        await cashflowEntry.save();

        invoice.paidAmount += paymentAmount;
        const newBalanceDue = invoice.balanceDue;
        if (Math.abs(newBalanceDue) < 0.01) {
            invoice.paymentStatus = 'paid';
        } else if (invoice.paidAmount > 0) {
            invoice.paymentStatus = 'partially_paid';
        } else {
            invoice.paymentStatus = 'unpaid';
        }

        const updatedInvoice = await invoice.save();

        res.status(200).json({
            message: "Payment recorded successfully!",
            updatedInvoice: updatedInvoice.toJSON(),
            cashflowEntry: cashflowEntry.toJSON()
        });

    } catch (error) {
        console.error("Error recording payment:", error);
        res.status(500).json({ message: "Failed to record payment", error: error.message });
    }
};


// --- Cashflow Controllers ---
exports.getCashflows = async (req, res) => {
  try {
    const cashflows = await Cashflow.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.status(200).json(cashflows);
  } catch (error) {
     console.error("Error fetching cashflows:", error);
    res.status(500).json({ message: "Error fetching cashflow entries", error: error.message });
  }
};

exports.addCashflow = async (req, res) => {
  try {
    const { invoiceId, ...cashflowData } = req.body;
    const newCashflow = new Cashflow({ ...cashflowData, userId: req.user.id });
    await newCashflow.save();
    res.status(201).json(newCashflow);
  } catch (error) {
     console.error("Error adding cashflow:", error);
     if (error.name === 'ValidationError') {
         console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
         return res.status(400).json({ message: "Validation Failed", errors: error.errors });
     }
    res.status(500).json({ message: "Failed to add cashflow entry", error: error.message });
  }
};

exports.deleteCashflow = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
       return res.status(400).json({ message: "Invalid cashflow ID format" });
    }
  try {
    const cashflowToDelete = await Cashflow.findOne({ _id: id, userId: req.user.id });
     if (!cashflowToDelete) {
       return res.status(404).json({ message: "Cashflow entry not found or you do not have permission" });
     }

     if (cashflowToDelete.invoiceId) {
         const relatedInvoice = await Invoice.findOne({ _id: cashflowToDelete.invoiceId, userId: req.user.id });
         if (relatedInvoice) {
             relatedInvoice.paidAmount = Math.max(0, relatedInvoice.paidAmount - cashflowToDelete.amount);

             const newBalanceDue = relatedInvoice.totalGrand - relatedInvoice.paidAmount;
             if (Math.abs(newBalanceDue) < 0.01) relatedInvoice.paymentStatus = 'paid';
             else if (relatedInvoice.paidAmount > 0) relatedInvoice.paymentStatus = 'partially_paid';
             else relatedInvoice.paymentStatus = 'unpaid';

             await relatedInvoice.save();
         }
     }

    await Cashflow.findByIdAndDelete(id);
    res.status(200).json({ message: "Cashflow entry deleted successfully", id: id });
  } catch (error) {
     console.error("Error deleting cashflow:", error);
    res.status(500).json({ message: "Failed to delete cashflow entry", error: error.message });
  }
};


// --- Supplier Controllers ---
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user.id }).sort({ name: 1 });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Error fetching suppliers", error: error.message });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    const existing = await Supplier.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        userId: req.user.id
    });
    if (existing) {
        return res.status(400).json({ message: `Supplier with name '${req.body.name}' already exists.` });
    }

    const newSupplier = new Supplier({ ...req.body, userId: req.user.id });
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("Error adding supplier:", error);
    if (error.name === 'ValidationError') {
        console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Validation Failed", errors: error.errors });
    }
     if (error.code === 11000) {
         return res.status(400).json({ message: "Supplier name must be unique for your account." });
     }
    res.status(500).json({ message: "Failed to add supplier", error: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
     return res.status(400).json({ message: "Invalid supplier ID format" });
  }
  try {
    if (req.body.name) {
        const existing = await Supplier.findOne({
            name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
            _id: { $ne: id },
            userId: req.user.id
        });
        if (existing) {
            return res.status(400).json({ message: `Another supplier with name '${req.body.name}' already exists.` });
        }
    }

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found or you do not have permission" });
    }
    res.status(200).json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
     if (error.name === 'ValidationError') {
         console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Validation Failed", errors: error.errors });
     }
     if (error.code === 11000) {
         return res.status(400).json({ message: "Supplier name must be unique for your account." });
     }
    res.status(500).json({ message: "Failed to update supplier", error: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
       return res.status(400).json({ message: "Invalid supplier ID format" });
    }
  try {
    const supplierToDelete = await Supplier.findOne({ _id: id, userId: req.user.id });
    if (!supplierToDelete) {
        return res.status(404).json({ message: "Supplier not found or you do not have permission" });
    }

    const purchaseBillUsingSupplier = await Invoice.findOne({
        type: "purchase",
        customerName: supplierToDelete.name,
        userId: req.user.id
    });
    if (purchaseBillUsingSupplier) {
        return res.status(400).json({ message: "Cannot delete supplier: They are associated with your existing purchase bills." });
    }

    await Supplier.findByIdAndDelete(id);
    res.status(200).json({ message: "Supplier deleted successfully", id: id });
  } catch (error) {
     console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Failed to delete supplier", error: error.message });
  }
};