export type CustomerType = 'company' | 'club' | 'private';
export type SupplierType = 'company' | 'private';
export type View = 'home' | 'customers' | 'suppliers' | 'settings' | 'profile' | 'users' | 'members';

export interface Customer {
  id: number;
  customer_number: string;
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
  avatar_url?: string;
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
  notes?: string;
}

export interface Supplier {
  id: number;
  supplier_number: string;
  name: string;
  type: SupplierType;
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
  avatar_url?: string;
  updated_at: string;
}

export interface SupplierFormData {
  name: string;
  type: SupplierType;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  status?: string;
  notes?: string;
}

export interface Person {
  id: number;
  customer_id?: number;
  supplier_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  is_primary?: boolean;
  notes?: string;
  created_at: string;
  avatar_url?: string;
  updated_at: string;
}

export interface PersonFormData {
  customer_id?: number;
  supplier_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface ModulePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface UserPermissions {
  customers: ModulePermissions;
  suppliers: ModulePermissions;
  members: ModulePermissions;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
  created_at?: string;
  avatar_url?: string;
  updated_at?: string;
}

// Member types
export interface MemberType {
  id: number;
  name: string;
  description?: string;
}

export interface MemberFunction {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Member {
  id: number;
  member_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  birth_date?: string;
  member_type_id?: number;
  member_type?: MemberType;
  member_type_name?: string;
  entry_date?: string;
  join_date?: string;
  notes?: string;
  is_active: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  birth_date?: string;
  member_type_id?: number;
  member_function_id?: number;
  entry_date?: string;
  join_date?: string;
  notes?: string;
  is_active?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
}
