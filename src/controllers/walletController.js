const db = require('../config/database');

exports.addWalletTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, category, description, transaction_date } = req.body;

    // 1️⃣ Insert transaction
    await db.query(
      `INSERT INTO wallet_transactions 
       (user_id, type, amount, category, description, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, amount, category, description, transaction_date]
    );

    // 2️⃣ Check wallet exists
    const [walletRows] = await db.query(
      `SELECT * FROM wallets WHERE user_id = ?`,
      [userId]
    );

    if (walletRows.length === 0) {
      await db.query(
        `INSERT INTO wallets (user_id, current_balance) VALUES (?, 0)`,
        [userId]
      );
    }

    // 3️⃣ Update balance
    if (type === 'income') {
      await db.query(
        `UPDATE wallets 
         SET current_balance = current_balance + ? 
         WHERE user_id = ?`,
        [amount, userId]
      );
    } else if (type === 'expense') {
      await db.query(
        `UPDATE wallets 
         SET current_balance = current_balance - ? 
         WHERE user_id = ?`,
        [amount, userId]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Transaction added and balance updated'
    });

  } catch (err) {
    console.error("WALLET ERROR:", err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};