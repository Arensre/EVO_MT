// @ts-nocheck
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Filter, Search, RotateCcw, User, X } from 'lucide-react';

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

  const hasActiveFilters = filters.search || filters.member_type_id !== undefined || filters.is_active !== undefined;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mitgliedschaft</h2>
            <p className="text-gray-500 mt-1">
              {members.length} Mitglieder
              {hasActiveFilters && " (gefiltert)"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative group p-3 rounded-lg transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Filter
              </span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Name, Mitgliedsnummer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsart</label>
                <select
                  value={filters.member_type_id || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    member_type_id: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Alle Arten</option>
                  {memberTypes.map((type: any) => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Alle Status</option>
                  <option value="true">Aktiv</option>
                  <option value="false">Inaktiv</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters({})}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw size={18} />
                  Zurücksetzen
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    Suche: {filters.search}
                    <button onClick={() => setFilters({ ...filters, search: undefined })} className="hover:text-amber-900"><X size={14} /></button>
                  </span>
                )}
                {filters.member_type_id && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    Art: {memberTypes.find((t: any) => t.id === filters.member_type_id)?.name}
                    <button onClick={() => setFilters({ ...filters, member_type_id: undefined })} className="hover:text-amber-900"><X size={14} /></button>
                  </span>
                )}
                {filters.is_active !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    Status: {filters.is_active ? 'Aktiv' : 'Inaktiv'}
                    <button onClick={() => setFilters({ ...filters, is_active: undefined })} className="hover:text-amber-900"><X size={14} /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Laden...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <User className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Keine Mitglieder gefunden.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow m-6">
            <div className="divide-y divide-gray-200">
              {members.map((member: any) => {
                const isSelected = selectedId === member.id;
                const fullName = `${member.first_name} ${member.last_name}`;
                return (
                  <div
                    key={member.id}
                    onClick={() => onSelect(member)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-emerald-100 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{fullName}</span>
                          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {member.member_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              member.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {member.is_active ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {member.member_type_name || '-'}
                          {member.entry_date && (
                            <> · {formatDate(member.entry_date)}</>
                          )}
                        </div>
                      </div>
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
