const db = require('../config/database');

// ✅ GET Transactions with Pagination
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const [transactions] = await db.query(
      `SELECT * FROM wallet_transactions
       WHERE user_id = ?
       ORDER BY transaction_date DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total
       FROM wallet_transactions
       WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({
      status: "success",
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
      data: transactions
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// ✅ CREATE Transaction
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
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// ✅ DELETE Transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    await db.query(
      `DELETE FROM wallet_transactions
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.status(200).json({
      status: "success",
      message: "Transaction deleted"
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};