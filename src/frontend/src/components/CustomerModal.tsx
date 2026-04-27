import { X } from 'lucide-react';
import { CustomerForm } from './CustomerForm';
import type { Customer, CustomerFormData } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
}

export function CustomerModal({ isOpen, customer, onClose, onSubmit }: CustomerModalProps) {
  if (!isOpen) return null;

  const title = customer ? 'Kunde bearbeiten' : 'Neuer Kunde';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        {/* Modal Content - clicking here stops propagation */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <CustomerForm
              customer={customer}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
