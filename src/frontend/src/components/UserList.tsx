import { useState } from 'react';
import { Plus, Filter, Search, RotateCcw, User as UserIcon, Shield, Edit2, Trash2, X } from 'lucide-react';
import type { User } from '../types';

interface UserListProps {
  users: User[];
  selectedId?: number;
  currentUserId?: number;
  onAddNew: () => void;
  onSelect: (user: User) => void;
  onDelete: (user: User) => void;
  onFilterChange?: (filters: { search?: string }) => void;
}

const roleIcons: Record<string, typeof UserIcon> = {
  admin: Shield,
  user: UserIcon,
};

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  user: 'Benutzer',
};

export function UserList({ users, selectedId, currentUserId, onAddNew, onSelect, onDelete, onFilterChange }: UserListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ search?: string } | null>(null);

  const hasActiveFilters = activeFilters?.search;
  const shouldShowFilters = showFilters || hasActiveFilters;

  const applyFilters = () => {
    const newFilters = { search: search || undefined };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setSearch('');
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
            <h2 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h2>
            <p className="text-gray-500 mt-1">
              {users.length} Benutzer
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
                Neuer Benutzer
              </span>
            </button>
          </div>
        </div>

        {shouldShowFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benutzer suchen</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Benutzername, Name oder E-Mail..."
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
              </div>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {hasActiveFilters ? 'Keine Benutzer gefunden.' : 'Keine Benutzer vorhanden. Klicken Sie auf das + Symbol, um einen anzulegen.'}
          </div>
        ) : (
          users.map((user) => {
            const Icon = roleIcons[user.role] || UserIcon;
            const isSelected = selectedId === user.id;
            const isCurrentUser = currentUserId === user.id;
            return (
              <div
                key={user.id}
                onClick={() => onSelect(user)}
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
                      <span className="font-medium text-gray-900">{user.username}</span>
                      {isCurrentUser && (
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                          Ich
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {roleLabels[user.role] || 'Benutzer'}
                      </span>
                      <span>{user.first_name || ''} {user.last_name || ''}</span>
                      {user.email && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{user.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelect(user)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 size={18} />
                  </button>
                  {!isCurrentUser && (
                    <button
                      onClick={() => {
                        if (deleteConfirm === user.id) {
                          onDelete(user);
                          setDeleteConfirm(null);
                        } else {
                          setDeleteConfirm(user.id);
                        }
                      }}
                      className={`p-2 rounded transition-colors ${
                        deleteConfirm === user.id
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={deleteConfirm === user.id ? 'Klicken zum Löschen' : 'Löschen'}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
