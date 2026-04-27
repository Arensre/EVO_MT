import axios from 'axios';
import type { Customer, CustomerFormData, Person, PersonFormData } from './types';

const API = axios.create({ baseURL: '/api' });

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

export const personApi = {
  getByCustomer: async (customerId: number): Promise<Person[]> => {
    const response = await API.get(`/customers/${customerId}/persons`);
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
