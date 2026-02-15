const db = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// =====================================
// GET DASHBOARD SUMMARY (FULL FIXED)
// =====================================
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  // Month date range (BEST PRACTICE)
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDateQuery = `LAST_DAY('${startDate}')`;

  const [
    [walletRows],
    [incomeRows],
    [expenseRows],
    [transactionRows],
    [categoryRows]
  ] = await Promise.all([

    // Wallet balance
    db.query(
      `SELECT COALESCE(current_balance,0) as current_balance
       FROM wallets
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    ),

    // Monthly income
    db.query(
      `SELECT COALESCE(SUM(amount),0) as total_income
       FROM wallet_transactions
       WHERE user_id = ?
       AND type='income'
       AND transaction_date BETWEEN ? AND ${endDateQuery}`,
      [userId, startDate]
    ),

    // Monthly expense
    db.query(
      `SELECT COALESCE(SUM(amount),0) as total_expense
       FROM wallet_transactions
       WHERE user_id = ?
       AND type='expense'
       AND transaction_date BETWEEN ? AND ${endDateQuery}`,
      [userId, startDate]
    ),

    // Transaction count
    db.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type='income' THEN 1 ELSE 0 END) as income_count,
        SUM(CASE WHEN type='expense' THEN 1 ELSE 0 END) as expense_count
       FROM wallet_transactions
       WHERE user_id = ?
       AND transaction_date BETWEEN ? AND ${endDateQuery}`,
      [userId, startDate]
    ),

    // 🔥 FIXED TOP EXPENSE CATEGORIES
    db.query(
      `SELECT 
        IFNULL(category,'Other') as category,
        SUM(amount) as total,
        COUNT(*) as count
       FROM wallet_transactions
       WHERE user_id = ?
       AND type='expense'
       AND transaction_date BETWEEN ? AND ${endDateQuery}
       GROUP BY category
       HAVING total > 0
       ORDER BY total DESC
       LIMIT 5`,
      [userId, startDate]
    )
  ]);

  const walletBalance = walletRows[0]?.current_balance || 0;
  const totalIncome = incomeRows[0]?.total_income || 0;
  const totalExpense = expenseRows[0]?.total_expense || 0;

  const savings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(2) : 0;

  res.json({
    status: 'success',
    data: {
      period: { month, year },
      wallet_balance: Number(walletBalance),
      total_income: Number(totalIncome),
      total_expense: Number(totalExpense),
      savings: Number(savings),
      savings_rate: Number(savingsRate),
      transactions: {
        total: transactionRows[0]?.total_transactions || 0,
        income_count: transactionRows[0]?.income_count || 0,
        expense_count: transactionRows[0]?.expense_count || 0
      },
      top_categories: categoryRows
    }
  });
});


// =====================================
// GET RECENT TRANSACTIONS
// =====================================
exports.getRecentTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Number(req.query.limit) || 10;

  const [transactions] = await db.query(
    `SELECT 
      id,
      type,
      amount,
      IFNULL(category,'Other') as category,
      description,
      transaction_date,
      created_at
     FROM wallet_transactions
     WHERE user_id = ?
     ORDER BY transaction_date DESC, created_at DESC
     LIMIT ?`,
    [userId, limit]
  );

  res.json({
    status: 'success',
    results: transactions.length,
    data: { transactions }
  });
});


// =====================================
// GET MONTHLY TREND (LAST 6 MONTHS)
// =====================================
exports.getMonthlyTrend = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [trendData] = await db.query(
   `
  SELECT 
    YEAR(transaction_date) as year,
    MONTH(transaction_date) as month,
    DATE_FORMAT(transaction_date,'%b') as month_name,
    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
  FROM wallet_transactions
  WHERE user_id = ?
  AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
  GROUP BY YEAR(transaction_date), MONTH(transaction_date), DATE_FORMAT(transaction_date,'%b')
  ORDER BY YEAR(transaction_date), MONTH(transaction_date)
  `,
    [userId]
  );

  res.json({
    status: 'success',
    data: { trend: trendData }
  });
});


// =====================================
// GET BUDGET VS ACTUAL
// =====================================
exports.getBudgetComparison = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDateQuery = `LAST_DAY('${startDate}')`;

  const [comparison] = await db.query(
    `SELECT 
      b.category,
      b.amount as budget_amount,
      COALESCE(SUM(t.amount),0) as actual_spent,
      (b.amount - COALESCE(SUM(t.amount),0)) as remaining,
      CASE 
        WHEN b.amount > 0 
        THEN ROUND((COALESCE(SUM(t.amount),0) / b.amount) * 100,2)
        ELSE 0
      END as percentage_used
     FROM budgets b
     LEFT JOIN wallet_transactions t 
       ON b.category = t.category
       AND b.user_id = t.user_id
       AND t.type='expense'
       AND t.transaction_date BETWEEN ? AND ${endDateQuery}
     WHERE b.user_id = ?
     AND b.month = ?
     AND b.year = ?
     GROUP BY b.id, b.category, b.amount
     ORDER BY percentage_used DESC`,
    [startDate, userId, month, year]
  );

  res.json({
    status: 'success',
    results: comparison.length,
    data: { comparison }
  });
});