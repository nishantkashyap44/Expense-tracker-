// ===== Dashboard Default State =====
const DEFAULT_DASHBOARD_STATE = {
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  charts: {
    trend: null,
    category: null
  },
  data: {
    summary: null,
    transactions: null,
    budget: null,
    trend: null
  }
};

// ===== HTML Sanitization Helper =====
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Dashboard Initialization =====
class Dashboard {
  constructor() {
    // Create a deep copy of the default state for each instance
    this.state = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_STATE));
    this.init();
  }
  
  async init() {
    try {
      Loading.show();
      
      // ✅ Load theme FIRST before anything else
      this.loadTheme();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Load user info
      await this.loadUserInfo();
      
      // Load all dashboard data
      await Promise.all([
        this.loadDashboardSummary(),
        this.loadRecentTransactions(),
        this.loadBudgetComparison(),
        this.loadMonthlyTrend()
      ]);
      
      // Initialize charts
      this.initializeCharts();
      
      Loading.hide();
      Toast.success('Dashboard loaded successfully');
      
    } catch (error) {
      Loading.hide();
      console.error('Dashboard initialization error:', error);
      Toast.error('Failed to load dashboard: ' + error.message);
    }
  }
  
  // ===== Setup Event Listeners =====
  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
    
    // Theme toggle - Use arrow function to preserve 'this'
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleTheme();
      });
    }
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        const page = item.dataset.page;
        if (page && page !== 'dashboard') {
          e.preventDefault();
          Toast.info(`${page.charAt(0).toUpperCase() + page.slice(1)} page coming soon!`);
        }
      });
    });

    // Sidebar links navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href === '#dashboard') {
          e.preventDefault();
          window.location.href = '/dashboard.html';
        } else if (href === '#transactions') {
          e.preventDefault();
          window.location.href = '/transactions.html';
        } else if (href === '#expenses') {
          e.preventDefault();
          window.location.href = '/expenses.html';
        } else if (href === '#budget') {
          e.preventDefault();
          window.location.href = '/budget.html';
        } else if (href === '#reports') {
          e.preventDefault();
          window.location.href = '/reports.html';
        } else if (href === '#settings') {
          e.preventDefault();
          Toast.info('Settings page coming soon!');
        }
      });
    });
    
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.handleSearch(e.target.value);
      }, 500));
    }
  }
  
  // ===== Load User Info =====
  async loadUserInfo() {
    try {
      const user = Storage.get('user');
      if (user) {
        this.updateUserDisplay(user);
      } else {
        const response = await API.getMe();
        if (response.data && response.data.user) {
          this.updateUserDisplay(response.data.user);
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }
  
  updateUserDisplay(user) {
    const userName = document.getElementById('userName');
    const userInitials = document.getElementById('userInitials');
    
    if (userName) {
      userName.textContent = user.name || 'User';
    }
    
    if (userInitials && user.name) {
      const initials = user.name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      userInitials.textContent = initials;
    }
  }
  
  // ===== Load Dashboard Summary =====
  async loadDashboardSummary() {
    try {
      const response = await API.getDashboardSummary(
        this.state.currentMonth,
        this.state.currentYear
      );
      
      if (response.status === 'success' && response.data) {
        this.state.data.summary = response.data;
        this.updateSummaryCards(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard summary:', error);
      this.showEmptyState('summary');
    }
  }
  
  updateSummaryCards(data) {
    // Guard clause for null/undefined data
    if (!data) return;
    
    // Wallet Balance
    this.animateValue('walletBalance', 0, data.wallet_balance || 0, 1000, true);
    
    // Monthly Income
    this.animateValue('monthlyIncome', 0, data.total_income || 0, 1000, true);
    
    // Monthly Expense
    this.animateValue('monthlyExpense', 0, data.total_expense || 0, 1000, true);
    
    // Monthly Savings - Calculate correctly
    const totalIncome = Number(data.total_income || 0);
    const totalExpenses = Number(data.total_expense || 0);
    const correctSavings = totalIncome - totalExpenses;
    
    this.animateValue('monthlySavings', 0, correctSavings, 1000, true);
    
    // Color the savings red if negative
    const savingsElement = document.getElementById('monthlySavings');
    if (savingsElement) {
        if (correctSavings < 0) {
            savingsElement.style.color = '#ef4444';
        } else {
            savingsElement.style.color = '#10b981';
        }
    }
    
    // Savings Rate
    const savingsRate = document.getElementById('savingsRate');
    if (savingsRate) {
        const calculatedRate = totalIncome > 0 ? 
            Math.round((correctSavings / totalIncome) * 100) : 0;
        savingsRate.textContent = `${calculatedRate}% rate`;
        
        if (calculatedRate < 0) {
            savingsRate.style.color = '#ef4444';
        } else {
            savingsRate.style.color = '#10b981';
        }
    }
    
    // Update transaction counts
    const incomeChange = document.getElementById('incomeChange');
    const expenseChange = document.getElementById('expenseChange');
    
    if (incomeChange && data.transactions) {
        incomeChange.textContent = `${data.transactions.income_count || 0} transactions`;
    }
    
    if (expenseChange && data.transactions) {
        expenseChange.textContent = `${data.transactions.expense_count || 0} transactions`;
    }
  }

  // ===== Animate Number Value =====
  animateValue(elementId, start, end, duration, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Remove skeleton loader
    const skeleton = element.querySelector('.skeleton-loader');
    if (skeleton) {
        skeleton.remove();
    }
    
    const range = end - start;
    const steps = Math.max(Math.round(duration / 16), 1);
    
    // Guard against infinite animation
    if (steps === 0 || range === 0) {
      if (isCurrency) {
        const absValue = Math.abs(end);
        const sign = end < 0 ? '-' : '';
        element.textContent = sign + Format.currency(absValue);
      } else {
        element.textContent = Format.number(Math.round(end));
      }
      return;
    }
    
    const increment = range / steps;
    let current = start;
    let stepCount = 0;
    const maxSteps = steps + 10; // Safety limit
    
    const timer = setInterval(() => {
        stepCount++;
        current += increment;
        
        // Check if animation should end
        const shouldEnd = (increment > 0 && current >= end) || 
                         (increment < 0 && current <= end) ||
                         stepCount >= maxSteps;
        
        if (shouldEnd) {
            current = end;
            clearInterval(timer);
        }
        
        if (isCurrency) {
            const absValue = Math.abs(current);
            const sign = current < 0 ? '-' : '';
            element.textContent = sign + Format.currency(absValue);
        } else {
            element.textContent = Format.number(Math.round(current));
        }
    }, 16);
  }

  // ===== Load Recent Transactions =====
  async loadRecentTransactions() {
    try {
      const response = await API.getRecentTransactions(8);
      
      if (response.status === 'success' && response.data) {
        this.state.data.transactions = response.data.transactions;
        this.renderTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.showEmptyState('transactions');
    }
  }
  
  renderTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const loading = container.querySelector('.transaction-loading');
    if (loading) loading.remove();
    
    if (!transactions || transactions.length === 0) {
      this.showEmptyState('transactions');
      return;
    }
    
    container.innerHTML = transactions.map(transaction => `
      <div class="transaction-item">
        <div class="transaction-icon ${transaction.type}">
          <i class="fas ${transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
        </div>
        <div class="transaction-details">
          <div class="transaction-category">${sanitizeHTML(transaction.category || 'Uncategorized')}</div>
          <div class="transaction-description">${sanitizeHTML(transaction.description || 'No description')}</div>
        </div>
        <div class="transaction-date">${Format.relativeTime(transaction.transaction_date)}</div>
        <div class="transaction-amount ${transaction.type}">
          ${transaction.type === 'income' ? '+' : '-'}${Format.currency(transaction.amount)}
        </div>
      </div>
    `).join('');
  }
  
  // ===== Load Budget Comparison =====
  async loadBudgetComparison() {
    try {
      const response = await API.getBudgetComparison(
        this.state.currentMonth,
        this.state.currentYear
      );
      
      if (response.status === 'success' && response.data) {
        this.state.data.budget = response.data.comparison;
        this.renderBudgets(response.data.comparison);
      }
    } catch (error) {
      console.error('Error loading budget comparison:', error);
      this.showEmptyState('budget');
    }
  }
  
  renderBudgets(budgets) {
    const container = document.getElementById('budgetList');
    if (!container) return;
    
    const loading = container.querySelector('.budget-loading');
    if (loading) loading.remove();
    
    if (!budgets || budgets.length === 0) {
      this.showEmptyState('budget');
      return;
    }
    
    container.innerHTML = budgets.slice(0, 5).map(budget => {
      const percentage = parseFloat(budget.percentage_used) || 0;
      let progressClass = '';
      let remainingClass = 'positive';
      
      if (percentage >= 100) {
        progressClass = 'danger';
        remainingClass = 'negative';
      } else if (percentage >= 80) {
        progressClass = 'warning';
      }
      
      return `
        <div class="budget-item">
          <div class="budget-header">
            <div class="budget-category">${sanitizeHTML(budget.category || 'Unknown')}</div>
            <div class="budget-amount">${Format.currency(budget.actual_spent || 0)} / ${Format.currency(budget.budget_amount || 0)}</div>
          </div>
          <div class="budget-progress-bar">
            <div class="budget-progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="budget-stats">
            <span class="budget-spent">${percentage.toFixed(1)}% used</span>
            <span class="budget-remaining ${remainingClass}">
              ${Format.currency(Math.abs(budget.remaining || 0))} ${(budget.remaining || 0) >= 0 ? 'left' : 'over'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // ===== Load Monthly Trend =====
  async loadMonthlyTrend() {
    try {
      const response = await API.getMonthlyTrend();
      
      if (response.status === 'success' && response.data) {
        this.state.data.trend = response.data.trend;
        this.updateTrendChart(response.data.trend);
        
        if (this.state.data.summary && this.state.data.summary.top_categories) {
          this.updateCategoryChart(this.state.data.summary.top_categories);
        }
      }
    } catch (error) {
      console.error('Error loading monthly trend:', error);
    }
  }
  
  // ===== Initialize Charts =====
  initializeCharts() {
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      this.state.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Income',
              data: [],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Expenses',
              data: [],
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return context.dataset.label + ': ' + Format.currency(context.parsed.y);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return Format.currency(value);
                }
              }
            }
          }
        }
      });
    }
    
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
      this.state.charts.category = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(59, 130, 246, 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = Format.currency(context.parsed);
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Update charts with data if already loaded
    if (this.state.data.trend && this.state.data.trend.length > 0) {
      this.updateTrendChart(this.state.data.trend);
    }

    if (this.state.data.summary && this.state.data.summary.top_categories && this.state.data.summary.top_categories.length > 0) {
      this.updateCategoryChart(this.state.data.summary.top_categories);
    }
  }
  
  updateTrendChart(trendData) {
    const trendEmptyEl = document.getElementById('trendChartEmpty');
    if (!this.state.charts.trend || !trendData || trendData.length === 0) {
      if (trendEmptyEl) trendEmptyEl.style.display = 'flex';
      return;
    }

    if (trendEmptyEl) trendEmptyEl.style.display = 'none';
    
    const labels = trendData.map(item => 
      `${Format.monthName(item.month)} ${item.year}`
    );
    const income = trendData.map(item => parseFloat(item.income) || 0);
    const expenses = trendData.map(item => parseFloat(item.expense) || 0);
    
    this.state.charts.trend.data.labels = labels;
    this.state.charts.trend.data.datasets[0].data = income;
    this.state.charts.trend.data.datasets[1].data = expenses;
    this.state.charts.trend.update();
  }
  
  updateCategoryChart(categories) {
    const categoryEmptyEl = document.getElementById('categoryChartEmpty');
    if (!this.state.charts.category || !categories || categories.length === 0) {
      if (categoryEmptyEl) categoryEmptyEl.style.display = 'flex';
      return;
    }

    if (categoryEmptyEl) categoryEmptyEl.style.display = 'none';
    
    const labels = categories.map(cat => cat.category);
    const data = categories.map(cat => parseFloat(cat.total) || 0);
    
    this.state.charts.category.data.labels = labels;
    this.state.charts.category.data.datasets[0].data = data;
    this.state.charts.category.update();
  }
  
  showEmptyState(type) {
    const emptyStateIds = {
      summary: null,
      transactions: 'transactionsEmpty',
      budget: 'budgetEmpty'
    };
    
    const emptyId = emptyStateIds[type];
    if (emptyId) {
      const element = document.getElementById(emptyId);
      if (element) {
        element.style.display = 'block';
      }
    }
  }
  
  // ===== Theme Management =====
  toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    
    if (themeIcon) {
      themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    Storage.set('theme', isDark ? 'dark' : 'light');
  }
  
  loadTheme() {
    const savedTheme = Storage.get('theme');
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    
    if (savedTheme === 'dark') {
      body.classList.add('dark-theme');
      if (themeIcon) {
        themeIcon.className = 'fas fa-sun';
      }
    } else {
      body.classList.remove('dark-theme');
      if (themeIcon) {
        themeIcon.className = 'fas fa-moon';
      }
    }
  }
  
  // ===== Handle Search =====
  handleSearch(query) {
    if (!query || query.trim() === '') {
      this.loadRecentTransactions();
      return;
    }
    
    const searchStr = query.toLowerCase().trim();
    
    const filtered = (this.state.data.transactions || []).filter(transaction => {
      return (
        (transaction.category && transaction.category.toLowerCase().includes(searchStr)) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchStr)) ||
        (transaction.amount && transaction.amount.toString().includes(searchStr))
      );
    });
    
    this.renderTransactions(filtered);
  }
  
  // ===== Handle Logout =====
  handleLogout() {
    // Use a custom modal or Toast confirmation instead of browser confirm
    Toast.info('Logging out...');
    
    // Small delay for UX
    setTimeout(() => {
      try {
        API.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      // Clear local storage
      Storage.clear();
      
      // Redirect to login page
      window.location.href = '/login.html';
    }, 500);
  }
  
  // ===== Cleanup =====
  destroy() {
    // Destroy charts to prevent memory leaks
    if (this.state.charts.trend) {
      this.state.charts.trend.destroy();
      this.state.charts.trend = null;
    }
    if (this.state.charts.category) {
      this.state.charts.category.destroy();
      this.state.charts.category = null;
    }
    
    // Clear data
    this.state.data = {
      summary: null,
      transactions: null,
      budget: null,
      trend: null
    };
  }
}

// ===== Initialize Dashboard on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
  const token = API.getToken();
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  new Dashboard();
}); 