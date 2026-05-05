import { useState } from 'react';
import { Plus, Filter, Search, RotateCcw, X, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Customer, CustomerType } from '../types';

interface CustomerListProps {
  customers: Customer[];
  selectedId?: number;
  onAddNew: () => void;
  onSelect: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onFilterChange?: (filters: { search?: string; type?: string }) => void;
}

const typeLabels: Record<CustomerType, string> = {
  company: 'Firma',
  club: 'Verein',
  private: 'Privat',
};

export function CustomerList({ customers, selectedId, onAddNew, onSelect, onDelete, onFilterChange }: CustomerListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ search?: string; type?: string } | null>(null);
  const { canWrite, canDelete } = useAuth();

  const hasActiveFilters = activeFilters?.search || activeFilters?.type;
  const shouldShowFilters = showFilters || hasActiveFilters;

  const applyFilters = () => {
    const newFilters = { search: search || undefined, type: typeFilter || undefined };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setActiveFilters(null);
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kunden</h2>
            <p className="text-sm text-gray-500">
              {customers.length} Kunden
              {hasActiveFilters && ' (gefiltert)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={"p-2 rounded-lg transition-colors " + (showFilters || hasActiveFilters
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              <Filter size={20} />
            </button>

            {canWrite('customers') && (
              <button
                onClick={onAddNew}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        {shouldShowFilters && (
          <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, Kundennummer, E-Mail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Alle</option>
                  <option value="company">Firma</option>
                  <option value="club">Verein</option>
                  <option value="private">Privat</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Search size={18} />
                  Filtern
                </button>
                
                <button
                  onClick={clearFilters}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters?.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    Suche: {activeFilters.search}
                    <button onClick={() => { setSearch(''); applyFilters(); }} className="hover:text-amber-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeFilters?.type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Typ: {typeLabels[activeFilters.type as CustomerType] || activeFilters.type}
                    <button onClick={() => { setTypeFilter(''); applyFilters(); }} className="hover:text-blue-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* List - wie MemberList */}
      <div className="flex-1 overflow-auto p-6">
        {customers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {hasActiveFilters ? 'Keine Kunden gefunden.' : 'Keine Kunden vorhanden.'}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => {
                const isSelected = selectedId === customer.id;
                return (
                  <div
                    key={customer.id}
                    onClick={() => onSelect(customer)}
                    className={"p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between " + (isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : '')}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{customer.name}</span>
                          {customer.customer_number && (
                            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {customer.customer_number}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {typeLabels[customer.type] || 'Firma'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
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
                      {canWrite('customers') && (
                        <button
                          onClick={() => onSelect(customer)}
                          className="p-2 rounded transition-colors text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Bearbeiten"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      {canDelete('customers') && (
                        <button
                          onClick={() => {
                            if (deleteConfirm === customer.id) {
                              onDelete(customer);
                              setDeleteConfirm(null);
                            } else {
                              setDeleteConfirm(customer.id);
                            }
                          }}
                          className={"p-2 rounded transition-colors " + (deleteConfirm === customer.id
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50')}
                          title={deleteConfirm === customer.id ? 'Klicken zum Löschen' : 'Löschen'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
