import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CustomerFormData } from '../types';

// Simple Markdown Toolbar
function MarkdownToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const buttons = [
    { icon: Bold, text: '**fett**', label: 'Fett' },
    { icon: Italic, text: '*kursiv*', label: 'Kursiv' },
    { icon: List, text: '\n- Listenpunkt', label: 'Liste' },
    { icon: LinkIcon, text: '[Link](url)', label: 'Link' },
  ];

  return (
    <div className="flex gap-1 mb-2">
      {buttons.map(({ icon: Icon, text, label }) => (
        <button
          key={label}
          onClick={() => onInsert(text)}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
          title={label}
          type="button"
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

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
  notes: z.string().optional(),
});

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}

export function CustomerForm({ onSubmit, onCancel }: CustomerFormProps) {
  const [notes, setNotes] = useState('');
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'company',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      country: 'Germany',
      status: 'active',
      notes: '',
    },
  });

  const onFormSubmit = (data: CustomerFormData) => {
    onSubmit({ ...data, notes });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          {...register('name')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="E-Mail"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Telefon"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Straße</label>
        <input
          {...register('address')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Straße"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
          <input
            {...register('postal_code')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="PLZ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
          <input
            {...register('city')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Stadt"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
        <input
          {...register('country')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Land"
          defaultValue="Germany"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
        </select>
      </div>

      {/* Notes Field with Markdown Support */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
        <MarkdownToolbar 
          onInsert={(text) => setNotes((prev) => prev + text)} 
        />
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowNotesPreview(false)}
            className={`text-xs px-2 py-1 rounded ${!showNotesPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
          >
            Bearbeiten
          </button>
          <button
            type="button"
            onClick={() => setShowNotesPreview(true)}
            className={`text-xs px-2 py-1 rounded ${showNotesPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
          >
            Vorschau
          </button>
        </div>
        {showNotesPreview ? (
          <div className="prose prose-sm max-w-none border border-gray-300 rounded-lg p-3 min-h-[150px] bg-white">
            <ReactMarkdown>{notes || ""}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="Notizen in Markdown-Format..."
          />
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Speichern...' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
