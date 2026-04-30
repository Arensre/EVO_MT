import { useState, useEffect } from 'react';
import { 
  Edit2, 
  Save, 
  X, 
  Plus,
  Trash2,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  FileText,
  Briefcase,
  Heart
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://172.16.0.125:3001/api';

interface MemberType {
  id: number;
  name: string;
}

interface MemberFunction {
  id: number;
  function_name: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
}

interface Member {
  id: number;
  member_number: string;
  salutation?: string;
  title?: string;
  first_name: string;
  last_name: string;
  birth_name?: string;
  birth_date?: string;
  birth_place?: string;
  gender?: string;
  marital_status?: string;
  wedding_date?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  profession?: string;
  occupation?: string;
  member_type_id?: number;
  member_type_name?: string;
  entry_date?: string;
  exit_date?: string;
  distribution_scope?: string;
  letter_salutation?: string;
  notes?: string;
  is_active: boolean;
}

interface MemberDetailProps {
  member: Member;
  onBack?: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
}

export function MemberDetail({ member, onBack, onSave, onDelete }: MemberDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [functions, setFunctions] = useState<MemberFunction[]>([]);
  const [activeTab, setActiveTab] = useState<'stammdaten' | 'mitgliedschaft' | 'funktionen' | 'notizen'>('stammdaten');
  
  const [formData, setFormData] = useState({
    salutation: member.salutation || '',
    title: member.title || '',
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    birth_name: member.birth_name || '',
    birth_date: member.birth_date || '',
    birth_place: member.birth_place || '',
    gender: member.gender || '',
    marital_status: member.marital_status || '',
    wedding_date: member.wedding_date || '',
    street: member.street || '',
    postal_code: member.postal_code || '',
    city: member.city || '',
    country: member.country || 'Deutschland',
    email: member.email || '',
    phone: member.phone || '',
    mobile: member.mobile || '',
    profession: member.profession || '',
    occupation: member.occupation || '',
    member_type_id: member.member_type_id || '',
    entry_date: member.entry_date || '',
    exit_date: member.exit_date || '',
    distribution_scope: member.distribution_scope || 'gesamter Verband',
    letter_salutation: member.letter_salutation || '',
    notes: member.notes || '',
    is_active: member.is_active,
  });

  useEffect(() => {
    fetchMemberTypes();
    fetchFunctions();
  }, [member.id]);

  const fetchMemberTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      setMemberTypes(response.data.filter((t: any) => t.is_active));
    } catch (err) {
      console.error('Error fetching member types:', err);
    }
  };

  const fetchFunctions = async () => {
    try {
      const response = await axios.get(`${API_URL}/members/${member.id}/functions`);
      setFunctions(response.data);
    } catch (err) {
      console.error('Error fetching functions:', err);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const calculateDuration = () => {
    if (!member.entry_date) return { years: 0, months: 0, days: 0 };
    const start = new Date(member.entry_date);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }
    return { years, months, days };
  };

  const duration = calculateDuration();

  const renderStammdaten = () => (
    <div className="space-y-6">
      {/* Persönliche Daten */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} />
          Persönliche Daten
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Anrede</label>
            {isEditing ? (
              <select value={formData.salutation} onChange={handleChange('salutation')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Bitte wählen</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            ) : (
              <p className="mt-1 text-gray-900">{member.salutation || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Titel</label>
            {isEditing ? (
              <input type="text" value={formData.title} onChange={handleChange('title')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.title || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vorname *</label>
            {isEditing ? (
              <input type="text" value={formData.first_name} onChange={handleChange('first_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            ) : (
              <p className="mt-1 text-gray-900">{member.first_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nachname *</label>
            {isEditing ? (
              <input type="text" value={formData.last_name} onChange={handleChange('last_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            ) : (
              <p className="mt-1 text-gray-900">{member.last_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Geburtsname</label>
            {isEditing ? (
              <input type="text" value={formData.birth_name} onChange={handleChange('birth_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.birth_name || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Geburtsdatum</label>
            {isEditing ? (
              <input type="date" value={formData.birth_date} onChange={handleChange('birth_date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.birth_date || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Anschrift
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Straße</label>
            {isEditing ? (
              <input type="text" value={formData.street} onChange={handleChange('street')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.street || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PLZ</label>
            {isEditing ? (
              <input type="text" value={formData.postal_code} onChange={handleChange('postal_code')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.postal_code || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ort</label>
            {isEditing ? (
              <input type="text" value={formData.city} onChange={handleChange('city')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.city || '-'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMitgliedschaft = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={20} />
          Mitgliedschaft
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mitgliedsnummer</label>
            <p className="mt-1 text-gray-900 font-mono">{member.member_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mitgliedsart</label>
            {isEditing ? (
              <select value={formData.member_type_id} onChange={handleChange('member_type_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">Bitte wählen</option>
                {memberTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-gray-900">{member.member_type_name || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Eintrittsdatum</label>
            {isEditing ? (
              <input type="date" value={formData.entry_date} onChange={handleChange('entry_date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.entry_date || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Austrittsdatum</label>
            {isEditing ? (
              <input type="date" value={formData.exit_date} onChange={handleChange('exit_date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            ) : (
              <p className="mt-1 text-gray-900">{member.exit_date || '-'}</p>
            )}
          </div>
        </div>
        
        {/* Mitgliedszeiten */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Mitgliedszeiten</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{duration.years}</div>
              <div className="text-sm text-blue-800">Jahre</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{duration.months}</div>
              <div className="text-sm text-blue-800">Monate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{duration.days}</div>
              <div className="text-sm text-blue-800">Tage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFunktionen = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase size={20} />
          Mitgliedsfunktionen
        </h3>
        {functions.length === 0 ? (
          <p className="text-gray-500">Keine Funktionen zugewiesen</p>
        ) : (
          <div className="space-y-2">
            {functions.map((func: any) => (
              <div key={func.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{func.function_name}</div>
                  <div className="text-sm text-gray-500">
                    {func.start_date && new Date(func.start_date).toLocaleDateString('de-DE')}
                    {func.end_date && ` - ${new Date(func.end_date).toLocaleDateString('de-DE')}`}
                    {!func.end_date && ' (aktiv)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotizen = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Notizen
        </h3>
        {isEditing ? (
          <textarea
            value={formData.notes}
            onChange={handleChange('notes')}
            rows={10}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Notizen..."
          />
        ) : (
          <div className="prose max-w-none">
            {member.notes ? (
              <div className="whitespace-pre-wrap">{member.notes}</div>
            ) : (
              <p className="text-gray-500 italic">Keine Notizen vorhanden</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
                ← Zurück
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {member.last_name}, {member.first_name}
              </h2>
              <p className="text-sm text-gray-500">{member.member_number} • {member.member_type_name || 'Keine Mitgliedsart'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} />
                  Speichern
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={18} />
                  Bearbeiten
                </button>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                    Löschen
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {[
            { id: 'stammdaten', label: 'Stammdaten', icon: User },
            { id: 'mitgliedschaft', label: 'Mitgliedschaft', icon: Award },
            { id: 'funktionen', label: 'Funktionen', icon: Briefcase },
            { id: 'notizen', label: 'Notizen', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'stammdaten' && renderStammdaten()}
        {activeTab === 'mitgliedschaft' && renderMitgliedschaft()}
        {activeTab === 'funktionen' && renderFunktionen()}
        {activeTab === 'notizen' && renderNotizen()}
      </div>
    </div>
  );
}
