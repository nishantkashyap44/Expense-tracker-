let allBudgets = [];
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

document.addEventListener('DOMContentLoaded', async () => {
    Loading.show();
    try {
        await loadUserInfo();
        await loadBudgets();
        setupEventListeners();
        Toast.success('Budgets loaded');
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Failed to load budgets');
    } finally {
        Loading.hide();
    }
});

async function loadUserInfo() {
    let user = Storage.get('user');
    try {
        if (typeof user === 'string') user = JSON.parse(user);
    } catch (e) {}
    if (user) {
        const nameEl = document.getElementById('userName');
        const initialsEl = document.getElementById('userInitials');
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

// ✅ Load budgets from API with spent amounts calculated from expenses
async function loadBudgets() {
    try {
        const budgetResponse = await API.getBudgets(currentMonth, currentYear);
        const expenseResponse = await API.getExpenses(currentMonth, currentYear);
        
        if (budgetResponse && budgetResponse.status === 'success' && budgetResponse.data) {
            allBudgets = Array.isArray(budgetResponse.data) ? budgetResponse.data : [];
            
            // ✅ Calculate spent amount from expenses
            if (expenseResponse && expenseResponse.status === 'success' && expenseResponse.data) {
                const expenses = Array.isArray(expenseResponse.data) ? expenseResponse.data : [];
                
                // Sum expenses by category
                const spentByCategory = {};
                expenses.forEach(exp => {
                    const cat = exp.category || 'Other';
                    spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(exp.amount || 0);
                });
                
                // Update budgets with spent amounts
                allBudgets = allBudgets.map(budget => ({
                    ...budget,
                    spent: spentByCategory[budget.category] || 0
                }));
            }
            
            calculateSummary();
            renderBudgets(allBudgets);
        } else {
            allBudgets = [];
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading budgets:', error);
        allBudgets = [];
        showEmptyState();
    }
}

// ✅ Calculate summary stats
function calculateSummary() {
    if (!allBudgets || allBudgets.length === 0) {
        document.getElementById('totalBudget').textContent = '₹0';
        document.getElementById('totalSpent').textContent = '₹0';
        document.getElementById('remaining').textContent = '₹0';
        return;
    }

    const totalBudget = allBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const totalSpent = allBudgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    document.getElementById('totalBudget').textContent = '₹' + totalBudget.toLocaleString();
    document.getElementById('totalSpent').textContent = '₹' + totalSpent.toLocaleString();
    document.getElementById('remaining').textContent = '₹' + remaining.toLocaleString();
    document.getElementById('spentPercentage').textContent = percentage + '% used';
    document.getElementById('remainingPercentage').textContent = (100 - percentage) + '% available';
}

// ✅ Render budget cards
function renderBudgets(budgets) {
    const budgetList = document.getElementById('budgetList');
    if (!budgetList) return;

    if (!budgets || budgets.length === 0) {
        showEmptyState();
        return;
    }

    budgetList.innerHTML = budgets.map(budget => {
        const amount = Number(budget.amount || 0);
        const spent = Number(budget.spent || 0);
        const remaining = amount - spent;
        const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;

        let progressClass = 'success';
        let badgeClass = 'success';

        if (percentage >= 100) {
            progressClass = 'danger';
            badgeClass = 'danger';
        } else if (percentage >= 80) {
            progressClass = 'warning';
            badgeClass = 'warning';
        }

        return `
            <div class="budget-card">
                <div class="budget-header">
                    <div class="budget-info">
                        <div class="budget-category">${budget.category}</div>
                        <div class="budget-subtitle">Month: ${currentMonth}/${currentYear}</div>
                    </div>
                    <div class="budget-amounts">
                        <div class="budget-spent">₹${spent.toLocaleString()}</div>
                        <div class="budget-total">of ₹${amount.toLocaleString()}</div>
                    </div>
                </div>

                <div class="percentage-badge ${badgeClass}">
                    <i class="fas fa-chart-pie"></i>
                    ${percentage}% Used
                </div>

                <div class="progress-wrapper">
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>

                <div class="budget-stats">
                    <div class="stat-item">
                        <span class="stat-label">Spent</span>
                        <span class="stat-value negative">₹${spent.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Remaining</span>
                        <span class="stat-value ${remaining >= 0 ? 'positive' : 'negative'}">₹${Math.abs(remaining).toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Limit</span>
                        <span class="stat-value">₹${amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showEmptyState() {
    const budgetList = document.getElementById('budgetList');
    if (budgetList) {
        budgetList.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: var(--text-tertiary); opacity: 0.5; margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">No budgets created yet</p>
                <button class="btn-add-budget" id="addFirstBudgetBtn">Create First Budget</button>
            </div>
        `;
        const addFirstBtn = document.getElementById('addFirstBudgetBtn');
        if (addFirstBtn) addFirstBtn.addEventListener('click', openAddModal);
    }
}

function setupEventListeners() {
    const addBtn = document.getElementById('addBudgetBtn');
    if (addBtn) addBtn.addEventListener('click', openAddModal);
    
    const closeBtn = document.getElementById('closeBudgetModal');
    if (closeBtn) closeBtn.addEventListener('click', closeAddModal);
    
    const modal = document.getElementById('addBudgetModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'addBudgetModal') closeAddModal();
        });
    }
    
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) budgetForm.addEventListener('submit', handleAddBudget);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Logout?')) API.logout();
        });
    }
    
    const mobileToggle = document.getElementById('mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        });
    }
}

function openAddModal() {
    const modal = document.getElementById('addBudgetModal');
    if (modal) modal.classList.add('active');
}

function closeAddModal() {
    const modal = document.getElementById('addBudgetModal');
    if (modal) modal.classList.remove('active');
    const form = document.getElementById('budgetForm');
    if (form) form.reset();
}

// ✅ Handle add budget
async function handleAddBudget(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const formData = new FormData(form);
    const category = formData.get('category') || '';
    const amount = parseFloat(formData.get('amount'));
    const month = parseInt(formData.get('month')) || currentMonth;
    const year = parseInt(formData.get('year')) || currentYear;
    
    if (!category || !amount || amount <= 0) {
        Toast.error('Please fill all required fields');
        return;
    }
    
    const data = {
        category: category.trim(),
        amount: amount,
        month: month,
        year: year
    };
    
    try {
        if (submitBtn) submitBtn.disabled = true;
        Loading.show();
        
        await API.addBudget(data);
        
        Toast.success('Budget created successfully!');
        closeAddModal();
        form.reset();
        await loadBudgets();
    } catch (error) {
        console.error('Error adding budget:', error);
        Toast.error(error.message || 'Failed to create budget');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        Loading.hide();
    }
}// ✅ Handle add budget with better error handling
async function handleAddBudget(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const formData = new FormData(form);
    const category = formData.get('category') || '';
    const amount = parseFloat(formData.get('amount'));
    const month = parseInt(formData.get('month')) || currentMonth;
    const year = parseInt(formData.get('year')) || currentYear;
    
    if (!category || !amount || amount <= 0) {
        Toast.error('Please fill all required fields');
        return;
    }
    
    const data = {
        category: category.trim(),
        amount: amount,
        month: month,
        year: year
    };
    
    try {
        if (submitBtn) submitBtn.disabled = true;
        Loading.show();
        
        console.log('Adding budget:', data);
        await API.addBudget(data);
        
        Loading.hide();
        Toast.success('Budget created successfully! ✅');
        closeAddModal();
        form.reset();
        await loadBudgets();
        
    } catch (error) {
        Loading.hide();
        console.error('Full error object:', error);
        
        // ✅ Extract error message properly
        let errorMessage = 'Failed to create budget';
        
        if (error.message) {
            errorMessage = error.message;
        }
        
        // Show error as Toast notification (visible on page)
        Toast.error(errorMessage);
        
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}
// ✅ Load theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = Storage.get('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
    
    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            const icon = document.querySelector('#themeToggle i');
            if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            Storage.set('theme', isDark ? 'dark' : 'light');
        });
    }
    
    // ... rest of your code
});