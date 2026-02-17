let allTransactions = [];
let currentPeriod = 6;
let chartInstances = {};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Reports page loaded');
    Loading.show();
    try {
        await loadUserInfo();
        console.log('User info loaded');
        
        await loadReports();
        console.log('Reports loaded');
        
        setupEventListeners();
        console.log('Event listeners setup');
        
        Toast.success('Reports loaded ✅');
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        Toast.error('Failed to load reports: ' + error.message);
    } finally {
        Loading.hide();
    }
});

async function loadUserInfo() {
    try {
        let user = Storage.get('user');
        if (typeof user === 'string') {
            user = JSON.parse(user);
        }
        if (user) {
            const nameEl = document.getElementById('userName');
            const initialsEl = document.getElementById('userInitials');
            if (nameEl) nameEl.textContent = user.name || 'User';
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
    } catch (err) {
        console.error('Error loading user info:', err);
    }
}

// ✅ Load all report data
async function loadReports() {
    try {
        console.log('Fetching transactions...');
        const response = await API.getTransactions();
        
        if (!response) {
            throw new Error('No response from API');
        }
        
        if (response.status === 'success') {
            allTransactions = Array.isArray(response.data) ? response.data : [];
            console.log('Transactions loaded:', allTransactions.length);
        } else {
            console.warn('API returned non-success status:', response.status);
            allTransactions = [];
        }
        
        if (allTransactions.length > 0) {
            calculateMetrics();
            generateTrendChart();
            generateCategoryChart();
            generateSavingsChart();
        } else {
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showEmptyState();
        Toast.error('Failed to load transactions');
    }
}

function showEmptyState() {
    document.getElementById('trendChartEmpty').style.display = 'flex';
    document.getElementById('categoryChartEmpty').style.display = 'flex';
}

// ✅ Calculate metrics
function calculateMetrics() {
    if (!allTransactions || allTransactions.length === 0) {
        document.getElementById('totalIncome6M').textContent = '₹0';
        document.getElementById('totalExpense6M').textContent = '₹0';
        document.getElementById('netSavings6M').textContent = '₹0';
        return;
    }
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - currentPeriod);
    
    const recentTransactions = allTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= sixMonthsAgo;
    });
    
    const totalIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const totalExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
    
    document.getElementById('totalIncome6M').textContent = '₹' + totalIncome.toLocaleString();
    document.getElementById('totalExpense6M').textContent = '₹' + totalExpenses.toLocaleString();
    document.getElementById('netSavings6M').textContent = '₹' + netSavings.toLocaleString();
    document.getElementById('savingsRate6M').textContent = savingsRate + '% rate';
}

// ✅ Monthly Trend Chart
function generateTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    // Destroy old chart
    if (chartInstances.trend) {
        chartInstances.trend.destroy();
    }
    
    const monthlyData = {};
    allTransactions.forEach(t => {
        const date = new Date(t.transaction_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (t.type === 'income') {
            monthlyData[monthKey].income += Number(t.amount || 0);
        } else {
            monthlyData[monthKey].expense += Number(t.amount || 0);
        }
    });
    
    const months = Object.keys(monthlyData).sort();
    const recentMonths = months.slice(-currentPeriod);
    
    if (recentMonths.length === 0) {
        document.getElementById('trendChartEmpty').style.display = 'flex';
        return;
    }
    
    document.getElementById('trendChartEmpty').style.display = 'none';
    
    const income = recentMonths.map(m => monthlyData[m].income);
    const expenses = recentMonths.map(m => monthlyData[m].expense);
    
    if (window.Chart) {
        chartInstances.trend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: recentMonths,
                datasets: [
                    {
                        label: 'Income',
                        data: income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    },
                    {
                        label: 'Expenses',
                        data: expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ✅ Category Chart
function generateCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    if (chartInstances.category) {
        chartInstances.category.destroy();
    }
    
    const expenses = allTransactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        document.getElementById('categoryChartEmpty').style.display = 'flex';
        return;
    }
    
    document.getElementById('categoryChartEmpty').style.display = 'none';
    
    const categoryData = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categoryData[cat] = (categoryData[cat] || 0) + Number(exp.amount || 0);
    });
    
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
                    '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#06b6d4'];
    
    if (window.Chart) {
        chartInstances.category = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderColor: 'var(--bg-secondary)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// ✅ Savings Chart
function generateSavingsChart() {
    const canvas = document.getElementById('savingsChart');
    if (!canvas) return;
    
    if (chartInstances.savings) {
        chartInstances.savings.destroy();
    }
    
    const monthlyData = {};
    allTransactions.forEach(t => {
        const date = new Date(t.transaction_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (t.type === 'income') {
            monthlyData[monthKey].income += Number(t.amount || 0);
        } else {
            monthlyData[monthKey].expense += Number(t.amount || 0);
        }
    });
    
    const months = Object.keys(monthlyData).sort();
    const recentMonths = months.slice(-currentPeriod);
    const savings = recentMonths.map(m => monthlyData[m].income - monthlyData[m].expense);
    
    if (window.Chart) {
        chartInstances.savings = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: recentMonths,
                datasets: [{
                    label: 'Monthly Savings',
                    data: savings,
                    backgroundColor: savings.map(s => s >= 0 ? '#10b981' : '#ef4444'),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ✅ Setup event listeners
function setupEventListeners() {
    const trendPeriod = document.getElementById('trendPeriod');
    if (trendPeriod) {
        trendPeriod.addEventListener('change', (e) => {
            currentPeriod = parseInt(e.target.value);
            calculateMetrics();
            generateTrendChart();
            generateSavingsChart();
            Toast.success('Period updated ✅');
        });
    }
    
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