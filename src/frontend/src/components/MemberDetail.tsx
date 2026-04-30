import { useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

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

interface MemberDetailProps {
  member: Member | null;
  onBack: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
}

export function MemberDetail({ member, onBack, onSave, onDelete }: MemberDetailProps) {
  const [formData, setFormData] = useState({
    member_number: member?.member_number || '',
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    email: member?.email || '',
    member_type_name: member?.member_type_name || '',
    entry_date: member?.entry_date || '',
    is_active: member?.is_active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!member;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Zurück</span>
        </button>
        <div className="flex gap-2">
          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 size={18} />
              <span>Löschen</span>
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save size={18} />
            <span>Speichern</span>
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Mitglied bearbeiten' : 'Neues Mitglied'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mitgliedsnummer
            </label>
            <input
              type="text"
              name="member_number"
              value={formData.member_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mitgliedstyp
            </label>
            <input
              type="text"
              name="member_type_name"
              value={formData.member_type_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eintrittsdatum
            </label>
            <input
              type="date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Aktiv
          </label>
        </div>
      </form>
    </div>
  );
}
