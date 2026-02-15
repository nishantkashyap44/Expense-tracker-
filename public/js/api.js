// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// ===== API Service =====
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = Storage.get('authToken');
  }
  
  // Set authentication token
  setToken(token) {
    this.token = token;
    Storage.set('authToken', token);
  }
  
  // Get authentication token
  getToken() {
    return this.token || Storage.get('authToken');
  }
  
  // Remove authentication token
  removeToken() {
    this.token = null;
    Storage.remove('authToken');
  }
  
  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    };
    
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      // Handle authentication errors
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Handle unauthorized access
  handleUnauthorized() {
    this.removeToken();
    Storage.remove('user');
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('login')) {
      Toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    }
  }
  
  // ===== Authentication APIs =====
  async register(name, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password }
    });
    
    if (data.data && data.data.token) {
      this.setToken(data.data.token);
      Storage.set('user', data.data.user);
    }
    
    return data;
  }
  
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    if (data.data && data.data.token) {
      this.setToken(data.data.token);
      Storage.set('user', data.data.user);
    }
    
    return data;
  }
  
  async getMe() {
    const data = await this.request('/auth/me');
    if (data.data && data.data.user) {
      Storage.set('user', data.data.user);
    }
    return data;
  }
  
  async verifyToken(token) {
    return await this.request('/auth/verify', {
      method: 'POST',
      body: { token }
    });
  }
  
  logout() {
    this.removeToken();
    Storage.remove('user');
    window.location.href = '/login.html';
  }
  
  // ===== Dashboard APIs =====
  async getDashboardSummary(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const queryString = params.toString();
    const endpoint = `/dashboard/summary${queryString ? '?' + queryString : ''}`;
    
    return await this.request(endpoint);
  }
  
  async getRecentTransactions(limit = 10) {
    return await this.request(`/dashboard/recent-transactions?limit=${limit}`);
  }
  
  async getMonthlyTrend() {
    return await this.request('/dashboard/monthly-trend');
  }
  
  async getBudgetComparison(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const queryString = params.toString();
    const endpoint = `/dashboard/budget-comparison${queryString ? '?' + queryString : ''}`;
    
    return await this.request(endpoint);
  }
  
  // ===== Transaction APIs =====
  async getTransactions(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/transactions?${params.toString()}`);
  }
  
  async addTransaction(transaction) {
    return await this.request('/transactions', {
      method: 'POST',
      body: transaction
    });
  }
  
  async updateTransaction(id, transaction) {
    return await this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: transaction
    });
  }
  
  async deleteTransaction(id) {
    return await this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }
  
  // ===== Expense APIs =====
  async getExpenses(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return await this.request(`/expenses?${params.toString()}`);
  }
  
  async addExpense(expense) {
    return await this.request('/expenses', {
      method: 'POST',
      body: expense
    });
  }
  
  async updateExpense(id, expense) {
    return await this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: expense
    });
  }
  
  async deleteExpense(id) {
    return await this.request(`/expenses/${id}`, {
      method: 'DELETE'
    });
  }
  
  // ===== Budget APIs =====
  async getBudgets(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return await this.request(`/budget?${params.toString()}`);
  }
  
  async addBudget(budget) {
    return await this.request('/budget', {
      method: 'POST',
      body: budget
    });
  }
  
  async updateBudget(id, budget) {
    return await this.request(`/budget/${id}`, {
      method: 'PUT',
      body: budget
    });
  }
  
  async deleteBudget(id) {
    return await this.request(`/budget/${id}`, {
      method: 'DELETE'
    });
  }
  
  // ===== Wallet APIs =====
  async getWallet() {
    return await this.request('/wallet');
  }
  
  async addWalletTransaction(transaction) {
    return await this.request('/wallet/transaction', {
      method: 'POST',
      body: transaction
    });
  }
  
  // ===== Chart APIs =====
  async getChartData(type, month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return await this.request(`/charts/${type}?${params.toString()}`);
  }
  
  // ===== Report APIs =====
  async getReports(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return await this.request(`/reports?${params.toString()}`);
  }
}

// Create global API instance
const API = new APIService();

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
  const token = API.getToken();
  const currentPath = window.location.pathname;
  
  // Public pages
  const publicPages = ['/login.html', '/register.html', '/'];
  const isPublicPage = publicPages.some(page => currentPath.includes(page));
  
  if (!token && !isPublicPage && currentPath !== '/') {
    // No token and not on public page - redirect to login
    window.location.href = '/login.html';
  } else if (token && (currentPath.includes('login') || currentPath.includes('register'))) {
    // Has token but on login/register page - redirect to dashboard
    window.location.href = '/dashboard.html';
  } else if (token) {
    // Verify token is still valid
    try {
      await API.verifyToken(token);
    } catch (error) {
      // Token invalid - redirect to login
      API.handleUnauthorized();
    }
  }
});

// Export API
window.API = API;
