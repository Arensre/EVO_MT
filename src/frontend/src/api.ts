import axios from 'axios';
import type { Customer, CustomerFormData } from './types';

const API = axios.create({ baseURL: '/api' });

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await API.get('/customers');
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
