import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Person, PersonFormData } from '../../types';
import { personApi } from '../../services/api';

interface PersonFormProps {
  customerId: number;
  person?: Person;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PersonForm({ customerId, person, onSuccess, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState<PersonFormData>({
    firstName: person?.firstName || '',
    lastName: person?.lastName || '',
    email: person?.email || '',
    phone: person?.phone || '',
    role: person?.role || '',
    isPrimary: person?.isPrimary || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PersonFormData, string>>>({});

  const mutation = useMutation({
    mutationFn: (data: PersonFormData) =>
      person ? personApi.update(person.id, data) : personApi.create(customerId, data),
    onSuccess,
  });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear error when field is changed
    if (errors[name as keyof PersonFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="label">
            Vorname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`input ${errors.firstName ? 'border-red-500' : ''}`}
            placeholder="Vorname"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="label">
            Nachname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`input ${errors.lastName ? 'border-red-500' : ''}`}
            placeholder="Nachname"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="label">
            Position/Rolle
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
            placeholder="z.B. Geschäftsführer"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="personEmail" className="label">
            E-Mail
          </label>
          <input
            type="email"
            id="personEmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="email@beispiel.de"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="personPhone" className="label">
            Telefon
          </label>
          <input
            type="tel"
            id="personPhone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+49 123 456789"
          />
        </div>

        {/* Is Primary */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrimary"
            name="isPrimary"
            checked={formData.isPrimary}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
            Primärer Ansprechpartner
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Abbrechen
        </button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Speichern...' : person ? 'Aktualisieren' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  );
}
