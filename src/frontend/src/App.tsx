import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Briefcase } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CustomerList } from './components/CustomerList';
import { CustomerModal } from './components/CustomerModal';
import { customerApi } from './api';
import type { Customer, CustomerFormData } from './types';

type View = 'home' | 'customers' | 'settings';

function HomeView() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Willkommen bei EVO MT</h1>
        <p className="text-gray-600">Ihr Management-Tool für Vereine, Firmen und Privatkunden</p>
      </div>

      {/* Schnellstatistiken */}
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

      {/* Info-Bereich */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tipps zur Nutzung</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">1.</span>
              Legen Sie neue Kunden über "Kunden" im Menü an
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">2.</span>
              Der grüne Button "Neuer Kunde" erstellt einen neuen Eintrag
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">3.</span>
              Bearbeiten oder löschen Sie Einträge direkt in der Liste
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aktuelle Funktionen</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Kundenverwaltung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Formular-Validierung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-gray-700">Weitere Features folgen...</span>
            </div>
          </div>
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
