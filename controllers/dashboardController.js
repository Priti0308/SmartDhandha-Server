const mongoose = require('mongoose');
// NOTE: Ensure these models are correctly defined and imported from your project's structure
const { Invoice, Cashflow, Product } = require('../models/Inventory'); 
const Visitor = require('../models/Visitor'); 

// Helper function to safely convert ID or throw
const getObjectId = (id, res) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid User ID provided." });
        // NOTE: Throwing here ensures the subsequent Promise.all does not execute if the ID is bad.
        throw new Error("Invalid ID for aggregation pipeline."); 
    }
    // FIX: Use 'new' to resolve TypeError
    return new mongoose.Types.ObjectId(id); 
};

// --- 1. Get Main KPI Stats (FIXED) ---
// --- 1. Get Main KPI Stats (FINAL FIX) ---
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        
        const todayString = today.toISOString().slice(0, 10); 
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const userId = getObjectId(req.user.id, res);

        const [
            salesAndProfitToday, 
            totalReceivables, 
            expensesThisMonth, 
            lowStockCount,
            inventoryValueResult
        ] = await Promise.all([
            // Sales & Profit Today (FIXED)
            Invoice.aggregate([
                { $match: { 
                    userId: userId, 
                    type: 'sale', 
                    date: todayString 
                } },
                { $unwind: "$items" },
                { 
                    $group: { 
                        _id: null, 
                        totalSales: { $sum: { $multiply: [{$ifNull: ["$items.price", 0]}, {$ifNull: ["$items.qty", 0]}] } },
                        totalCost: { $sum: { $multiply: [{$ifNull: ["$items.cost", 0]}, {$ifNull: ["$items.qty", 0]}] } } 
                    } 
                }
            ]),
            // Total Receivables (Working)
            Invoice.aggregate([
                { $match: { userId: userId, type: 'sale' } },
                { $group: { _id: null, total: { $sum: '$totalGrand' }, paid: { $sum: '$paidAmount' } } }
            ]),
            // Expenses This Month (Working)
            Cashflow.aggregate([
                { $match: { userId: userId, kind: 'expense', date: { $gte: startOfMonth.toISOString().slice(0, 10) } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Low Stock Items Count (Working)
            Product.countDocuments({ userId: req.user.id, $expr: { $lte: ['$stock', '$lowStock'] } }),
            
            // Total Inventory Value (NOW FIXED)
            Product.aggregate([
                { $match: { userId: userId } },
                { 
                    $group: { 
                        _id: null, 
                        // --- THIS IS THE FIX ---
                        totalValue: { $sum: { $multiply: [{$ifNull: ["$stock", 0]}, {$ifNull: ["$unitPrice", 0]}] } } 
                    } 
                } 
            ])
        ]);

        const salesTodayTotal = salesAndProfitToday[0]?.totalSales || 0;
        const profitTodayTotal = (salesAndProfitToday[0]?.totalSales || 0) - (salesAndProfitToday[0]?.totalCost || 0);
        const receivables = (totalReceivables[0]?.total || 0) - (totalReceivables[0]?.paid || 0);
        const expensesTotal = expensesThisMonth[0]?.total || 0;
        const inventoryValueTotal = inventoryValueResult[0]?.totalValue || 0; // This will now use the correct value

        res.json({
            salesToday: salesTodayTotal,
            profitToday: profitTodayTotal,
            totalReceivables: receivables,
            expensesThisMonth: expensesTotal,
            lowStockCount: lowStockCount,
            inventoryValue: inventoryValueTotal
        });

    } catch (error) {
        if (error.message !== "Invalid ID for aggregation pipeline.") {
             console.error("Error fetching dashboard stats:", error);
             res.status(500).json({ message: "Server Error", details: error.message });
        }
    }
};
// --- 2. Get Sales Chart Data (This was working, no changes) ---
exports.getSalesChartData = async (req, res) => {
    try {
        const dateLabels = [];
        const salesData = [];
        const today = new Date();

        const userId = getObjectId(req.user.id, res);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().slice(0, 10);
            
            dateLabels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));

            const dailySales = await Invoice.aggregate([
                { $match: { userId: userId, type: 'sale', date: dateString } },
                { $group: { _id: null, total: { $sum: '$totalGrand' } } }
            ]);

            salesData.push(dailySales[0]?.total || 0);
        }

        res.json({
            labels: dateLabels,
            datasets: [{
                label: 'Sales',
                data: salesData,
                backgroundColor: '#0066A3',
                borderRadius: 5,
            }],
        });

    } catch (error) {
        if (error.message !== "Invalid ID for aggregation pipeline.") {
            console.error("Error fetching sales chart data:", error);
            res.status(500).json({ message: "Server Error", details: error.message });
        }
    }
};


// --- 3. Get Recent Activity Feed (No changes) ---
exports.getRecentActivity = async (req, res) => {
    try {
        const [invoices, cashflows, visitors] = await Promise.all([
            Invoice.find({ userId: req.user.id }).populate('customerName', 'name').sort({ createdAt: -1 }).limit(5),
            Cashflow.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5),
            Visitor.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5),
        ]);

        const mappedInvoices = invoices.map(i => {
            let customerDisplayName = 'N/A';
           if (i.customerName && typeof i.customerName === 'object' && i.customerName.name) {
                customerDisplayName = i.customerName.name;
            } 
            else if (i.customerName && typeof i.customerName === 'string') {
                customerDisplayName = i.customerName;
            }
            
            return {
                id: i._id, 
                type: 'INVOICE', 
                text: `Invoice to ${customerDisplayName}`, 
                date: i.createdAt, 
                amount: i.totalGrand
            };
       });

        const mappedCashflows = cashflows.map(c => ({
            id: c._id, type: c.kind.toUpperCase(), text: `${c.kind === 'income' ? 'Income' : 'Expense'} for ${c.category}`,
            date: c.createdAt, amount: c.amount
        }));
        const mappedVisitors = visitors.map(v => ({
            id: v._id, type: 'VISITOR', text: `Visitor ${v.name} checked in`,
            date: v.createdAt, amount: null
        }));

        const combinedActivities = [...mappedInvoices, ...mappedCashflows, ...mappedVisitors]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 7);

        res.json(combinedActivities);
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- 4. Get Low Stock Items (No changes) ---
exports.getLowStockItems = async (req, res) => {
    try {
        const items = await Product.find({ userId: req.user.id, $expr: { $lte: ['$stock', '$lowStock'] } })
            .sort({ stock: 1 })
            .limit(10)
            .select('name stock category'); 
        res.json(items);
    } catch (error) {
        console.error("Error fetching low stock items:", error);
        res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- 5. Get Overdue Invoices (No changes) ---
exports.getOverdueInvoices = async (req, res) => {
// (This function is unchanged)
    try {
        const today = new Date();
        const invoices = await Invoice.find({
            userId: req.user.id, 
            type: 'sale',
            dueDate: { $lt: today },
            $expr: { $lt: ["$paidAmount", "$totalGrand"] }
        })
        .populate('customerName', 'name')
        .sort({ dueDate: 1 })
        .limit(5);

        const formattedInvoices = invoices.map(inv => ({
            id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName?.name || 'N/A',
           amount: inv.totalGrand - inv.paidAmount,
            dueDate: inv.dueDate
        }));

        res.json(formattedInvoices);
    } catch (error) {
        console.error("Error fetching overdue invoices:", error);
        res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- 6. Get Top Selling Products (FIXED) ---
exports.getTopSellingProducts = async (req, res) => {
    try {
        const userId = getObjectId(req.user.id, res);
        
        const topProducts = await Invoice.aggregate([
            { $match: { userId: userId, type: 'sale' } }, 
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    // --- FIX 2: Use 'qty' instead of 'quantity' ---
                    totalRevenue: { $sum: { $multiply: [{$ifNull: ["$items.price", 0]}, {$ifNull: ["$items.qty", 0]}] } } // <-- FIX 2
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products', // Ensure this matches your MongoDB collection name exactly
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    id: "$_id",
                    name: "$productDetails.name",
                    category: "$productDetails.category", 
                    revenue: "$totalRevenue",
               _id: 0
                }
            }
        ]);
        
        const maxRevenue = topProducts[0]?.revenue || 0;
        const result = topProducts.map(p => ({
            ...p,
            percentage: maxRevenue > 0 ? (p.revenue / maxRevenue) * 100 : 0
        }));

        res.json(result);
    } catch (error) {
        if (error.message !== "Invalid ID for aggregation pipeline.") {
            console.error("Error fetching top selling products:", error);
           res.status(500).json({ message: "Server Error", details: error.message });
        }
    }
};

// --- 7. Get Income vs. Expense Chart Data (FIXED) ---
exports.getIncomeVsExpenseChartData = async (req, res) => {
    try {
        const dateLabels = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dateLabels.push(date.toISOString().slice(0, 10));
        }

        const userId = getObjectId(req.user.id, res);

        const [incomeDataRaw, expenseDataRaw] = await Promise.all([
            Cashflow.aggregate([
                { $match: { userId: userId, kind: 'income', date: { $gte: dateLabels[0] } } }, 
                { $group: { _id: "$date", total: { $sum: "$amount" } } }
            ]),
            Cashflow.aggregate([
                { $match: { userId: userId, kind: 'expense', date: { $gte: dateLabels[0] } } }, 
                { $group: { _id: "$date", total: { $sum: "$amount" } } }
            ])
        ]);

        const incomeMap = new Map(incomeDataRaw.map(i => [i._id, i.total]));
        const expenseMap = new Map(expenseDataRaw.map(i => [i._id, i.total]));

        const incomeData = dateLabels.map(label => incomeMap.get(label) || 0);
        const expenseData = dateLabels.map(label => expenseMap.get(label) || 0);
        
        const shortLabels = dateLabels.map(d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric'}));


        res.json({
            labels: shortLabels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                  tension: 0.4
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
           ]
        });

    } catch (error) { // <-- CORRECTED: Removed extra '}'
        if (error.message !== "Invalid ID for aggregation pipeline.") {
            console.error("Error fetching income vs expense chart data:", error);
            res.status(500).json({ message: "Server Error", details: error.message });
        }
    }
};