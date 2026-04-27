import axios, { AxiosInstance, AxiosError } from 'axios';
import { Customer, CustomerFormData, Person, PersonFormData, PaginatedResponse, CustomerFilters } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer API
export const customerApi = {
  getAll: async (filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/customers?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CustomerFormData>): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};

// Person API
export const personApi = {
  create: async (customerId: number, data: PersonFormData): Promise<Person> => {
    const response = await apiClient.post(`/customers/${customerId}/persons`, data);
    return response.data;
  },

  update: async (id: number, data: Partial<PersonFormData>): Promise<Person> => {
    const response = await apiClient.put(`/persons/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/persons/${id}`);
  },
};

export default apiClient;
