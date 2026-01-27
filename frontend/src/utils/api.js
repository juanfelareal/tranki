import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada request
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.warn('Authentication error, signing out...');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.post('/transactions/bulk-delete', { ids }),
  getStats: (params) => api.get('/transactions/stats/summary', { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  getSpending: (params) => api.get('/categories/stats/spending', { params }),
  getStats: () => api.get('/categories/stats'),
  // Category rules (auto-categorization learning)
  getRules: () => api.get('/categories/rules'),
  createRule: (data) => api.post('/categories/rules', data),
  deleteRule: (id) => api.delete(`/categories/rules/${id}`),
  matchRule: (text, type) => api.post('/categories/rules/match', { text, type }),
  bulkMatchRules: (items) => api.post('/categories/rules/bulk-match', { items }),
};

// Budgets API
export const budgetsAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  getMonthly: (params) => api.get('/budgets/monthly', { params }),
  setMonthly: (data) => api.post('/budgets/monthly', data),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getComparison: (params) => api.get('/budgets/comparison', { params }),
};

// Reports API
export const reportsAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getByCategory: (params) => api.get('/reports/by-category', { params }),
  getDailyTrend: (params) => api.get('/reports/trends/daily', { params }),
  getMonthlyTrend: (params) => api.get('/reports/trends/monthly', { params }),
  getTopExpenses: (params) => api.get('/reports/top-expenses', { params }),
  getRecent: (params) => api.get('/reports/recent', { params }),
};

// Accounts API
export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getTransactions: (id, params) => api.get(`/accounts/${id}/transactions`, { params }),
  transfer: (data) => api.post('/accounts/transfer', data),
};

// Snowball Debts API
export const snowballDebtsAPI = {
  getAll: () => api.get('/snowball-debts'),
  getById: (id) => api.get(`/snowball-debts/${id}`),
  create: (data) => api.post('/snowball-debts', data),
  update: (id, data) => api.put(`/snowball-debts/${id}`, data),
  delete: (id) => api.delete(`/snowball-debts/${id}`),
  recordPayment: (id, data) => api.post(`/snowball-debts/${id}/pay`, data),
  getSummary: () => api.get('/snowball-debts/summary'),
  getPayments: (id) => api.get(`/snowball-debts/${id}/payments`),
};

// Subscription API
export const subscriptionAPI = {
  getStatus: () => api.get('/subscription'),
  createCheckout: () => api.post('/stripe/create-checkout'),
  createPortal: () => api.post('/stripe/portal'),
};

export default api;
