export type CustomerType = 'company' | 'club' | 'private';

export interface Customer {
  id: number;
  name: string;
  type: CustomerType;
  street?: string;
  zipCode?: string;
  city?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  type: CustomerType;
  street?: string;
  zipCode?: string;
  city?: string;
  email?: string;
  phone?: string;
}
