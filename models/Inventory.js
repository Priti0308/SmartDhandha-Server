const mongoose = require("mongoose");

// =================================================================================
// 1. Product Model
// =================================================================================
const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: "" },
  sku: { type: String, default: "", trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, default: 18, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStock: { type: Number, default: 5, min: 0 },
  image: { type: String, default: "" },
});

const Product = mongoose.model("Product", productSchema);

// =================================================================================
// 2. Cashflow Model
// =================================================================================
const cashflowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // --- NEW: Optional link to the related invoice ---
  invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true, // Index if you query cashflows by invoice
      default: null
  },
  // ---
  kind: { type: String, enum: ["income", "expense"], required: true },
  date: { type: String, required: true }, // Consider using Date type
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, default: 'Cash', trim: true }, // Added payment method
  note: { type: String, trim: true },
}, { timestamps: true }); // Added timestamps

const Cashflow = mongoose.model("Cashflow", cashflowSchema);

// =================================================================================
// 3. Invoice Model
// =================================================================================
const invoiceItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 0.0001 },
  price: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
}, {_id: false});

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: { type: String, enum: ["sale", "purchase"], required: true },
  date: { type: String, required: true },
  customerName: { type: String, required: true, trim: true },
  items: [invoiceItemSchema],
  note: { type: String, trim: true },
  subtotal: { type: Number, required: true },
  totalGST: { type: Number, required: true },
  totalGrand: { type: Number, required: true },
  // --- NEW: Payment Tracking Fields ---
  paidAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
  },
  paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid'],
      default: 'unpaid',
      required: true,
      index: true // Index for filtering invoices by status
  },
  // ---
}, { timestamps: true });

// Virtual to calculate remaining balance (doesn't store in DB, calculated on fetch)
invoiceSchema.virtual('balanceDue').get(function() {
  return this.totalGrand - this.paidAmount;
});

// Ensure virtuals are included when converting to JSON
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });


const Invoice = mongoose.model("Invoice", invoiceSchema);

// =================================================================================
// 4. Supplier Model
// =================================================================================
const supplierSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, default: "", trim: true },
  phone: { type: String, default: "", trim: true },
  email: { type: String, default: "", trim: true, lowercase: true },
}, { timestamps: true });

const Supplier = mongoose.model("Supplier", supplierSchema);

// =================================================================================
// 5. Inventory Customer Model (RENAMED)
// =================================================================================
const inventoryCustomerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: "", trim: true },
  email: { type: String, default: "", trim: true, lowercase: true },
  address: { type: String, default: "", trim: true },
}, { timestamps: true });

inventoryCustomerSchema.index({ userId: 1, name: 1 }, { unique: true });

// RENAME the model here
const InventoryCustomer = mongoose.model("InventoryCustomer", inventoryCustomerSchema);
// =================================================================================
// Export all models
// =================================================================================
module.exports = { Product, Cashflow, Invoice, Supplier, InventoryCustomer };

