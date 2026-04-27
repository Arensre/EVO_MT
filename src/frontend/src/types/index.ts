export type CustomerType = 'company' | 'club' | 'private';

export interface Person {
  id: number;
  customerId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  type: CustomerType;
  street: string | null;
  zipCode: string | null;
  city: string | null;
  country: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  persons?: Person[];
}

export interface CustomerFormData {
  name: string;
  type: CustomerType;
  street?: string;
  zipCode?: string;
  city?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface PersonFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerFilters {
  search?: string;
  type?: CustomerType | '';
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}