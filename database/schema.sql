-- ===================================
-- Expense Tracker Pro - Database Schema
-- ===================================

-- Create database
CREATE DATABASE IF NOT EXISTS expense_tracker
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

-- ===================================
-- Users Table
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Wallets Table
-- ===================================
CREATE TABLE IF NOT EXISTS wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  current_balance DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Wallet Transactions Table
-- ===================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, transaction_date),
  INDEX idx_user_type (user_id, type),
  INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Expenses Table
-- ===================================
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_month_year (user_id, month, year),
  INDEX idx_user_category (user_id, category),
  INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Budgets Table
-- ===================================
CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_budget (user_id, category, month, year),
  INDEX idx_user_month_year (user_id, month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Categories Table (Optional)
-- ===================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense', 'both') DEFAULT 'expense',
  icon VARCHAR(50) DEFAULT NULL,
  color VARCHAR(7) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Insert Default Categories
-- ===================================
INSERT INTO categories (user_id, name, type, icon, color) VALUES
(NULL, 'Salary', 'income', 'fa-money-bill', '#10b981'),
(NULL, 'Freelance', 'income', 'fa-laptop', '#10b981'),
(NULL, 'Investment', 'income', 'fa-chart-line', '#10b981'),
(NULL, 'Business', 'income', 'fa-briefcase', '#10b981'),
(NULL, 'Other Income', 'income', 'fa-hand-holding-usd', '#10b981'),
(NULL, 'Food', 'expense', 'fa-utensils', '#ef4444'),
(NULL, 'Transport', 'expense', 'fa-car', '#f59e0b'),
(NULL, 'Shopping', 'expense', 'fa-shopping-cart', '#8b5cf6'),
(NULL, 'Entertainment', 'expense', 'fa-film', '#ec4899'),
(NULL, 'Bills', 'expense', 'fa-file-invoice', '#ef4444'),
(NULL, 'Healthcare', 'expense', 'fa-heartbeat', '#ef4444'),
(NULL, 'Education', 'expense', 'fa-graduation-cap', '#3b82f6'),
(NULL, 'Rent', 'expense', 'fa-home', '#ef4444'),
(NULL, 'Utilities', 'expense', 'fa-bolt', '#f59e0b'),
(NULL, 'Insurance', 'expense', 'fa-shield-alt', '#6366f1'),
(NULL, 'Other Expense', 'expense', 'fa-ellipsis-h', '#64748b');

-- ===================================
-- Sample Data (Optional - for testing)
-- ===================================
-- Uncomment to insert sample data

/*
-- Insert sample user
INSERT INTO users (name, email, password) VALUES
('John Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYSHLWTjpMO'); -- password: Test@123

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Insert wallet
INSERT INTO wallets (user_id, current_balance) VALUES
(@user_id, 50000.00);

-- Insert sample transactions
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date) VALUES
(@user_id, 'income', 50000.00, 'Salary', 'Monthly salary', CURDATE() - INTERVAL 5 DAY),
(@user_id, 'expense', 5000.00, 'Food', 'Groceries and dining', CURDATE() - INTERVAL 4 DAY),
(@user_id, 'expense', 2000.00, 'Transport', 'Fuel and maintenance', CURDATE() - INTERVAL 3 DAY),
(@user_id, 'expense', 3000.00, 'Shopping', 'Clothing', CURDATE() - INTERVAL 2 DAY),
(@user_id, 'income', 10000.00, 'Freelance', 'Project payment', CURDATE() - INTERVAL 1 DAY);

-- Insert sample expenses
INSERT INTO expenses (user_id, amount, category, description, month, year, expense_date) VALUES
(@user_id, 5000.00, 'Food', 'Groceries', MONTH(CURDATE()), YEAR(CURDATE()), CURDATE() - INTERVAL 4 DAY),
(@user_id, 2000.00, 'Transport', 'Fuel', MONTH(CURDATE()), YEAR(CURDATE()), CURDATE() - INTERVAL 3 DAY),
(@user_id, 3000.00, 'Shopping', 'Clothes', MONTH(CURDATE()), YEAR(CURDATE()), CURDATE() - INTERVAL 2 DAY);

-- Insert sample budgets
INSERT INTO budgets (user_id, category, amount, month, year) VALUES
(@user_id, 'Food', 10000.00, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, 'Transport', 5000.00, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, 'Shopping', 8000.00, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, 'Entertainment', 5000.00, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, 'Bills', 15000.00, MONTH(CURDATE()), YEAR(CURDATE()));
*/

-- ===================================
-- Views for Common Queries
-- ===================================

-- View: Monthly Summary by User
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT 
  u.id AS user_id,
  u.name AS user_name,
  YEAR(wt.transaction_date) AS year,
  MONTH(wt.transaction_date) AS month,
  SUM(CASE WHEN wt.type = 'income' THEN wt.amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN wt.type = 'expense' THEN wt.amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN wt.type = 'income' THEN wt.amount ELSE 0 END) - 
  SUM(CASE WHEN wt.type = 'expense' THEN wt.amount ELSE 0 END) AS net_savings
FROM users u
LEFT JOIN wallet_transactions wt ON u.id = wt.user_id
GROUP BY u.id, u.name, YEAR(wt.transaction_date), MONTH(wt.transaction_date);

-- View: Category-wise Expenses
CREATE OR REPLACE VIEW v_category_expenses AS
SELECT 
  u.id AS user_id,
  u.name AS user_name,
  e.category,
  e.month,
  e.year,
  SUM(e.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  AVG(e.amount) AS avg_amount
FROM users u
JOIN expenses e ON u.id = e.user_id
GROUP BY u.id, u.name, e.category, e.month, e.year;

-- ===================================
-- Stored Procedures (Optional)
-- ===================================

-- Procedure: Add Transaction and Update Wallet
DELIMITER //
CREATE PROCEDURE sp_add_transaction(
  IN p_user_id INT,
  IN p_type ENUM('income', 'expense'),
  IN p_amount DECIMAL(15,2),
  IN p_category VARCHAR(100),
  IN p_description TEXT,
  IN p_transaction_date DATE
)
BEGIN
  DECLARE v_wallet_id INT;
  
  -- Start transaction
  START TRANSACTION;
  
  -- Insert transaction
  INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date)
  VALUES (p_user_id, p_type, p_amount, p_category, p_description, p_transaction_date);
  
  -- Update wallet balance
  IF p_type = 'income' THEN
    UPDATE wallets SET current_balance = current_balance + p_amount WHERE user_id = p_user_id;
  ELSE
    UPDATE wallets SET current_balance = current_balance - p_amount WHERE user_id = p_user_id;
  END IF;
  
  -- Commit transaction
  COMMIT;
END //
DELIMITER ;

-- ===================================
-- Indexes for Performance
-- ===================================

-- Additional composite indexes for common queries
CREATE INDEX idx_wt_user_date_type ON wallet_transactions(user_id, transaction_date, type);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_budgets_lookup ON budgets(user_id, category, month, year);

-- ===================================
-- Database Info
-- ===================================
SELECT 'Database schema created successfully!' AS Status;
SELECT VERSION() AS MySQL_Version;
SELECT COUNT(*) AS Total_Tables FROM information_schema.tables WHERE table_schema = 'expense_tracker';
