import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CustomerFormData } from '../types';

const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  type: z.enum(['company', 'club', 'private'] as const),
  email: z.string().email('Ungültige E-Mail').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.string().optional(),
});

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}

export function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'company',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      postal_code: initialData?.postal_code || '',
      city: initialData?.city || '',
      country: initialData?.country || 'Germany',
      status: initialData?.status || 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          {...register('name')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Name des Kunden"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Typ *
        </label>
        <select
          {...register('type')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="company">Firma</option>
          <option value="club">Verein</option>
          <option value="private">Privat</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="E-Mail"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Telefon"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Straße</label>
        <input
          {...register('address')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          placeholder="Straße"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
          <input
            {...register('postal_code')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="PLZ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
          <input
            {...register('city')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Stadt"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
        <input
          {...register('country')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          placeholder="Land"
          defaultValue="Germany"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Speichern...' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
