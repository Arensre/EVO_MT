import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Briefcase } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { CustomerModal } from './components/CustomerModal';
import { customerApi } from './api';
import type { Customer, CustomerFormData } from './types';

type View = 'home' | 'customers' | 'settings';

// Hook für Bildschirmgröße
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isDesktop;
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const isDesktop = useIsDesktop();

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
      // Auch selectedCustomer aktualisieren falls geöffnet
      if (selectedCustomer) {
        queryClient.invalidateQueries({ queryKey: ['customer', selectedCustomer.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (selectedCustomer) {
        setSelectedCustomer(null);
      }
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

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
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

  // Desktop Split-View
  if (activeView === 'customers' && isDesktop) {
    return (
      <div className="flex h-screen">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Linke Seite - Kundenliste */}
          <div className={`${selectedCustomer ? 'w-1/2' : 'w-full'} overflow-auto p-6 transition-all duration-300`}>
            {isLoading ? (
              <div className="text-center py-12">Laden...</div>
            ) : (
              <CustomerList
                customers={customers}
                selectedId={selectedCustomer?.id}
                onAddNew={handleAddNew}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
          
          {/* Rechte Seite - Details (nur wenn Kunde ausgewählt) */}
          {selectedCustomer && (
            <div className="w-1/2 border-l border-gray-200 overflow-auto bg-gray-50">
              <CustomerDetail
                customer={selectedCustomer}
                onClose={handleBackToList}
                onEdit={() => handleEdit(selectedCustomer)}
              />
            </div>
          )}
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

  // Mobile Single-View oder andere Views
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-12">Laden...</div>;
    }

    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'customers':
        // Mobile: Entweder Liste oder Detail
        if (selectedCustomer) {
          return (
            <CustomerDetail
              customer={selectedCustomer}
              onBack={handleBackToList}
              onEdit={() => handleEdit(selectedCustomer)}
              isMobile
            />
          );
        }
        return (
          <CustomerList
            customers={customers}
            onAddNew={handleAddNew}
            onSelect={handleSelect}
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
      
      <div className="flex-1 overflow-auto p-6">
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
