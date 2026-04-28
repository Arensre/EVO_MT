import axios from 'axios';
import type { Customer, CustomerFormData, Supplier, SupplierFormData, Person, PersonFormData } from './types';

const API = axios.create({ baseURL: '/api' });

// Add request interceptor to attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customerApi = {
  getAll: async (filters?: { search?: string; personSearch?: string }): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.personSearch) params.append('personSearch', filters.personSearch);

    const response = await API.get(`/customers?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await API.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerFormData) => {
    const response = await API.post('/customers', data);
    return response.data;
  },

  update: async (id: number, data: CustomerFormData) => {
    const response = await API.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await API.delete(`/customers/${id}`);
  },
};

export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await API.get('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await API.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: SupplierFormData) => {
    const response = await API.post('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: SupplierFormData) => {
    const response = await API.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await API.delete(`/suppliers/${id}`);
  },
};

export const personApi = {
  getByCustomer: async (customerId: number): Promise<Person[]> => {
    const response = await API.get(`/customers/${customerId}/persons`);
    return response.data;
  },

  getBySupplier: async (supplierId: number): Promise<Person[]> => {
    const response = await API.get(`/suppliers/${supplierId}/persons`);
    return response.data;
  },

  create: async (data: PersonFormData) => {
    const response = await API.post('/persons', data);
    return response.data;
  },

  update: async (id: number, data: PersonFormData) => {
    const response = await API.put(`/persons/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await API.delete(`/persons/${id}`);
  },
};
