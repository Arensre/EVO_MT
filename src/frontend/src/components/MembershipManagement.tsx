// @ts-nocheck
// @ts-nocheck
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Filter, UsersRound } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.125:3001/api';

interface Member {
  id: number;
  member_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  member_type_name?: string;
  entry_date?: string;
  is_active: boolean;
}

interface MemberType {
  id: number;
  name: string;
}

interface MembershipManagementProps {
  onSelect: (member: Member) => void;
  selectedId?: number;
}

interface MemberFilters {
  search?: string;
  member_type_id?: number;
  is_active?: boolean;
}

export function MembershipManagement({ onSelect, selectedId }: MembershipManagementProps) {
  const [filters, setFilters] = useState<MemberFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      return response.data;
    }
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.member_type_id) params.append('member_type_id', filters.member_type_id.toString());
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`${API_URL}/members${queryString}`);
      return response.data;
    }
  });

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Aktiv
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inaktiv
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UsersRound className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Mitgliedschaft</h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Mitglied suchen..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsart</label>
              <select
                value={filters.member_type_id || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  member_type_id: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                {memberTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    is_active: value === '' ? undefined : value === 'true'
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                <option value="true">Aktiv</option>
                <option value="false">Inaktiv</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <UsersRound className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Keine Mitglieder gefunden.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => onSelect(member)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedId === member.id
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-medium">
                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.member_number}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{member.member_type_name || '-'}</p>
                      <p className="text-xs text-gray-400">
                        {member.entry_date && new Date(member.entry_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    {getStatusBadge(member.is_active)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
