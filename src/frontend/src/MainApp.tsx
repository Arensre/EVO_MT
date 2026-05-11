import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Briefcase, LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { CustomerModal } from './components/CustomerModal';
import { SupplierList } from './components/SupplierList';
import { SupplierDetail } from './components/SupplierDetail';
import { SupplierModal } from './components/SupplierModal';
import { MemberList } from './components/MemberList';
import { MemberDetail } from './components/MemberDetail';
import { MemberModal } from './components/MemberModal';
import { MembershipManagement } from './components/MembershipManagement';
import { MembershipDetail } from './components/MembershipDetail';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Dashboard } from "./components/Dashboard";
import { UserProfile } from './components/UserProfile';
import { UserManagement } from './components/UserManagement';
import { Stammdaten } from './components/Stammdaten';
import { ModuleSettings } from './components/ModuleSettings';
import { GeneralSettings } from './components/GeneralSettings';
import { Importer } from './components/Importer';
import { useAuth } from './contexts/AuthContext';
import { customerApi, supplierApi } from './api';
import type { Customer, CustomerFormData, Supplier, SupplierFormData, View } from './types';
import axios from 'axios';

// API base URL for members
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Member {
  id: number;
  member_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  member_type_name?: string;
  entry_date?: string;
  is_active: boolean;
}

function HomeView() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Willkommen bei EVO MT</h1>
        <p className="text-gray-600">Ihr Management-Tool für Vereine, Firmen und Privatkunden</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-primary-500">
          <div className="flex items-center gap-3">
            <Users className="text-primary-600" size={32} />
            <div>
              <div className="text-2xl font-bold text-gray-900">Kunden</div>
              <div className="text-gray-500">Verwalten</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-600" size={32} />
            <div>
              <div className="text-2xl font-bold text-gray-900">Events</div>
              <div className="text-gray-500">Planen</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <Briefcase className="text-amber-600" size={32} />
            <div>
              <div className="text-2xl font-bold text-gray-900">Projekte</div>
              <div className="text-gray-500">Organisieren</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return <Stammdaten />;
}

// General Settings View Component
function GeneralSettingsView() {
  return <GeneralSettings />;
}

// Profile View Component
function ProfileView() {
  return <UserProfile />;
}

// Users View Component
// Calendar View Component
function CalendarView() {
  return <Calendar />;
}

function UsersView() {
  return <UserManagement />;
}

// Importer View Component
function ImporterView() {
  return <Importer />;
}

// Members View Component
interface MemberFilters {
  search?: string;
  member_type_id?: number;
  is_active?: boolean;
}

function MembersView() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [memberFilters, setMemberFilters] = useState<MemberFilters>({});
  const queryClient = useQueryClient();

  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      return response.data;
    }
  });

  const { data: memberFunctions = [] } = useQuery({
    queryKey: ['member-functions'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-functions`);
      return response.data;
    }
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', memberFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (memberFilters.search) params.append('search', memberFilters.search);
      if (memberFilters.member_type_id) params.append('member_type_id', memberFilters.member_type_id.toString());
      if (memberFilters.is_active !== undefined) params.append('is_active', memberFilters.is_active.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`${API_URL}/members${queryString}`);
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post(`${API_URL}/members`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      await axios.put(`${API_URL}/members/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', selectedMember?.id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setSelectedMember(null);
      setMemberToDelete(null);
    }
  });

  const handleFilterChange = (filters: MemberFilters) => {
    setMemberFilters(filters);
    setSelectedMember(null);
  };

  // Desktop Split-View
  return (
    <>
      <div className="flex h-full">
        <div className={`${selectedMember ? 'w-2/5' : 'w-full'} overflow-auto transition-all duration-300`}>
          {isLoading ? (
            <div className="text-center py-12">Laden...</div>
          ) : (
            <MemberList
              members={members}
              memberTypes={memberTypes}
              selectedId={selectedMember?.id}
              onSelect={setSelectedMember}
              onAddNew={() => setIsModalOpen(true)}
              onDelete={setMemberToDelete}
              
              onFilterChange={handleFilterChange}
              activeFilters={memberFilters}
            />
          )}
        </div>

        {selectedMember && (
          <div className="w-3/5 border-l border-gray-200 bg-gray-50">
            <MemberDetail
              member={selectedMember}
              
              onBack={() => setSelectedMember(null)}
              onSave={(data) => {
              console.log('DEBUG Frontend - onSave called with:', JSON.stringify(data, null, 2));
              updateMutation.mutate({ id: selectedMember.id, data });
            }}
              onDelete={() => setMemberToDelete(selectedMember)}
              
              memberFunctions={memberFunctions}
            />
          </div>
        )}
      </div>

      {/* Modal für Neuanlage */}
      <MemberModal
        isOpen={isModalOpen}
        
        onClose={() => setIsModalOpen(false)}
        onSubmit={createMutation.mutate}
      />

      {memberToDelete && (
        <DeleteConfirmModal
          isOpen={!!memberToDelete}
          title="Mitglied löschen"
          message={`Möchten Sie ${memberToDelete.first_name} ${memberToDelete.last_name} wirklich löschen?`}
          onConfirm={() => deleteMutation.mutate(memberToDelete.id)}
          onClose={() => setMemberToDelete(null)}
        />
      )}
    </>
  );
}



// Membership View Component  
function MembershipView() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      return response.data;
    }
  });

  const { data: memberFunctions = [] } = useQuery({
    queryKey: ['member-functions'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-functions`);
      return response.data;
    }
  });

  const { data: memberAreas = [] } = useQuery({
    queryKey: ['member-areas'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-areas`);
      return response.data;
    }
  });

  return (
    <>
      <div className="flex h-full">
        <div className={`${selectedMember ? 'w-2/5' : 'w-full'} overflow-auto transition-all duration-300`}
>
          <MembershipManagement
            onSelect={setSelectedMember}
            selectedId={selectedMember?.id}
          />
        </div>

        {selectedMember && (
          <div className="w-3/5 border-l border-gray-200 bg-gray-50"
>
            <MembershipDetail
              member={selectedMember}
              memberTypes={memberTypes}
              memberFunctions={memberFunctions}
              memberAreas={memberAreas}
              onBack={() => setSelectedMember(null)}
            />
          </div>
        )}
      </div>
    </>
  );
}

// Customer View Component
function CustomerView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerFilters, setCustomerFilters] = useState<{ search?: string; personSearch?: string }>({});

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', customerFilters],
    queryFn: () => customerApi.getAll(customerFilters),
  });

  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerFormData }) =>
      customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (selectedCustomer) {
        queryClient.invalidateQueries({ queryKey: ['customer', selectedCustomer.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (selectedCustomer && customerToDelete?.id === selectedCustomer.id) {
        setSelectedCustomer(null);
      }
      setCustomerToDelete(null);
    },
  });

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setCustomerToDelete(null);
  };

  const handleSave = (data: CustomerFormData) => {
    if (selectedCustomer) {
      updateMutation.mutate({ id: selectedCustomer.id, data });
    }
  };

  const handleSubmitNew = (data: CustomerFormData) => {
    createMutation.mutate(data);
  };

  const handleFilterChange = (filters: { search?: string; personSearch?: string }) => {
    setCustomerFilters(filters);
    setSelectedCustomer(null);
  };

  // Desktop Split-View
  if (true) {
    return (
      <div className="flex h-full">
        <div className={`${selectedCustomer ? 'w-1/2' : 'w-full'} overflow-auto transition-all duration-300`}>
          {isLoading ? (
            <div className="text-center py-12">Laden...</div>
          ) : (
            <CustomerList
              customers={customers}
              selectedId={selectedCustomer?.id}
              onAddNew={handleAddNew}
              onSelect={handleSelect}
              onDelete={handleDeleteClick}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {selectedCustomer && (
          <div className="w-1/2 border-l border-gray-200 overflow-auto bg-gray-50">
            <CustomerDetail
              customer={selectedCustomer}
              onClose={handleBackToList}
              onSave={handleSave}
              onDelete={() => handleDeleteClick(selectedCustomer)}
            />
          </div>
        )}

        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitNew}
        />

        <DeleteConfirmModal
          isOpen={!!customerToDelete}
          title="Kunde löschen"
          message={`Möchten Sie den Kunden "${customerToDelete?.name || ''}" wirklich löschen?`}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  }
}

// Supplier View Component
function SupplierView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [supplierFilters, setSupplierFilters] = useState<{ search?: string; personSearch?: string }>({});

  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', supplierFilters],
    queryFn: () => supplierApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: supplierApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplierFormData }) =>
      supplierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      if (selectedSupplier) {
        queryClient.invalidateQueries({ queryKey: ['supplier', selectedSupplier.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: supplierApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      if (selectedSupplier && supplierToDelete?.id === selectedSupplier.id) {
        setSelectedSupplier(null);
      }
      setSupplierToDelete(null);
    },
  });

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleBackToList = () => {
    setSelectedSupplier(null);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteMutation.mutate(supplierToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setSupplierToDelete(null);
  };

  const handleSave = (data: SupplierFormData) => {
    if (selectedSupplier) {
      updateMutation.mutate({ id: selectedSupplier.id, data });
    }
  };

  const handleSubmitNew = (data: SupplierFormData) => {
    createMutation.mutate(data);
  };

  const handleFilterChange = (filters: { search?: string; personSearch?: string }) => {
    setSupplierFilters(filters);
    setSelectedSupplier(null);
  };

  // Desktop Split-View
  if (true) {
    return (
      <div className="flex h-full">
        <div className={`${selectedSupplier ? 'w-1/2' : 'w-full'} overflow-auto transition-all duration-300`}>
          {isLoading ? (
            <div className="text-center py-12">Laden...</div>
          ) : (
            <SupplierList
              suppliers={suppliers}
              selectedId={selectedSupplier?.id}
              onAddNew={handleAddNew}
              onSelect={handleSelect}
              onDelete={handleDeleteClick}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {selectedSupplier && (
          <div className="w-1/2 border-l border-gray-200 overflow-auto bg-gray-50">
            <SupplierDetail
              supplier={selectedSupplier}
              onClose={handleBackToList}
              onSave={handleSave}
              onDelete={() => handleDeleteClick(selectedSupplier)}
            />
          </div>
        )}

        <SupplierModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitNew}
        />

        <DeleteConfirmModal
          isOpen={!!supplierToDelete}
          title="Lieferant löschen"
          message={`Möchten Sie den Lieferanten "${supplierToDelete?.name || ''}" wirklich löschen?`}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  }
}

// Logout Confirmation Modal Component
interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <LogOut className="text-orange-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Abmelden</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Möchten Sie sich wirklich abmelden?
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Ja, abmelden
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

export function MainApp() {
  const [activeView, setActiveView] = useState<View>('home');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    // Redirect to login page (App.tsx will handle this)
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard onNavigate={setActiveView} />;
        return <HomeView />;
      case 'customers':
        return <CustomerView  />;
      case 'suppliers':
        return <SupplierView  />;
      case 'members':
        return <MembersView />;
      case 'membership':
      case 'calendar':
        return <CalendarView />;
        return <MembershipView />;
      case 'settings':
        return <SettingsView />;
      case 'general':
        return <GeneralSettingsView />;
      case 'modules':
        return <ModuleSettings />;
      case 'importer':
        return <ImporterView />;
      case 'profile':
        return <ProfileView />;
      case 'users':
        return <UsersView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        onLogout={handleLogoutClick}
      />

      <div className="flex-1 overflow-hidden min-w-0">
        {renderContent()}
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
