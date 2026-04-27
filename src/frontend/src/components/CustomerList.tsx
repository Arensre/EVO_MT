import { useState } from 'react';
import { Plus, Edit, Trash2, Building2, Users, User } from 'lucide-react';
import type { Customer, CustomerType } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onAddNew: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const typeIcons: Record<CustomerType, typeof Building2> = {
  company: Building2,
  club: Users,
  private: User,
};

const typeLabels: Record<CustomerType, string> = {
  company: 'Firma',
  club: 'Verein',
  private: 'Privat',
};

export function CustomerList({ customers, onAddNew, onEdit, onDelete }: CustomerListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (customer: Customer) => {
    if (deleteConfirm === customer.id) {
      onDelete(customer);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(customer.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kunden</h2>
          <p className="text-gray-500 mt-1">{customers.length} Kunden insgesamt</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Neuer Kunde
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Keine Kunden vorhanden. Klicken Sie auf "Neuer Kunde", um einen anzulegen.
          </div>
        ) : (
          customers.map((customer) => {
            const Icon = typeIcons[customer.type] || Building2;
            return (
              <div
                key={customer.id}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {typeLabels[customer.type] || 'Firma'}
                      </span>
                      {customer.city && <span>{customer.city}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer)}
                    className={`p-2 rounded transition-colors ${
                      deleteConfirm === customer.id
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirm === customer.id ? 'Klicken zum Löschen' : 'Löschen'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
