const db = require('../config/database');

// ✅ Get All Transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [transactions] = await db.query(
      `SELECT * FROM wallet_transactions
       WHERE user_id = ?
       ORDER BY transaction_date DESC`,
      [userId]
    );

    res.status(200).json({
      status: "success",
      data: transactions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// ✅ Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, transaction_date } = req.body;
    const userId = req.user.id;

    if (!type || !amount || !category || !transaction_date) {
      return res.status(400).json({
        status: "fail",
        message: "All required fields must be provided"
      });
    }

    await db.query(
      `INSERT INTO wallet_transactions 
       (user_id, type, amount, category, description, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, amount, category, description, transaction_date]
    );

    res.status(201).json({
      status: "success",
      message: "Transaction added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};