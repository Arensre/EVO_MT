import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Filter, Search, RotateCcw, User, X } from 'lucide-react';
import type { Member } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.125:3001/api';

interface MemberListProps {
  members: Member[];
  selectedId?: number;
  onAddNew: () => void;
  onSelect: (member: Member) => void;
  onDelete: (member: Member) => void;
  onFilterChange?: (filters: { search?: string; typeId?: number }) => void;
}

export function MemberList({ members, selectedId, onAddNew, onSelect, onDelete, onFilterChange }: MemberListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<{ search?: string; typeId?: number } | null>(null);

  // Mitgliedsarten dynamisch aus Stammdaten laden
  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      return response.data;
    }
  });

  const hasActiveFilters = activeFilters?.search || activeFilters?.typeId;
  const shouldShowFilters = showFilters || hasActiveFilters;

  const applyFilters = () => {
    const newFilters = { 
      search: search || undefined, 
      typeId: typeFilter ? parseInt(typeFilter) : undefined 
    };
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mitglieder</h2>
            <p className="text-gray-500 mt-1">
              {members.length} Mitglieder
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
                Neues Mitglied
              </span>
            </button>
          </div>
        </div>

        {shouldShowFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Suchen</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, E-Mail, Mitgliedsnummer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsart</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Alle Typen</option>
                  {memberTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw size={18} />
                  Zurücksetzen
                </button>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters?.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                    Suche: {activeFilters.search}
                    <button 
                      onClick={() => { setSearch(''); applyFilters(); }} 
                      className="hover:text-amber-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {activeFilters?.typeId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Typ: {memberTypes.find((t: any) => t.id === activeFilters.typeId)?.name}
                    <button 
                      onClick={() => { setTypeFilter(''); applyFilters(); }} 
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
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {hasActiveFilters ? 'Keine Mitglieder gefunden.' : 'Keine Mitglieder vorhanden. Klicken Sie auf das + Symbol, um eines anzulegen.'}
          </div>
        ) : (
          members.map((member) => {
            const isSelected = selectedId === member.id;
            const displayName = `${member.first_name} ${member.last_name}`;
            return (
              <div
                key={member.id}
                onClick={() => onSelect(member)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{displayName}</span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {member.member_number}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      {member.member_type && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {member.member_type.name}
                        </span>
                      )}
                      {member.email && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{member.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className={`px-2 py-1 rounded text-xs ${
                    member.status === 'active' ? 'bg-green-100 text-green-700' : 
                    member.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {member.status === 'active' ? 'Aktiv' : 
                     member.status === 'inactive' ? 'Inaktiv' : 'Gesperrt'}
                  </span>
                  <button
                    onClick={() => {
                      if (deleteConfirm === member.id) {
                        onDelete(member);
                        setDeleteConfirm(null);
                      } else {
                        setDeleteConfirm(member.id);
                      }
                    }}
                    className={`p-2 rounded transition-colors ${
                      deleteConfirm === member.id
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirm === member.id ? 'Klicken zum Löschen' : 'Löschen'}
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
