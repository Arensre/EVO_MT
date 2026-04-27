import { useState } from 'react';
import { Plus, Filter, Search, RotateCcw, Building2, Users, User, UserSearch, X } from 'lucide-react';
import type { Customer, CustomerType } from '../types';

interface CustomerListProps {
  customers: Customer[];
  selectedId?: number;
  onAddNew: () => void;
  onSelect: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onFilterChange?: (filters: { search?: string; personSearch?: string }) => void;
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

export function CustomerList({ customers, selectedId, onAddNew, onSelect, onDelete, onFilterChange }: CustomerListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ search?: string; personSearch?: string } | null>(null);

  // Filter immer anzeigen wenn aktiv gefiltert wurde
  const hasActiveFilters = activeFilters?.search || activeFilters?.personSearch;
  const shouldShowFilters = showFilters || hasActiveFilters;

  const applyFilters = () => {
    const newFilters = { search: search || undefined, personSearch: personSearch || undefined };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPersonSearch('');
    setActiveFilters(null);
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kunden</h2>
            <p className="text-gray-500 mt-1">
              {customers.length} Kunden
              {hasActiveFilters && ' (gefiltert)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative group p-3 rounded-lg transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Filter
              </span>
            </button>

            <button
              onClick={onAddNew}
              className="relative group p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200"
            >
              <Plus size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Neuer Kunde
              </span>
            </button>
          </div>
        </div>

        {shouldShowFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kunde suchen</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name oder Kundennummer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <UserSearch size={14} />
                  Ansprechpartner suchen
                </label>
                <input
                  type="text"
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                  placeholder="Name, E-Mail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw size={18} />
                  Zurücksetzen
                </button>
              </div>
            </div>
            
            {/* Aktive Filter anzeigen */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters?.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    Kunde: {activeFilters.search}
                    <button 
                      onClick={() => { setSearch(''); applyFilters(); }} 
                      className="hover:text-amber-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {activeFilters?.personSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Ansprechpartner: {activeFilters.personSearch}
                    <button 
                      onClick={() => { setPersonSearch(''); applyFilters(); }} 
                      className="hover:text-blue-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {hasActiveFilters ? 'Keine Kunden gefunden.' : 'Keine Kunden vorhanden. Klicken Sie auf das + Symbol, um einen anzulegen.'}
          </div>
        ) : (
          customers.map((customer) => {
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
                    onClick={() => {
                      if (deleteConfirm === customer.id) {
                        onDelete(customer);
                        setDeleteConfirm(null);
                      } else {
                        setDeleteConfirm(customer.id);
                      }
                    }}
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
