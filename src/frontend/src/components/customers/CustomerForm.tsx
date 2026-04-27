import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Customer, CustomerFormData, CustomerType } from '../../types';
import { customerApi } from '../../services/api';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: 'company', label: 'Firma' },
  { value: 'club', label: 'Verein' },
  { value: 'private', label: 'Privatperson' },
];

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer?.name || '',
    type: customer?.type || 'company',
    street: customer?.street || '',
    zipCode: customer?.zipCode || '',
    city: customer?.city || '',
    country: customer?.country || 'Deutschland',
    email: customer?.email || '',
    phone: customer?.phone || '',
    website: customer?.website || '',
    notes: customer?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const mutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      customer ? customerApi.update(customer.id, data) : customerApi.create(data),
    onSuccess,
  });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website muss mit http:// oder https:// beginnen';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is changed
    if (errors[name as keyof CustomerFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="col-span-2">
          <label htmlFor="name" className="label">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Firmenname oder Name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="label">
            Typ <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input"
          >
            {CUSTOMER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Street */}
        <div>
          <label htmlFor="street" className="label">
            Straße
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="input"
            placeholder="Straße und Hausnummer"
          />
        </div>

        {/* Zip Code */}
        <div>
          <label htmlFor="zipCode" className="label">
            PLZ
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="input"
            placeholder="12345"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="label">
            Stadt
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="input"
            placeholder="Stadt"
          />
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="label">
            Land
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="input"
            placeholder="Land"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="label">
            E-Mail
          </label>
          <input
            type="email"
            id="email"
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
          <label htmlFor="phone" className="label">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+49 123 456789"
          />
        </div>

        {/* Website */}
        <div className="col-span-2">
          <label htmlFor="website" className="label">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={`input ${errors.website ? 'border-red-500' : ''}`}
            placeholder="https://www.beispiel.de"
          />
          {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label htmlFor="notes" className="label">
            Notizen
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="input resize-none"
            placeholder="Zusätzliche Informationen..."
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Abbrechen
        </button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Speichern...' : customer ? 'Aktualisieren' : 'Erstellen'}
        </button>
      </div>
    </form>
  );
}
