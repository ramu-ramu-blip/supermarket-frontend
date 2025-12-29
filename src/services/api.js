import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Business Logic API Methods
export const endpoints = {
    // Auth
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),

    // Products
    getProducts: (params) => api.get('/products', { params }),
    addProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    bulkImport: (formData) => api.post('/products/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Categories
    getCategories: () => api.get('/categories'),

    // Billing
    createBill: (data) => api.post('/billing', data),
    getInvoices: () => api.get('/billing/invoices'),
    deleteInvoice: (id) => api.delete(`/billing/invoices/${id}`),

    // Analytics
    getAnalytics: (params) => api.get('/analytics', { params }),

    // Expenses
    getExpenses: (params) => api.get('/expenses', { params }),
    addExpense: (data) => api.post('/expenses', data),
};

export default api;
