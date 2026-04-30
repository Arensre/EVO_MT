import { useState, useEffect } from 'react';
import { X, Save, User, Award, Crown, Heart } from 'lucide-react';
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Member {
  id?: string;
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
}

interface MemberModalProps {
  open: boolean;
  memberId?: string | null;
  onClose: () => void;
  onSave?: () => void;
}

type Tab = 'stammdaten' | 'mitgliedschaft' | 'adresse' | 'notizen';

const emptyMember: Member = {
  member_number: '',
  first_name: '',
  last_name: '',
  membership_type: 'A',
  membership_status: 'aktiv',
  entry_date: new Date().toISOString().split('T')[0],
  exit_date: null,
  email: '',
  phone: '',
  mobile: '',
  birthday: '',
  address_street: '',
  address_zip: '',
  address_city: '',
  notes: '',
};

const membershipTypeOptions = [
  { value: 'A', label: 'A - Vollmitglied', icon: Crown },
  { value: 'B', label: 'B - Jugend', icon: User },
  { value: 'C', label: 'C - Fördermitglied', icon: Heart },
  { value: 'D', label: 'D - Ehrenmitglied', icon: Award },
];

const statusOptions = [
  { value: 'aktiv', label: 'Aktiv' },
  { value: 'inaktiv', label: 'Inaktiv' },
  { value: 'suspendiert', label: 'Suspendiert' },
];

export function MemberModal({ open, memberId, onClose, onSave }: MemberModalProps) {
  const [member, setMember] = useState<Member>(emptyMember);
  const [activeTab, setActiveTab] = useState<Tab>('stammdaten');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEdit = !!memberId;

  useEffect(() => {
    if (open) {
      if (memberId) {
        fetchMember(memberId);
      } else {
        setMember(emptyMember);
        setError(null);
        setValidationErrors({});
      }
      setActiveTab('stammdaten');
    }
  }, [open, memberId]);

  const fetchMember = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/members/${id}`);
      const data = response.data.data || response.data;
      setMember({
        ...emptyMember,
        ...data,
      });
    } catch (err) {
      console.error('Error fetching member:', err);
      setError('Fehler beim Laden des Mitglieds');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Member) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setMember((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!member.member_number.trim()) {
      errors.member_number = 'Mitgliedsnummer ist erforderlich';
    }
    if (!member.first_name.trim()) {
      errors.first_name = 'Vorname ist erforderlich';
    }
    if (!member.last_name.trim()) {
      errors.last_name = 'Nachname ist erforderlich';
    }
    if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.email = 'Ungültige E-Mail-Adresse';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...member,
        exit_date: member.exit_date || null,
      };

      if (isEdit && member.id) {
        await axios.put(`${API_URL}/members/${member.id}`, payload);
      } else {
        await axios.post(`${API_URL}/members`, payload);
      }

      onSave?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving member:', err);
      setError(err.response?.data?.message || 'Fehler beim Speichern des Mitglieds');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stammdaten', label: 'Stammdaten' },
    { key: 'mitgliedschaft', label: 'Mitgliedschaft' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'notizen', label: 'Notizen' },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Mitglied bearbeiten' : 'Neues Mitglied'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
            {error}
          </div>
        )}

        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Laden...</div>
          ) : (
            <>
              {activeTab === 'stammdaten' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mitgliedsnummer *
                    </label>
                    <input
                      type="text"
                      value={member.member_number}
                      onChange={handleChange('member_number')}
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        validationErrors.member_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.member_number && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.member_number}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={handleChange('email')}
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      value={member.first_name}
                      onChange={handleChange('first_name')}
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      value={member.last_name}
                      onChange={handleChange('last_name')}
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        validationErrors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geburtstag
                    </label>
                    <input
                      type="date"
                      value={member.birthday}
                      onChange={handleChange('birthday')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={handleChange('phone')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobil
                    </label>
                    <input
                      type="tel"
                      value={member.mobile}
                      onChange={handleChange('mobile')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'mitgliedschaft' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mitgliedsart
                    </label>
                    <select
                      value={member.membership_type}
                      onChange={handleChange('membership_type')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {membershipTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={member.membership_status}
                      onChange={handleChange('membership_status')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eintrittsdatum
                    </label>
                    <input
                      type="date"
                      value={member.entry_date}
                      onChange={handleChange('entry_date')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Austrittsdatum
                    </label>
                    <input
                      type="date"
                      value={member.exit_date || ''}
                      onChange={handleChange('exit_date')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'adresse' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Straße und Hausnummer
                    </label>
                    <input
                      type="text"
                      value={member.address_street}
                      onChange={handleChange('address_street')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PLZ
                      </label>
                      <input
                        type="text"
                        value={member.address_zip}
                        onChange={handleChange('address_zip')}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ort
                      </label>
                      <input
                        type="text"
                        value={member.address_city}
                        onChange={handleChange('address_city')}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notizen' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notizen
                  </label>
                  <textarea
                    value={member.notes}
                    onChange={handleChange('notes')}
                    disabled={loading}
                    rows={8}
                    placeholder="Hier können Sie Notizen zum Mitglied eingeben..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberModal;
