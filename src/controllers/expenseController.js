const db = require('../config/database');

// ✅ Create Expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, category, description, month, year } = req.body;
    const userId = req.user.id;

    if (!amount || !category || !month || !year) {
      return res.status(400).json({
        status: "fail",
        message: "All required fields must be provided"
      });
    }

    const expenseDate = `${year}-${String(month).padStart(2, '0')}-01`;

    // 1️⃣ Insert into expenses table
    await db.query(
      `INSERT INTO expenses 
       (user_id, amount, category, description, month, year, expense_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, amount, category, description, month, year, expenseDate]
    );

    // 2️⃣ Insert into wallet_transactions table
    await db.query(
      `INSERT INTO wallet_transactions 
       (user_id, type, amount, category, description, transaction_date)
       VALUES (?, 'expense', ?, ?, ?, ?)`,
      [userId, amount, category, description, expenseDate]
    );

    res.status(201).json({
      status: "success",
      message: "Expense added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// ✅ GET All Expenses (IMPORTANT — missing tha)
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [expenses] = await db.query(
      `SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );

    res.status(200).json({
      status: "success",
      data: expenses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};