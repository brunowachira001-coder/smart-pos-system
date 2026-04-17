import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    this.token = response.data.accessToken;
    return response.data;
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    this.token = response.data.accessToken;
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.token = null;
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Products
  async getProducts(params?: any) {
    return this.client.get('/products', { params });
  }

  async getProduct(id: string) {
    return this.client.get(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.client.post('/products', data);
  }

  async updateProduct(id: string, data: any) {
    return this.client.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`);
  }

  async getCategories() {
    return this.client.get('/products/categories/list');
  }

  // Inventory
  async getInventory(branchId: string, params?: any) {
    return this.client.get(`/inventory/branch/${branchId}`, { params });
  }

  async getLowStockItems(branchId: string) {
    return this.client.get(`/inventory/low-stock/${branchId}`);
  }

  async updateInventory(id: string, data: any) {
    return this.client.put(`/inventory/${id}`, data);
  }

  async adjustInventory(id: string, data: any) {
    return this.client.post(`/inventory/adjust/${id}`, data);
  }

  async getInventorySummary(branchId: string) {
    return this.client.get(`/inventory/summary/${branchId}`);
  }

  // Customers
  async getCustomers(params?: any) {
    return this.client.get('/customers', { params });
  }

  async getCustomer(id: string) {
    return this.client.get(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.client.post('/customers', data);
  }

  async updateCustomer(id: string, data: any) {
    return this.client.put(`/customers/${id}`, data);
  }

  async addCustomerCredit(id: string, data: any) {
    return this.client.post(`/customers/${id}/credit`, data);
  }

  async makeCustomerPayment(id: string, data: any) {
    return this.client.post(`/customers/${id}/payment`, data);
  }

  async getCustomerStats(id: string) {
    return this.client.get(`/customers/${id}/stats`);
  }

  // Transactions
  async getTransactions(params?: any) {
    return this.client.get('/transactions', { params });
  }

  async getTransaction(id: string) {
    return this.client.get(`/transactions/${id}`);
  }

  async createTransaction(data: any) {
    return this.client.post('/transactions', data);
  }

  async getDailySales(branchId: string, params?: any) {
    return this.client.get(`/transactions/daily/${branchId}`, { params });
  }

  // Analytics
  async getDashboardMetrics(branchId: string, params?: any) {
    return this.client.get(`/analytics/dashboard/${branchId}`, { params });
  }

  async getSalesTrend(branchId: string, params?: any) {
    return this.client.get(`/analytics/sales-trend/${branchId}`, { params });
  }

  async getProductPerformance(branchId: string, params?: any) {
    return this.client.get(`/analytics/products/${branchId}`, { params });
  }

  async getCustomerAnalytics(branchId: string, params?: any) {
    return this.client.get(`/analytics/customers/${branchId}`, { params });
  }

  async getPaymentBreakdown(branchId: string, params?: any) {
    return this.client.get(`/analytics/payments/${branchId}`, { params });
  }

  // AI
  async getRecommendations(branchId: string, params?: any) {
    return this.client.get(`/ai/recommendations/${branchId}`, { params });
  }

  async getForecast(branchId: string, params?: any) {
    return this.client.get(`/ai/forecast/${branchId}`, { params });
  }

  async chatWithAI(message: string, branchId: string) {
    return this.client.post('/ai/chat', { message, branchId });
  }

  async getChatHistory() {
    return this.client.get('/ai/chat-history');
  }

  async getAIInsights(branchId: string) {
    return this.client.get(`/ai/insights/${branchId}`);
  }

  // Audit
  async getAuditLogs(params?: any) {
    return this.client.get('/audit', { params });
  }

  async logAction(data: any) {
    return this.client.post('/audit/log', data);
  }

  async getUserActivity(userId: string, params?: any) {
    return this.client.get(`/audit/user/${userId}`, { params });
  }
}

export const apiClient = new APIClient();
