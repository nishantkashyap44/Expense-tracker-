// ================= API CONFIG =================
const API_BASE_URL = window.location.origin + "/api";

// ================= API SERVICE =================
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = Storage.get("authToken");
  }

  // ===== TOKEN HANDLING =====
  setToken(token) {
    this.token = token;
    Storage.set("authToken", token);
  }

  getToken() {
    return this.token || Storage.get("authToken");
  }

  removeToken() {
    this.token = null;
    Storage.remove("authToken");
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
    Storage.remove("user");

    if (!window.location.pathname.includes("login")) {
      Toast.error("Session expired. Please login again.");
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
      Storage.set("user", data.data.user);
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
      Storage.set("user", data.data.user);
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
    Storage.remove("user");
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
    const params = new URLSearchParams(filters);
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
const API = new APIService();
window.API = API;

// ================= AUTH CHECK ✅ FIXED FOR 429 ERROR =================
let authCheckDone = false; // ✅ Prevent multiple checks

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ EXIT if already checked
  if (authCheckDone) return;
  authCheckDone = true;

  const token = API.getToken();
  const path = window.location.pathname;
  const publicPages = ["/login.html", "/register.html", "/"];
  const isPublic = publicPages.some(page => path.includes(page));

  // Redirect to login if no token
  if (!token && !isPublic) {
    window.location.href = "/login.html";
    return;
  }

  // Redirect to dashboard if logged in and on login page
  if (token && (path.includes("login") || path.includes("register"))) {
    window.location.href = "/dashboard.html";
    return;
  }

  // ✅ Verify token with 5 second timeout (prevents rate limiting)
  if (token && !isPublic) {
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
});


