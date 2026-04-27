import { useState } from 'react';
import { Header } from './components/layout/Header';
import { SplitLayout } from './components/layout/SplitLayout';
import { CustomerList } from './components/customers/CustomerList';
import { CustomerDetail } from './components/customers/CustomerDetail';
import { CustomerForm } from './components/customers/CustomerForm';
import { Customer } from './types';
import { useQueryClient } from '@tanstack/react-query';

type ViewMode = 'list' | 'add';

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const queryClient = useQueryClient();

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setViewMode('list');
  };

  const handleAddCustomer = () => {
    setViewMode('add');
    setSelectedCustomerId(null);
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const handleFormCancel = () => {
    setViewMode('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SplitLayout
        leftPanel={
          <CustomerList
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onAddCustomer={handleAddCustomer}
          />
        }
        rightPanel={
          viewMode === 'add' ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Neuer Kunde</h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CustomerForm
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          ) : (
            <CustomerDetail
              customerId={selectedCustomerId}
              onClose={handleCloseDetail}
            />
          )
        }
      />
    </div>
  );
}

export default App;