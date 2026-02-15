const db = require('../config/database');

// ✅ Create Budget
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const userId = req.user.id;

    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required"
      });
    }

    // Check if budget already exists
    const [existing] = await db.query(
      `SELECT * FROM budgets 
       WHERE user_id = ? AND category = ? AND month = ? AND year = ?`,
      [userId, category, month, year]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "Budget already exists for this category and month"
      });
    }

    await db.query(
      `INSERT INTO budgets (user_id, category, amount, month, year)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, category, amount, month, year]
    );

    res.status(201).json({
      status: "success",
      message: "Budget created successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


// ✅ Get Budgets
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const [budgets] = await db.query(
      `SELECT * FROM budgets WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );

    res.status(200).json({
      status: "success",
      data: budgets
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};