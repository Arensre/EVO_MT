import { useState } from 'react';
import { Plus, Filter, Search, X, Building2, Users, User } from 'lucide-react';
import type { Customer, CustomerType } from '../types';

interface CustomerListProps {
  customers: Customer[];
  selectedId?: number;
  onAddNew: () => void;
  onSelect: (customer: Customer) => void;
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

export function CustomerList({ customers, selectedId, onAddNew, onSelect, onEdit, onDelete }: CustomerListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    city: '',
    customerNumber: '',
  });
  const [activeFilters, setActiveFilters] = useState<typeof filters | null>(null);

  const handleDelete = (customer: Customer) => {
    if (deleteConfirm === customer.id) {
      onDelete(customer);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(customer.id);
    }
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters({ name: '', type: '', city: '', customerNumber: '' });
    setActiveFilters(null);
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!activeFilters) return true;

    const nameMatch = !activeFilters.name ||
      customer.name.toLowerCase().includes(activeFilters.name.toLowerCase());
    const typeMatch = !activeFilters.type || customer.type === activeFilters.type;
    const cityMatch = !activeFilters.city ||
      (customer.city?.toLowerCase() || '').includes(activeFilters.city.toLowerCase());
    const numberMatch = !activeFilters.customerNumber ||
      customer.customer_number.toLowerCase().includes(activeFilters.customerNumber.toLowerCase());

    return nameMatch && typeMatch && cityMatch && numberMatch;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kunden</h2>
            <p className="text-gray-500 mt-1">
              {filteredCustomers.length} von {customers.length} Kunden
              {activeFilters && ' (gefiltert)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative group p-3 rounded-lg transition-all duration-200 ${
                showFilters
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Filter"
            >
              <Filter size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Filter
              </span>
            </button>

            <button
              onClick={onAddNew}
              className="relative group p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200"
              title="Neuer Kunde"
            >
              <Plus size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Neuer Kunde
              </span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kunden-Nr.</label>
                <input
                  type="text"
                  value={filters.customerNumber}
                  onChange={(e) => setFilters({ ...filters, customerNumber: e.target.value })}
                  placeholder="z.B. K00001..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  placeholder="Name suchen..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Alle Typen</option>
                  <option value="company">Firma</option>
                  <option value="club">Verein</option>
                  <option value="private">Privat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Stadt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Search size={18} />
                  Filtern
                </button>
                {activeFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={18} />
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {activeFilters ? 'Keine Kunden gefunden.' : 'Keine Kunden vorhanden. Klicken Sie auf das + Symbol, um einen anzulegen.'}
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const Icon = typeIcons[customer.type] || Building2;
            const isSelected = selectedId === customer.id;
            return (
              <div
                key={customer.id}
                onClick={() => onSelect(customer)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{customer.name}</span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {customer.customer_number}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {typeLabels[customer.type] || 'Firma'}
                      </span>
                      {customer.city && <span>{customer.city}</span>}
                      {customer.email && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{customer.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
