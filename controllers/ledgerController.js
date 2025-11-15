const { Product, Cashflow, Invoice } = require("../models/Inventory"); // Note: Product, Cashflow, Invoice are not used here, but Customer, Transaction, Reminder are.
const { Customer, Transaction, Reminder } = require("../models/Ledger");
// const { sendWhatsappMessage } = require("../utils/whatsappService");
const mongoose = require('mongoose');

// --- Customer Controllers ---
exports.getCustomers = async (req, res) => {
  try {
    // SECURE: Find only customers belonging to the logged-in user
    const customers = await Customer.find({ userId: req.user.id });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

exports.addCustomer = async (req, res) => {
  try {
    // SECURE: Add the logged-in user's ID to the new customer
    const newCustomer = new Customer({ ...req.body, userId: req.user.id });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: "Failed to add customer", error });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    // SECURE: Find by both _id and userId
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found or you do not have permission" });
    }
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: "Failed to update customer", error });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    // SECURE: Find by both _id and userId
    const deletedCustomer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found or you do not have permission" });
    }
    // TODO: You should also delete associated transactions and reminders here
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer", error });
  }
};

// --- Transaction Controllers ---
exports.getTransactions = async (req, res) => {
  try {
    // SECURE: Find only transactions belonging to the logged-in user
    const transactions = await Transaction.find({ userId: req.user.id });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // SECURE: Check if user owns the customer they are adding a transaction for
    const customer = await Customer.findOne({ _id: req.body.customerId, userId: req.user.id });
    if (!customer) {
        return res.status(404).json({ message: "Customer not found or you do not have permission for this action." });
    }

    // SECURE: Add the logged-in user's ID to the new transaction
    const newTransaction = new Transaction({ ...req.body, userId: req.user.id });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: "Failed to add transaction", error });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    // SECURE: Find by both _id and userId
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found or you do not have permission" });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: "Failed to update transaction", error });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    // SECURE: Find by both _id and userId
    const deletedTransaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found or you do not have permission" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction", error });
  }
};

// --- Reminder Controllers ---
exports.getReminders = async (req, res) => {
  try {
    // SECURE: Find only reminders belonging to the logged-in user
    const reminders = await Reminder.find({ userId: req.user.id });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error });
  }
};

exports.addReminder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // SECURE: Check if user owns the customer
    const customer = await Customer.findOne({ _id: req.body.customerId, userId: req.user.id });
    if (!customer) {
        return res.status(404).json({ message: "Customer not found or you do not have permission." });
    }

    // SECURE: Add the logged-in user's ID to the new reminder
    const newReminder = new Reminder({ ...req.body, userId: req.user.id });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ message: "Failed to add reminder", error });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    // SECURE: Find by both _id and userId
    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found or you do not have permission" });
    }
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: "Failed to update reminder", error });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    // SECURE: Find by both _id and userId
    const deletedReminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedReminder) {
      return res.status(404).json({ message: "Reminder not found or you do not have permission" });
    }
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reminder", error });
  }
};

// --- Send a specific reminder via WhatsApp ---
// exports.sendReminderViaWhatsapp = async (req, res) => {
//   try {
//     // SECURE: Find reminder by ID and user ID, then populate customer
//     const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id }).populate('customerId');
    
//     if (!reminder) {
//       return res.status(404).json({ message: "Reminder not found or you do not have permission" });
//     }

//     // Since we found the reminder, we know the user owns it. We still check if the populated customer exists.
//     const customer = reminder.customerId;
//     if (!customer || !customer.phone) {
//       return res.status(400).json({ message: "Customer phone number not available" });
//     }
    
//     // We must double-check that the customer (from the reminder) also belongs to this user.
//     // This check is technically redundant if our `addReminder` is secure, but it's good practice.
//     if (customer.userId.toString() !== req.user.id) {
//         return res.status(403).json({ message: "Permission denied. Customer does not belong to this user."});
//     }

//     const messageBody = `🔔 Reminder for ${customer.name}:\n\n${reminder.message || 'Payment is due'}.\nDue Date: ${reminder.dueDate}\n\nFrom, SmartDhandha`;
//     const result = await sendWhatsappMessage(customer.phone, messageBody);

//     if (result.success) {
//       res.status(200).json({ message: "WhatsApp reminder sent successfully!" });
//     } else {
//       res.status(500).json({ message: "Failed to send WhatsApp reminder", error: result.error });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // --- Send a custom offer/message via WhatsApp ---
// exports.sendOfferViaWhatsapp = async (req, res) => {
//     try {
//         const { message } = req.body;
//         if (!message) {
//             return res.status(400).json({ message: "Message content is required" });
//         }

//         // SECURE: Find customer by ID and user ID
//         const customer = await Customer.findOne({ _id: req.params.id, userId: req.user.id });
//         if (!customer) {
//             return res.status(404).json({ message: "Customer not found or you do not have permission" });
//         }
//         if (!customer.phone) {
//             return res.status(400).json({ message: "Customer phone number not available" });
//         }
        
//         const messageBody = `✨ Special Message for ${customer.name}:\n\n${message}\n\nThanks, SmartDhandha Team`;
//         const result = await sendWhatsappMessage(customer.phone, messageBody);

//         if (result.success) {
//             res.status(200).json({ message: "WhatsApp message sent successfully!" });
//         } else {
//             res.status(500).json({ message: "Failed to send WhatsApp message", error: result.error });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error });
//     }
// };

