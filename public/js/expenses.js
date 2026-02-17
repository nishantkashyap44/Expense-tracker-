// Expenses Page - Complete Working Code (fixed)

let expensesData = [];
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

function getEl(id) {
    return document.getElementById(id);
}

// Utility function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load theme on page load
    loadTheme();
    
    // Setup theme toggle
    const themeToggle = getEl('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    Loading.show();
    
    try {
        await loadUserInfo();
        await loadExpensesData();
        setupEventListeners();
        
        Toast.success('Expenses loaded successfully');
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Failed to load expenses');
    } finally {
        Loading.hide();
    }
});

// Load theme from storage
function loadTheme() {
    const savedTheme = Storage.get('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    Storage.set('theme', isDark ? 'dark' : 'light');
}

// Load user info
async function loadUserInfo() {
    let user = Storage.get('user');
    try {
        if (typeof user === 'string') user = JSON.parse(user);
    } catch (e) {
        // ignore parse error
    }
    if (user) {
        const nameEl = getEl('userName');
        const initialsEl = getEl('userInitials');
        if (nameEl) nameEl.textContent = user.name || '';
        if (initialsEl) {
            const initials = (user.name || '')
                .split(' ')
                .map(n => n[0] || '')
                .join('')
                .toUpperCase()
                .substring(0, 2);
            initialsEl.textContent = initials;
        }
    }
}

// Load expenses data from API
async function loadExpensesData() {
    try {
        const summaryResponse = await API.getDashboardSummary(currentMonth, currentYear);
        
        if (summaryResponse && summaryResponse.status === 'success' && summaryResponse.data) {
            const data = summaryResponse.data;
            
            const totalExpenseEl = getEl('totalExpense');
            if (totalExpenseEl) totalExpenseEl.textContent = Format.currency(Number(data.total_expense) || 0);
            
            // Update top category
            const topCatEl = getEl('topCategory');
            const topCatAmountEl = getEl('topCategoryAmount');
            if (data.top_categories && data.top_categories.length > 0) {
                const topCat = data.top_categories[0];
                if (topCatEl) topCatEl.textContent = topCat.category || 'No Data';
                if (topCatAmountEl) topCatAmountEl.textContent = Format.currency(Number(topCat.total) || 0);
            } else {
                if (topCatEl) topCatEl.textContent = 'No Data';
                if (topCatAmountEl) topCatAmountEl.textContent = Format.currency(0);
            }
            
            // Store and render expenses by category
            if (data.top_categories) {
                expensesData = data.top_categories;
                const totalCategoriesEl = getEl('totalCategories');
                if (totalCategoriesEl) totalCategoriesEl.textContent = String(expensesData.length || 0);
                renderExpenses(expensesData);
            } else {
                showEmptyState();
            }
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
        showEmptyState();
    }
}

// Render expenses cards
function renderExpenses(expenses) {
    const grid = getEl('expenseGrid');
    if (!grid) return;
    
    if (!expenses || expenses.length === 0) {
        showEmptyState();
        return;
    }
    
    const icons = {
        'Food': 'fa-utensils',
        'Transport': 'fa-car',
        'Shopping': 'fa-shopping-cart',
        'Entertainment': 'fa-film',
        'Bills': 'fa-file-invoice',
        'Healthcare': 'fa-heartbeat',
        'Education': 'fa-graduation-cap',
        'Rent': 'fa-home',
        'Utilities': 'fa-bolt',
        'Other': 'fa-ellipsis-h'
    };
    
    grid.innerHTML = expenses.map(expense => {
        const category = escapeHtml(String(expense.category || 'Other'));
        const total = Number(expense.total) || 0;
        const count = Number(expense.count) || 0;
        const avg = count > 0 ? total / count : 0;
        const iconClass = icons[category] || 'fa-receipt';
        
        return `
        <div class="expense-card">
            <div class="expense-header">
                <div>
                    <div class="expense-category">${category}</div>
                    <div class="expense-amount">${Format.currency(total)}</div>
                </div>
                <div class="expense-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
            </div>
            <div class="expense-details">
                <div class="expense-detail">
                    <span class="expense-label">Transactions</span>
                    <span class="expense-value">${count} times</span>
                </div>
                <div class="expense-detail">
                    <span class="expense-label">Average</span>
                    <span class="expense-value">${Format.currency(avg)}</span>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Show empty state
function showEmptyState() {
    const grid = getEl('expenseGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-inbox" style="font-size: 4rem; color: var(--text-tertiary); opacity: 0.5; margin-bottom: 1rem;"></i>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">No expenses recorded yet</p>
            <button class="btn-primary" id="addFirstExpenseBtn">Add First Expense</button>
        </div>
    `;
    const addFirstBtn = getEl('addFirstExpenseBtn');
    if (addFirstBtn) addFirstBtn.addEventListener('click', openAddModal);
}

// Setup event listeners
function setupEventListeners() {
    const addBtn = getEl('addExpenseBtn');
    if (addBtn) addBtn.addEventListener('click', openAddModal);
    
    const closeBtn = getEl('closeModal');
    if (closeBtn) closeBtn.addEventListener('click', closeAddModal);
    
    const addModal = getEl('addExpenseModal');
    if (addModal) {
        addModal.addEventListener('click', (e) => {
            if (e.target.id === 'addExpenseModal') closeAddModal();
        });
    }
    
    const expenseForm = getEl('expenseForm');
    if (expenseForm) expenseForm.addEventListener('submit', handleAddExpense);
    
    const logoutBtn = getEl('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Logout?')) API.logout();
        });
    }
    
    const mobileToggle = getEl('mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const sidebar = getEl('sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        });
    }
}

// Open modal
function openAddModal() {
    const modal = getEl('addExpenseModal');
    if (modal) modal.classList.add('active');
}

// Close modal
function closeAddModal() {
    const modal = getEl('addExpenseModal');
    if (modal) modal.classList.remove('active');
    const form = getEl('expenseForm');
    if (form) form.reset();
}

// Handle add expense
async function handleAddExpense(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const formData = new FormData(form);
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category') || '';
    const description = formData.get('description') || '';
    
    if (!amount || isNaN(amount) || amount <= 0) {
        Toast.error('Please enter a valid amount');
        return;
    }
    if (!category) {
        Toast.error('Please select a category');
        return;
    }
    
    const data = {
        amount,
        category,
        description,
        month: currentMonth,
        year: currentYear
    };
    
    try {
        if (submitBtn) submitBtn.disabled = true;
        Loading.show();
        
     await API.addWalletTransaction({
    type: 'expense',
    amount: data.amount,
    category: data.category,
    description: data.description,
    transaction_date: new Date().toISOString().split('T')[0]
});
        
        Toast.success('Expense added successfully!');
        closeAddModal();
        await loadExpensesData();
    } catch (error) {
        console.error('Error adding expense:', error);
        Toast.error((error && error.message) || 'Failed to add expense');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        Loading.hide();
    }
}
