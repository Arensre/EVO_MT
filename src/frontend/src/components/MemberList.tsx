import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Users, User, Award, Crown, Heart } from 'lucide-react';
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.125:3001/api';

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  membership_type: 'A' | 'B' | 'C' | 'D';
  membership_status: 'aktiv' | 'inaktiv' | 'suspendiert';
  email?: string;
  phone?: string;
  birthday?: string;
}

interface MemberListProps {
  onSelectMember?: (member: Member) => void;
  onCreateNew?: () => void;
}

const membershipTypeIcons: Record<string, typeof User> = {
  A: Crown,
  B: User,
  C: Heart,
  D: Award,
};

const membershipTypeLabels: Record<string, string> = {
  A: 'A - Vollmitglied',
  B: 'B - Jugend',
  C: 'C - Fördermitglied',
  D: 'D - Ehrenmitglied',
};

const statusColors: Record<string, string> = {
  aktiv: 'bg-emerald-100 text-emerald-700',
  inaktiv: 'bg-gray-100 text-gray-600',
  suspendiert: 'bg-red-100 text-red-700',
};

export function MemberList({ onSelectMember, onCreateNew }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/members`);
      setMembers(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Fehler beim Laden der Mitglieder');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.member_number.toLowerCase().includes(searchLower) ||
      member.first_name.toLowerCase().includes(searchLower) ||
      member.last_name.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleRowClick = (member: Member) => {
    if (onSelectMember) {
      onSelectMember(member);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={28} />
              Mitglieder
            </h2>
            <p className="text-gray-500 mt-1">
              {members.length} Mitglieder
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Neu
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Suche nach Mitgliedsnummer, Name oder E-Mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
          {error}
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Lade Mitglieder...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Keine Mitglieder gefunden
          </div>
        ) : (
          filteredMembers.map((member) => {
            const Icon = membershipTypeIcons[member.membership_type] || User;
            return (
              <div
                key={member.id}
                onClick={() => handleRowClick(member)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {member.last_name}, {member.first_name}
                        </span>
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {member.member_number}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {membershipTypeLabels[member.membership_type] || member.membership_type}
                        </span>
                        {member.email && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>{member.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[member.membership_status] || 'bg-gray-100 text-gray-600'}`}>
                    {member.membership_status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
        {filteredMembers.length} von {members.length} Mitgliedern angezeigt
      </div>
    </div>
  );
}

export default MemberList;
