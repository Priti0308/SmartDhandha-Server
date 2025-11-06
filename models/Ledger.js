const mongoose = require("mongoose");

// =================================================================================
// 1. Customer Model
// =================================================================================
const customerSchema = new mongoose.Schema({
  // --- ADD THIS BLOCK ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add an index for faster queries
  },
  // ---
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
});
const Customer = mongoose.model("Customer", customerSchema);

// 2. Transaction Model

const transactionSchema = new mongoose.Schema({
  // --- ADD THIS BLOCK ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // ---
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: String, required: true }, // Consider changing to { type: Date, required: true }
  note: { type: String, default: "" },
});
const Transaction = mongoose.model("Transaction", transactionSchema);


// 3. Reminder Model
const reminderSchema = new mongoose.Schema({
  // --- ADD THIS BLOCK ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // ---
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  dueDate: { type: Date, required: true },
  message: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
});
const Reminder = mongoose.model("Reminder", reminderSchema);

// Export all models
module.exports = { Customer, Transaction, Reminder };
