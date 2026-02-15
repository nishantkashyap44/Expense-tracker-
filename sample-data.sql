-- ============================================
-- EXPENSE TRACKER PRO - COMPLETE SAMPLE DATA
-- Testing Setup Script
-- ============================================

USE expense_tracker;

-- Step 1: Clean existing data (optional - use if resetting)
-- TRUNCATE TABLE wallet_transactions;
-- TRUNCATE TABLE expenses;
-- TRUNCATE TABLE budgets;
-- TRUNCATE TABLE wallets;
-- DELETE FROM users WHERE email = 'test@example.com';

-- ============================================
-- STEP 2: CREATE TEST USER
-- ============================================
-- Email: test@example.com
-- Password: Test@123

INSERT INTO users (name, email, password, created_at) VALUES
('Test User', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYSHLWTjpMO', NOW());

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

SELECT CONCAT('✅ User created with ID: ', @user_id) as Status;

-- ============================================
-- STEP 3: CREATE WALLET
-- ============================================

INSERT INTO wallets (user_id, current_balance, created_at) VALUES
(@user_id, 150000.00, NOW());

SELECT '✅ Wallet created' as Status;

-- ============================================
-- STEP 4: ADD INCOME TRANSACTIONS (Current Month)
-- ============================================

-- Salary Income
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'income', 50000.00, 'Salary', 'Monthly salary - January', DATE_SUB(CURDATE(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(@user_id, 'income', 50000.00, 'Salary', 'Monthly salary - February', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Freelance Income
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'income', 15000.00, 'Freelance', 'Website development project', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(@user_id, 'income', 12000.00, 'Freelance', 'Logo design work', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(@user_id, 'income', 8000.00, 'Freelance', 'Consultation fee', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Investment Income
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'income', 5000.00, 'Investment', 'Stock dividend', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(@user_id, 'income', 3000.00, 'Investment', 'Mutual fund returns', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Business Income
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'income', 10000.00, 'Business', 'Online course sales', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(@user_id, 'income', 7000.00, 'Business', 'Affiliate commissions', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Other Income
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'income', 2000.00, 'Other Income', 'Referral bonus', CURDATE(), NOW());

SELECT '✅ Income transactions added (10 entries)' as Status;

-- ============================================
-- STEP 5: ADD EXPENSE TRANSACTIONS (Current Month)
-- ============================================

-- Food Expenses
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 3500.00, 'Food', 'Grocery shopping', DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(@user_id, 'expense', 2000.00, 'Food', 'Restaurant dinner', DATE_SUB(CURDATE(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(@user_id, 'expense', 1500.00, 'Food', 'Online food delivery', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(@user_id, 'expense', 1000.00, 'Food', 'Cafe and snacks', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Transport Expenses
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 3000.00, 'Transport', 'Fuel for car', DATE_SUB(CURDATE(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(@user_id, 'expense', 1000.00, 'Transport', 'Metro card recharge', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(@user_id, 'expense', 500.00, 'Transport', 'Uber rides', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Shopping Expenses
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 5000.00, 'Shopping', 'Clothing and accessories', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(@user_id, 'expense', 3000.00, 'Shopping', 'Electronics accessories', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(@user_id, 'expense', 2000.00, 'Shopping', 'Books and stationery', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Entertainment Expenses
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 2000.00, 'Entertainment', 'Movie tickets and snacks', DATE_SUB(CURDATE(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
(@user_id, 'expense', 1500.00, 'Entertainment', 'OTT subscriptions', DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(@user_id, 'expense', 1000.00, 'Entertainment', 'Gaming purchase', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Bills and Utilities
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 5000.00, 'Bills', 'Electricity bill', DATE_SUB(CURDATE(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
(@user_id, 'expense', 3000.00, 'Bills', 'Internet and phone bill', DATE_SUB(CURDATE(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
(@user_id, 'expense', 4000.00, 'Bills', 'Water and gas bill', DATE_SUB(CURDATE(), INTERVAL 23 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY));

-- Healthcare
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 3000.00, 'Healthcare', 'Medical checkup', DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(@user_id, 'expense', 2000.00, 'Healthcare', 'Medicines and pharmacy', DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- Education
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 4000.00, 'Education', 'Online course subscription', DATE_SUB(CURDATE(), INTERVAL 19 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY)),
(@user_id, 'expense', 2000.00, 'Education', 'Books and learning materials', DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));

-- Rent
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 15000.00, 'Rent', 'Monthly house rent - January', DATE_SUB(CURDATE(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(@user_id, 'expense', 15000.00, 'Rent', 'Monthly house rent - February', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Utilities
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 2000.00, 'Utilities', 'Maintenance charges', DATE_SUB(CURDATE(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY)),
(@user_id, 'expense', 1000.00, 'Utilities', 'Cleaning supplies', DATE_SUB(CURDATE(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY));

SELECT '✅ Expense transactions added (28 entries)' as Status;

-- ============================================
-- STEP 6: ADD EXPENSES TO EXPENSES TABLE
-- ============================================

INSERT INTO expenses (user_id, amount, category, description, month, year, expense_date, created_at)
SELECT 
    user_id,
    amount,
    category,
    description,
    MONTH(transaction_date) as month,
    YEAR(transaction_date) as year,
    transaction_date as expense_date,
    created_at
FROM wallet_transactions
WHERE user_id = @user_id AND type = 'expense';

SELECT '✅ Expenses table populated' as Status;

-- ============================================
-- STEP 7: CREATE MONTHLY BUDGETS
-- ============================================

INSERT INTO budgets (user_id, category, amount, month, year, created_at) VALUES
(@user_id, 'Food', 10000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Transport', 5000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Shopping', 8000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Entertainment', 5000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Bills', 15000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Healthcare', 5000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Education', 10000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Rent', 15000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW()),
(@user_id, 'Utilities', 3000.00, MONTH(CURDATE()), YEAR(CURDATE()), NOW());

SELECT '✅ Monthly budgets created (9 categories)' as Status;

-- ============================================
-- STEP 8: ADD PREVIOUS MONTH DATA (for trend charts)
-- ============================================

-- Previous Month Income
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'income', 48000.00, 'Salary', 'Monthly salary', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 5 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 5 DAY)),
(@user_id, 'income', 12000.00, 'Freelance', 'Project payment', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 10 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 10 DAY)),
(@user_id, 'income', 5000.00, 'Investment', 'Returns', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 15 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 15 DAY));

-- Previous Month Expenses
INSERT INTO wallet_transactions (user_id, type, amount, category, description, transaction_date, created_at) VALUES
(@user_id, 'expense', 7000.00, 'Food', 'Groceries', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 8 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 8 DAY)),
(@user_id, 'expense', 2500.00, 'Transport', 'Fuel', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 12 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 12 DAY)),
(@user_id, 'expense', 15000.00, 'Rent', 'House rent', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 3 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 3 DAY)),
(@user_id, 'expense', 10000.00, 'Bills', 'Utilities', DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL 20 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 20 DAY));

SELECT '✅ Previous month data added' as Status;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT '
========================================' as '';
SELECT '📊 DATA SUMMARY' as '';
SELECT '========================================' as '';

-- User Info
SELECT 
    '✅ User' as Item,
    name as Name,
    email as Email,
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as Created
FROM users WHERE id = @user_id;

-- Wallet Balance
SELECT 
    '💰 Wallet' as Item,
    CONCAT('₹', FORMAT(current_balance, 2)) as Balance
FROM wallets WHERE user_id = @user_id;

-- Transaction Summary
SELECT 
    '📝 Transactions' as Item,
    COUNT(*) as Total,
    SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END) as Income_Count,
    SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END) as Expense_Count
FROM wallet_transactions WHERE user_id = @user_id;

-- Amount Summary
SELECT 
    '💵 Amounts' as Item,
    CONCAT('₹', FORMAT(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2)) as Total_Income,
    CONCAT('₹', FORMAT(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2)) as Total_Expense,
    CONCAT('₹', FORMAT(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 2)) as Net_Savings
FROM wallet_transactions WHERE user_id = @user_id;

-- Budget Summary
SELECT 
    '🎯 Budgets' as Item,
    COUNT(*) as Total_Categories,
    CONCAT('₹', FORMAT(SUM(amount), 2)) as Total_Budget
FROM budgets WHERE user_id = @user_id;

-- Expense Summary
SELECT 
    '📊 Expenses' as Item,
    COUNT(*) as Total_Entries,
    COUNT(DISTINCT category) as Categories
FROM expenses WHERE user_id = @user_id;

SELECT '
========================================' as '';
SELECT '✅ SETUP COMPLETE!' as '';
SELECT '========================================' as '';
SELECT '
Login Credentials:' as '';
SELECT 'Email: test@example.com' as '';
SELECT 'Password: Test@123' as '';
SELECT '
Access Dashboard:' as '';
SELECT 'http://localhost:5000/dashboard.html' as '';
SELECT '========================================' as '';
