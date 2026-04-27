import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronLeft, ChevronRight, Building2, Users, User, Plus } from 'lucide-react';
import { Customer, CustomerType, CustomerFilters } from '../../types';
import { customerApi } from '../../services/api';

interface CustomerListProps {
  selectedCustomerId: number | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
}

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  company: 'Firma',
  club: 'Verein',
  private: 'Privatperson',
};

const CUSTOMER_TYPE_ICONS: Record<CustomerType, typeof Building2> = {
  company: Building2,
  club: Users,
  private: User,
};

export function CustomerList({ selectedCustomerId, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerApi.getAll(filters),
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleTypeFilter = (type: CustomerType | '') => {
    setFilters((prev) => ({ ...prev, type: type || undefined, page: 1 }));
  };

  const handleSort = (sortBy: 'name' | 'createdAt' | 'updatedAt') => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Fehler beim Laden der Kunden.</div>
      </div>
    );
  }

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Kunden</h2>
          <button
            onClick={onAddCustomer}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Neuer Kunde</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex space-x-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kunde suchen..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Suchen
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filters.type || ''}
            onChange={(e) => handleTypeFilter(e.target.value as CustomerType | '')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="">Alle Typen</option>
            <option value="company">Firma</option>
            <option value="club">Verein</option>
            <option value="private">Privatperson</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {filters.sortBy === 'name' && (
                    filters.sortOrder === 'asc' ? ' ↑' : ' ↓'
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Typ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ort
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => {
              const TypeIcon = CUSTOMER_TYPE_ICONS[customer.type];
              return (
                <tr
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedCustomerId === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <TypeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {CUSTOMER_TYPE_LABELS[customer.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {customer.city ? `${customer.zipCode || ''} ${customer.city}`.trim() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Zeige {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} von{' '}
              {pagination.total} Einträgen
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">
                Seite {pagination.page} von {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
