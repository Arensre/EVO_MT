import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { CustomerList } from './components/CustomerList';
import { CustomerModal } from './components/CustomerModal';
import { customerApi } from './api';
import type { Customer, CustomerFormData } from './types';

type View = 'home' | 'customers' | 'settings';

function HomeView() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Willkommen bei EVO MT</h1>
      <p className="text-gray-600 mb-8">Ihr Management-Tool für Vereine, Firmen und Privatkunden</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600 mb-2">Kunden</div>
          <p className="text-gray-500">Verwalten Sie alle Ihre Kunden an einem Ort</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600 mb-2">Mitglieder</div>
          <p className="text-gray-500">Organisieren Sie Vereinsmitglieder effizient</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600 mb-2">Projekte</div>
          <p className="text-gray-500">Behalten Sie Ihre Projekte im Überblick</p>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Einstellungen</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Einstellungen werden bald verfügbar sein...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.getAll,
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
      setIsModalOpen(false);
      setEditingCustomer(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleAddNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    deleteMutation.mutate(customer.id);
  };

  const handleSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-12">Laden...</div>;
    }

    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'customers':
        return (
          <CustomerList
            customers={customers}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 overflow-auto p-8">
        {renderContent()}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        customer={editingCustomer}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
