import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X, UserPlus, Loader2 } from 'lucide-react';
import type { MemberFormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.125:3001/api';

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MemberFormData) => void;
}

const initialFormData: MemberFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  member_type_id: 0,
  status: 'active',
};

export function MemberModal({ open, onClose, onSave }: MemberModalProps) {
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mitgliedsarten dynamisch aus Stammdaten laden
  const { data: memberTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stammdaten/member-types`);
      return response.data;
    }
  });

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Vorname ist erforderlich';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nachname ist erforderlich';
    }
    if (!formData.member_type_id) {
      newErrors.member_type_id = 'Mitgliedsart ist erforderlich';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof MemberFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserPlus size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Neues Mitglied</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Max"
                  disabled={isSubmitting}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Mustermann"
                  disabled={isSubmitting}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Mitgliedsart */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mitgliedsart <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.member_type_id || ''}
                onChange={(e) => handleChange('member_type_id', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  errors.member_type_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting || isLoadingTypes}
              >
                <option value="">{isLoadingTypes ? 'Laden...' : 'Bitte wählen'}</option>
                {memberTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.member_type_id && (
                <p className="mt-1 text-sm text-red-600">{errors.member_type_id}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="max.mustermann@beispiel.de"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                placeholder="+49 123 456789"
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="suspended">Gesperrt</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
