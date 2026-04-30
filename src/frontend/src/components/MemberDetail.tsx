import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit, User, Award, Crown, Heart, Calendar, Mail, Phone, Smartphone, MapPin } from 'lucide-react';
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
  entry_date?: string;
  exit_date?: string | null;
  email?: string;
  phone?: string;
  mobile?: string;
  birthday?: string;
  address_street?: string;
  address_zip?: string;
  address_city?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface MemberDetailProps {
  memberId: string;
  onBack?: () => void;
  onEdit?: () => void;
}

type Tab = 'stammdaten' | 'mitgliedschaft' | 'funktionen' | 'notizen';

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

export function MemberDetail({ memberId, onBack, onEdit }: MemberDetailProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('stammdaten');

  const fetchMember = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/members/${memberId}`);
      setMember(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching member:', err);
      setError('Fehler beim Laden des Mitglieds');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stammdaten', label: 'Stammdaten' },
    { key: 'mitgliedschaft', label: 'Mitgliedschaft' },
    { key: 'funktionen', label: 'Funktionen' },
    { key: 'notizen', label: 'Notizen' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error || 'Mitglied nicht gefunden'}
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Zurück
          </button>
        )}
      </div>
    );
  }

  const Icon = membershipTypeIcons[member.membership_type] || User;

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-start">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="mb-2 flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={16} />
                Zurück
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon size={24} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.first_name} {member.last_name}
                </h2>
                <p className="text-gray-500">
                  Mitgliedsnummer: {member.member_number}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              {membershipTypeLabels[member.membership_type] || member.membership_type}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[member.membership_status]}`}>
              {member.membership_status}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Edit size={16} />
                Bearbeiten
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'stammdaten' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1">Vorname</label>
                <div className="text-gray-900">{member.first_name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1">Nachname</label>
                <div className="text-gray-900">{member.last_name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Mail size={14} /> E-Mail
                </label>
                <div className="text-gray-900">{member.email || '-'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar size={14} /> Geburtstag
                </label>
                <div className="text-gray-900">{member.birthday ? new Date(member.birthday).toLocaleDateString('de-DE') : '-'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Phone size={14} /> Telefon
                </label>
                <div className="text-gray-900">{member.phone || '-'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Smartphone size={14} /> Mobil
                </label>
                <div className="text-gray-900">{member.mobile || '-'}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} /> Adresse
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Straße</label>
                  <div className="text-gray-900">{member.address_street || '-'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">PLZ</label>
                  <div className="text-gray-900">{member.address_zip || '-'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ort</label>
                  <div className="text-gray-900">{member.address_city || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mitgliedschaft' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Mitgliedsnummer</label>
              <div className="text-gray-900">{member.member_number}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Mitgliedsart</label>
              <div className="text-gray-900">{membershipTypeLabels[member.membership_type] || member.membership_type}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <div className="text-gray-900">{member.membership_status}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Eintrittsdatum</label>
              <div className="text-gray-900">{member.entry_date ? new Date(member.entry_date).toLocaleDateString('de-DE') : '-'}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Austrittsdatum</label>
              <div className="text-gray-900">{member.exit_date ? new Date(member.exit_date).toLocaleDateString('de-DE') : '-'}</div>
            </div>
          </div>
        )}

        {activeTab === 'funktionen' && (
          <div className="text-gray-500 text-center py-12">
            Funktionen werden in einem zukünftigen Update implementiert.
          </div>
        )}

        {activeTab === 'notizen' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
              <label className="block text-sm font-medium text-gray-500 mb-1">Notizen</label>
              <div className="text-gray-900 whitespace-pre-wrap">{member.notes || '-'}</div>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              {member.created_at && (
                <div>Erstellt am: {new Date(member.created_at).toLocaleDateString('de-DE')}</div>
              )}
              {member.updated_at && (
                <div>Zuletzt aktualisiert: {new Date(member.updated_at).toLocaleDateString('de-DE')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDetail;
