// ================= API CONFIG =================
const API_BASE_URL = window.location.origin + "/api";

// ================= WAIT FOR UTILS =================
// Storage and Toast must be loaded from utils.js before this file runs
function waitForUtils(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (window.Storage && window.Toast) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for utils.js to load'));
        return;
      }
      
      setTimeout(check, 50);
    };
    
    check();
  });
}

// ================= API SERVICE =================
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = window.Storage?.get("authToken") || null;
  }

  // ===== TOKEN HANDLING =====
  setToken(token) {
    this.token = token;
    window.Storage?.set("authToken", token);
  }

  getToken() {
    return this.token || window.Storage?.get("authToken");
  }

  removeToken() {
    this.token = null;
    window.Storage?.remove("authToken");
  }

  // ===== CORE REQUEST METHOD =====
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : null;

      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error("Session expired");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      return data;

    } catch (error) {
      console.error("API ERROR:", error.message);
      throw error;
    }
  }

  // ===== UNAUTHORIZED HANDLER =====
  handleUnauthorized() {
    this.removeToken();
    window.Storage?.remove("user");

    const isLoginPage = window.location.pathname.includes("login");
    
    if (!isLoginPage) {
      // Show toast if Toast is available, otherwise use alert
      if (window.Toast?.error) {
        window.Toast.error("Session expired. Please login again.");
      } else {
        console.warn("Session expired. Please login again.");
      }
      
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1500);
    }
  }

  // ================= AUTH APIs =================
  async register(name, email, password) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: { name, email, password }
    });

    if (data?.data?.token) {
      this.setToken(data.data.token);
      window.Storage?.set("user", data.data.user);
    }

    return data;
  }

  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: { email, password }
    });

    if (data?.data?.token) {
      this.setToken(data.data.token);
      window.Storage?.set("user", data.data.user);
    }

    return data;
  }

  async verifyToken(token) {
    return await this.request("/auth/verify", {
      method: "POST",
      body: { token }
    });
  }

  logout() {
    this.removeToken();
    window.Storage?.remove("user");
    window.location.href = "/login.html";
  }

  // ================= DASHBOARD =================
  async getDashboardSummary(month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return await this.request(`/dashboard/summary?${params.toString()}`);
  }

  async getRecentTransactions(limit = 10) {
    return await this.request(`/dashboard/recent-transactions?limit=${limit}`);
  }

  async getMonthlyTrend() {
    return await this.request("/dashboard/monthly-trend");
  }

  async getBudgetComparison(month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return await this.request(`/dashboard/budget-comparison?${params.toString()}`);
  }

  // ================= TRANSACTIONS =================
  async getTransactions(filters = {}) {
    // Properly serialize filters to URLSearchParams
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle arrays (e.g., categories: ['food', 'transport'])
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });
    
    return await this.request(`/transactions?${params.toString()}`);
  }

  async addTransaction(transaction) {
    return await this.request("/transactions", {
      method: "POST",
      body: transaction
    });
  }

  async updateTransaction(id, transaction) {
    return await this.request(`/transactions/${id}`, {
      method: "PUT",
      body: transaction
    });
  }

  async deleteTransaction(id) {
    return await this.request(`/transactions/${id}`, {
      method: "DELETE"
    });
  }

  // ================= EXPENSE =================
  async getExpenses(month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return await this.request(`/expenses?${params.toString()}`);
  }

  async addExpense(expense) {
    return await this.request("/expenses", {
      method: "POST",
      body: expense
    });
  }

  async updateExpense(id, expense) {
    return await this.request(`/expenses/${id}`, {
      method: "PUT",
      body: expense
    });
  }

  async deleteExpense(id) {
    return await this.request(`/expenses/${id}`, {
      method: "DELETE"
    });
  }

  // ================= BUDGET =================
  async getBudgets(month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return await this.request(`/budget?${params.toString()}`);
  }

  async addBudget(budget) {
    return await this.request("/budget", {
      method: "POST",
      body: budget
    });
  }

  async updateBudget(id, budget) {
    return await this.request(`/budget/${id}`, {
      method: "PUT",
      body: budget
    });
  }

  async deleteBudget(id) {
    return await this.request(`/budget/${id}`, {
      method: "DELETE"
    });
  }

  // ================= WALLET =================
  async getWallet() {
    return await this.request("/wallet");
  }

  async addWalletTransaction(transaction) {
    return await this.request("/wallet/transaction", {
      method: "POST",
      body: transaction
    });
  }

  // ================= CHARTS =================
  async getChartData(type, month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return await this.request(`/charts/${type}?${params.toString()}`);
  }

  // ================= REPORTS =================
  async getReports(month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return await this.request(`/reports?${params.toString()}`);
  }
}

// ================= CREATE INSTANCE =================
// Initialize API after utils are loaded
let API = null;

async function initAPI() {
  try {
    await waitForUtils();
    API = new APIService();
    window.API = API;
    
    // Initialize auth check after API is ready
    initAuthCheck();
    
    return API;
  } catch (error) {
    console.error('Failed to initialize API:', error.message);
    throw error;
  }
}

// ================= AUTH CHECK =================
let authCheckDone = false;

function initAuthCheck() {
  // Prevent multiple checks
  if (authCheckDone) return;
  
  // Run immediately if DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAuthCheck);
  } else {
    runAuthCheck();
  }
}

function runAuthCheck() {
  // EXIT if already checked
  if (authCheckDone) return;
  authCheckDone = true;

  const token = API?.getToken?.();
  const path = window.location.pathname;
  const publicPages = ["/login.html", "/register.html", "/", "/index.html"];
  const isPublic = publicPages.some(page => path === page || path.endsWith(page));

  // Redirect to login if no token and not on public page
  if (!token && !isPublic) {
    window.location.href = "/login.html";
    return;
  }

  // Redirect to dashboard if logged in and on login/register page
  if (token && (path.includes("login") || path.includes("register"))) {
    window.location.href = "/dashboard.html";
    return;
  }

  // Verify token with 5 second timeout (prevents rate limiting)
  if (token && !isPublic) {
    verifyTokenAsync(token);
  }
}

async function verifyTokenAsync(token) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );

    await Promise.race([
      API.verifyToken(token),
      timeoutPromise
    ]);

    console.log("✅ Token verified");

  } catch (error) {
    console.warn("Token verification warning:", error.message);
    
    // Don't logout on timeout - just warn
    if (error.message === "Session expired") {
      API.handleUnauthorized();
    }
  }
}

// Auto-initialize when script loads
initAPI();


