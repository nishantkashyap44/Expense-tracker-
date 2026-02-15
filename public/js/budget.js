// Budget Page - Complete Working Code with API (fixed: safer element access, numeric fallbacks)

let budgetData = [];
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

// helper to safely get element
const $ = (id) => document.getElementById(id);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Loading !== 'undefined') Loading.show();
    
    try {
        await loadUserInfo();
        await loadBudgetData();
        setupEventListeners();
        
        if (typeof Loading !== 'undefined') Loading.hide();
        if (typeof Toast !== 'undefined') Toast.success('Budgets loaded successfully');
    } catch (error) {
        if (typeof Loading !== 'undefined') Loading.hide();
        console.error('Error:', error);
        if (typeof Toast !== 'undefined') Toast.error('Failed to load budgets');
    }
});

// Load user info
async function loadUserInfo() {
    const user = (typeof Storage !== 'undefined') ? Storage.get('user') : null;
    if (!user) return;
    const userNameEl = $('userName');
    const userInitialsEl = $('userInitials');
    if (userNameEl) userNameEl.textContent = user.name || '';
    if (userInitialsEl) {
        const initials = (user.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase().substring(0, 2);
        userInitialsEl.textContent = initials;
    }
}

// Load budget data from API
async function loadBudgetData() {
    try {
        const response = await API.getBudgetComparison(currentMonth, currentYear);
        
        if (response && response.status === 'success' && response.data) {
            budgetData = Array.isArray(response.data.comparison) ? response.data.comparison : [];
            
            // Calculate totals with numeric fallbacks
            const totalBudget = budgetData.reduce((sum, b) => sum + (parseFloat(b.budget_amount) || 0), 0);
            const totalSpent = budgetData.reduce((sum, b) => sum + (parseFloat(b.actual_spent) || 0), 0);
            const remaining = totalBudget - totalSpent;
            const spentPercentage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0';
            
            // Update summary cards (guard elements)
            const totalBudgetEl = $('totalBudget');
            const totalSpentEl = $('totalSpent');
            const remainingEl = $('remaining');
            const spentPercentageEl = $('spentPercentage');
            const remainingPercentageEl = $('remainingPercentage');
            
            if (totalBudgetEl) totalBudgetEl.textContent = typeof Format !== 'undefined' ? Format.currency(totalBudget) : totalBudget.toFixed(2);
            if (totalSpentEl) totalSpentEl.textContent = typeof Format !== 'undefined' ? Format.currency(totalSpent) : totalSpent.toFixed(2);
            if (remainingEl) remainingEl.textContent = typeof Format !== 'undefined' ? Format.currency(remaining) : remaining.toFixed(2);
            if (spentPercentageEl) spentPercentageEl.textContent = `${spentPercentage}% used`;
            if (remainingPercentageEl) remainingPercentageEl.textContent = remaining >= 0 ? 'Available' : 'Over budget';
            
            // Render budget cards
            renderBudgets(budgetData);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading budgets:', error);
        showEmptyState();
    }
}

// Render budget cards with progress bars
function renderBudgets(budgets) {
    const list = $('budgetList');
    if (!list) return;
    
    if (!budgets || budgets.length === 0) {
        showEmptyState();
        return;
    }
    
    list.innerHTML = budgets.map(budget => {
        const percentage = parseFloat(budget.percentage_used) || 0;
        const remaining = parseFloat(budget.remaining) || 0;
        
        // Determine color class
        let progressClass = 'success';
        let badgeClass = 'success';
        let badgeIcon = 'fa-check-circle';
        
        if (percentage >= 100) {
            progressClass = 'danger';
            badgeClass = 'danger';
            badgeIcon = 'fa-exclamation-circle';
        } else if (percentage >= 80) {
            progressClass = 'warning';
            badgeClass = 'warning';
            badgeIcon = 'fa-exclamation-triangle';
        }
        
        const spentText = (typeof Format !== 'undefined') ? Format.currency(parseFloat(budget.actual_spent) || 0) : (parseFloat(budget.actual_spent) || 0).toFixed(2);
        const totalText = (typeof Format !== 'undefined') ? Format.currency(parseFloat(budget.budget_amount) || 0) : (parseFloat(budget.budget_amount) || 0).toFixed(2);
        const remainingText = remaining >= 0
            ? ((typeof Format !== 'undefined') ? Format.currency(remaining) : remaining.toFixed(2))
            : ((typeof Format !== 'undefined') ? Format.currency(Math.abs(remaining)) + ' over' : Math.abs(remaining).toFixed(2) + ' over');
        
        return `
            <div class="budget-card">
                <div class="percentage-badge ${badgeClass}">
                    <i class="fas ${badgeIcon}"></i>
                    ${percentage.toFixed(1)}% Used
                </div>
                
                <div class="budget-header">
                    <div class="budget-info">
                        <div class="budget-category">${budget.category || 'Uncategorized'}</div>
                        <div class="budget-subtitle">Monthly budget tracking</div>
                    </div>
                    <div class="budget-amounts">
                        <div class="budget-spent">${spentText}</div>
                        <div class="budget-total">of ${totalText}</div>
                    </div>
                </div>
                
                <div class="progress-wrapper">
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" 
                             style="width: ${Math.min(percentage, 100)}%">
                        </div>
                    </div>
                </div>
                
                <div class="budget-stats">
                    <div class="stat-item">
                        <span class="stat-label">Remaining</span>
                        <span class="stat-value ${remaining >= 0 ? 'positive' : 'negative'}">
                            ${remainingText}
                        </span>
                    </div>
                    <div class="stat-item" style="text-align: right;">
                        <span class="stat-label">Status</span>
                        <span class="stat-value ${remaining >= 0 ? 'positive' : 'negative'}">
                            ${remaining >= 0 ? 'On Track' : 'Over Budget'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show empty state
function showEmptyState() {
    const list = $('budgetList');
    if (!list) return;
    list.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 1rem;">
            <i class="fas fa-chart-pie" style="font-size: 4rem; color: var(--text-tertiary); opacity: 0.5; margin-bottom: 1rem;"></i>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1rem;">No budgets set for this month</p>
            <p style="color: var(--text-tertiary); margin-bottom: 2rem; font-size: 0.875rem;">Create budgets to track your spending by category</p>
            <button class="btn-primary" onclick="Toast && Toast.info('Budget creation feature coming soon!')">
                <i class="fas fa-plus"></i> Create Budget
            </button>
        </div>
    `;
    
    // Update summary to zeros (guard elements)
    const totalBudgetEl = $('totalBudget');
    const totalSpentEl = $('totalSpent');
    const remainingEl = $('remaining');
    const spentPercentageEl = $('spentPercentage');
    if (totalBudgetEl) totalBudgetEl.textContent = (typeof Format !== 'undefined') ? Format.currency(0) : '0.00';
    if (totalSpentEl) totalSpentEl.textContent = (typeof Format !== 'undefined') ? Format.currency(0) : '0.00';
    if (remainingEl) remainingEl.textContent = (typeof Format !== 'undefined') ? Format.currency(0) : '0.00';
    if (spentPercentageEl) spentPercentageEl.textContent = '0% used';
}

// Setup event listeners
function setupEventListeners() {
    // Add budget button
    const addBtn = $('addBudgetBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
        if (typeof Toast !== 'undefined') Toast.info('Budget creation feature coming soon!');
    });
    
    // Logout
    const logoutBtn = $('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Logout?') && typeof API !== 'undefined' && API.logout) API.logout();
    });
    
    // Theme toggle
    const themeToggle = $('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        if (typeof Storage !== 'undefined') Storage.set('theme', isDark ? 'dark' : 'light');
    });
    
    // Load theme
    try {
        if (typeof Storage !== 'undefined' && Storage.get('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            const icon = document.querySelector('#themeToggle i');
            if (icon) icon.className = 'fas fa-sun';
        }
    } catch (e) { /* ignore storage errors */ }
    
    // Mobile toggle
    const mobileToggle = $('mobileToggle');
    if (mobileToggle) mobileToggle.addEventListener('click', () => {
        const sidebar = $('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    });
}