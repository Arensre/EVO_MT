import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://172.16.0.125:3001/api';

interface Member {
  id: number;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  member_type_name: string;
  entry_date: string;
  is_active: boolean;
}

interface MemberListProps {
  onSelectMember: (member: Member) => void;
  selectedMemberId: number | null;
  onCreateNew: () => void;
  onEditMember?: (member: Member) => void;
  onDeleteMember?: (member: Member) => void;
}

export function MemberList({ onSelectMember, selectedMemberId, onCreateNew, onEditMember, onDeleteMember }: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', searchTerm],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/members`, {
        params: { search: searchTerm || undefined }
      });
      return response.data;
    }
  });

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} />
            Mitglieder
          </h2>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Neu
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Laden...</div>
        ) : members.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Keine Mitglieder gefunden</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member: Member) => (
              <div
                key={member.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  selectedMemberId === member.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectMember(member)}
                  >
                    <div className="font-medium text-gray-900">
                      {member.last_name}, {member.first_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.member_number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{member.member_type_name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-2">
                    {onEditMember && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMember(member);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {onDeleteMember && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMember(member);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
