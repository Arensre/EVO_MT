import { useAuth } from '../contexts/AuthContext';
import type { UserPermissions } from '../types';

export function useModulePermissions(module: keyof UserPermissions) {
  const { user } = useAuth();
  
  if (!user) return { canRead: false, canWrite: false, canDelete: false };
  
  if (user.role === 'admin') {
    return { canRead: true, canWrite: true, canDelete: true };
  }
  
  const perms = (user.permissions as any)[module] || { read: false, write: false, delete: false };
  
  return {
    canRead: perms.read || perms.write || perms.delete,
    canWrite: perms.write || perms.delete,
    canDelete: perms.delete,
  };
}

export function useMembersPermissions() {
  return useModulePermissions('members');
}

export function useCustomersPermissions() {
  return useModulePermissions('customers');
}

export function useSuppliersPermissions() {
  return useModulePermissions('suppliers');
}
