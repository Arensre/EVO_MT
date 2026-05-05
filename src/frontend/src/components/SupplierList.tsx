import { useState } from 'react';
import { Plus, Filter, Search, RotateCcw, UserSearch, X, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Supplier, SupplierType } from '../types';

interface SupplierListProps {
  suppliers: Supplier[];
  selectedId?: number;
  onAddNew: () => void;
  onSelect: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onFilterChange?: (filters: { search?: string; personSearch?: string }) => void;
}

const typeLabels: Record<SupplierType, string> = {
  company: 'Firma',
  private: 'Privat',
};

export function SupplierList({ suppliers, selectedId, onAddNew, onSelect, onDelete, onFilterChange }: SupplierListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ search?: string; personSearch?: string } | null>(null);
  const { canWrite, canDelete } = useAuth();

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
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lieferanten</h2>
            <p className="text-sm text-gray-500">
              {suppliers.length} Lieferanten
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

            {canWrite('suppliers') && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieferant suchen</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name oder Lieferantennummer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
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
                    Lieferant: {activeFilters.search}
                    <button onClick={() => { setSearch(''); applyFilters(); }} className="hover:text-amber-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeFilters?.personSearch && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Ansprechpartner: {activeFilters.personSearch}
                    <button onClick={() => { setPersonSearch(''); applyFilters(); }} className="hover:text-blue-600">
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
        {suppliers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {hasActiveFilters ? 'Keine Lieferanten gefunden.' : 'Keine Lieferanten vorhanden.'}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {suppliers.map((supplier) => {
                const isSelected = selectedId === supplier.id;
                return (
                  <div
                    key={supplier.id}
                    onClick={() => onSelect(supplier)}
                    className={"p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between " + (isSelected ? 'bg-amber-100 border-l-4 border-amber-500' : '')}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                          {supplier.supplier_number && (
                            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {supplier.supplier_number}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                            {typeLabels[supplier.type] || 'Firma'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          {supplier.city && <span>{supplier.city}</span>}
                          {supplier.email && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{supplier.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {canWrite('suppliers') && (
                        <button
                          onClick={() => onSelect(supplier)}
                          className="p-2 rounded transition-colors text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Bearbeiten"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      {canDelete('suppliers') && (
                        <button
                          onClick={() => {
                            if (deleteConfirm === supplier.id) {
                              onDelete(supplier);
                              setDeleteConfirm(null);
                            } else {
                              setDeleteConfirm(supplier.id);
                            }
                          }}
                          className={"p-2 rounded transition-colors " + (deleteConfirm === supplier.id
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50')}
                          title={deleteConfirm === supplier.id ? 'Klicken zum Löschen' : 'Löschen'}
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
