import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Trash2,
  Calendar,
  BadgeCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Member, MemberFormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.125:3001/api';

interface MemberDetailProps {
  member: Member;
  onBack?: () => void;
  onSave: (data: MemberFormData) => void;
  onDelete?: () => void;
  isMobile?: boolean;
}

export function MemberDetail({ member, onBack, onSave, onDelete, isMobile }: MemberDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mitgliedsarten dynamisch aus Stammdaten laden
  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      return response.data;
    }
  });
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email || '',
    phone: member.phone || '',
    address: member.address || '',
    postal_code: member.postal_code || '',
    city: member.city || '',
    country: member.country || '',
    birth_date: member.birth_date || '',
    member_type_id: member.member_type_id,
    status: member.status,
    join_date: member.join_date || '',
    notes: member.notes || '',
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      postal_code: member.postal_code || '',
      city: member.city || '',
      country: member.country || '',
      birth_date: member.birth_date || '',
      member_type_id: member.member_type_id,
      status: member.status,
      join_date: member.join_date || '',
      notes: member.notes || '',
    });
    setIsEditing(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'inactive': return 'Inaktiv';
      case 'suspended': return 'Gesperrt';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(isMobile || onBack) && (
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="p-2 bg-emerald-100 rounded-lg">
              <User size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {member.first_name} {member.last_name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {member.member_number}
                </span>
                {member.member_type && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {member.member_type.name}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(member.status)}`}>
                  {getStatusLabel(member.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bearbeiten
                </button>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                    Löschen
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  Speichern
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={18} />
                  Abbrechen
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Persönliche Daten */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BadgeCheck size={20} className="text-gray-400" />
            Persönliche Daten
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsart *</label>
              <select
                value={formData.member_type_id}
                onChange={(e) => setFormData({ ...formData, member_type_id: parseInt(e.target.value) })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              >
                <option value="">Bitte wählen</option>
                {memberTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="suspended">Gesperrt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} />
                Geburtsdatum
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eintrittsdatum</label>
              <input
                type="date"
                value={formData.join_date || ''}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Kontaktdaten */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-400" />
            Kontaktdaten
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <input
                type="text"
                value={formData.postal_code || ''}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail size={14} />
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone size={14} />
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Notizen */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Notizen
          </h3>
          
          {isEditing ? (
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Notizen..."
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
              {member.notes ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{member.notes}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-400 italic">Keine Notizen vorhanden.</p>
              )}
            </div>
          )}
        </div>

        {/* Weitere Informationen */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weitere Informationen</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-500">Erstellt am</label>
              <p className="text-gray-900">{new Date(member.created_at || '').toLocaleDateString('de-DE')}</p>
            </div>
            <div>
              <label className="text-gray-500">Letzte Änderung</label>
              <p className="text-gray-900">{new Date(member.updated_at || '').toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
