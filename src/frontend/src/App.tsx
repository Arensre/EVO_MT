import { useState } from 'react';
import { Header } from './components/layout/Header';
import { SplitLayout } from './components/layout/SplitLayout';
import { CustomerList } from './components/customers/CustomerList';
import { CustomerDetail } from './components/customers/CustomerDetail';
import { CreateCustomerModal } from './components/customers/CreateCustomerModal';
import { Customer } from './types';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
  };

  const handleAddCustomer = () => {
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
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
          <CustomerDetail
            customerId={selectedCustomerId}
            onClose={handleCloseDetail}
          />
        }
      />
      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

export default App;
