const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect to the database
connectDB();

// Route Imports
const authRoutes = require("./routes/authRoutes");
const contactRoutes =require("./routes/contactRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// 1. Initialize App
const app = express();

// ==========================================================
// 2. Setup All Middleware (CORS, JSON parsing) BEFORE routes
// ==========================================================

// -- START OF CORS CONFIG --
// Define the list of allowed frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://smart-business-delta.vercel.app' // Your deployed Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if the request origin is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
// -- END OF CORS CONFIG --

// Other middleware
// *** NOTICE: The simple 'app.use(cors());' is REMOVED ***
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================================
// 3. Setup API Routes AFTER middleware
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);

// Consolidated Ledger and Inventory routes
app.use("/api/ledger", ledgerRoutes);
app.use("/api/inventory", inventoryRoutes);

app.use("/api", reportRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);


// 4. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));