export type CustomerType = 'company' | 'club' | 'private';

export interface Customer {
  id: number;
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  status?: string;
}
