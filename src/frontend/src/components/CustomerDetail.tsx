import { ArrowLeft, Edit, Plus, X, Building2, Users, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import type { Customer, CustomerType } from '../types';

interface Person {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  is_primary?: boolean;
}

interface CustomerDetailProps {
  customer: Customer;
  onClose?: () => void;
  onBack?: () => void;
  onEdit: () => void;
  isMobile?: boolean;
}

const typeIcons: Record<CustomerType, typeof Building2> = {
  company: Building2,
  club: Users,
  private: User,
};

const typeLabels: Record<CustomerType, string> = {
  company: 'Firma',
  club: 'Verein',
  private: 'Privat',
};

// Dummy persons data
const dummyPersons: Person[] = [];

export function CustomerDetail({ customer, onClose, onBack, onEdit, isMobile }: CustomerDetailProps) {
  const persons = dummyPersons;
  const Icon = typeIcons[customer.type] || Building2;
  
  // Ansprechpartner nur für Firmen und Vereine, nicht für Privatpersonen
  const showContactPersons = customer.type !== 'private';

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(isMobile || onBack) && (
              <button
                onClick={onBack || onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon size={24} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {typeLabels[customer.type] || 'Firma'}
                </span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {customer.customer_number}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} />
              Bearbeiten
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Kontaktdaten */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-400" />
            Kontaktdaten
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.address && (
              <div>
                <label className="text-sm text-gray-500">Adresse</label>
                <p className="text-gray-900">{customer.address}</p>
              </div>
            )}
            {(customer.postal_code || customer.city) && (
              <div>
                <label className="text-sm text-gray-500">Ort</label>
                <p className="text-gray-900">{customer.postal_code} {customer.city}</p>
              </div>
            )}
            {customer.country && (
              <div>
                <label className="text-sm text-gray-500">Land</label>
                <p className="text-gray-900">{customer.country}</p>
              </div>
            )}
            {customer.email && (
              <div>
                <label className="text-sm text-gray-500">E-Mail</label>
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                  <Mail size={14} />
                  {customer.email}
                </a>
              </div>
            )}
            {customer.phone && (
              <div>
                <label className="text-sm text-gray-500">Telefon</label>
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                  <Phone size={14} />
                  {customer.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Notizen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Notizen
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
            {customer.notes ? (
              <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            ) : (
              <p className="text-gray-400 italic">Keine Notizen vorhanden.</p>
            )}
          </div>
        </div>

        {/* Ansprechpartner - nur für Firmen und Vereine */}
        {showContactPersons && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-gray-400" />
                Ansprechpartner ({persons.length})
              </h3>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Hinzufügen
              </button>
            </div>

            <div className="space-y-3">
              {persons.map((person) => (
                <div key={person.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {person.first_name} {person.last_name}
                        </span>
                        {person.is_primary && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            Hauptansprechpartner
                          </span>
                        )}
                      </div>
                      {(person.position || person.department) && (
                        <p className="text-sm text-gray-500">
                          {person.position}{person.department && person.position ? ' • ' : ''}{person.department}
                        </p>
                      )}
                      <div className="mt-2 space-y-1 text-sm">
                        {person.email && (
                          <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Mail size={12} />
                            {person.email}
                          </a>
                        )}
                        {person.phone && (
                          <a href={`tel:${person.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Phone size={12} />
                            {person.phone}
                          </a>
                        )}
                        {person.mobile && (
                          <a href={`tel:${person.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Phone size={12} />
                            {person.mobile} (Mobil)
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {persons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Keine Ansprechpartner vorhanden.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weitere Informationen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weitere Informationen</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {customer.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-500">Erstellt am</label>
              <p className="text-gray-900">{new Date(customer.created_at).toLocaleDateString('de-DE')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Letzte Änderung</label>
              <p className="text-gray-900">{new Date(customer.updated_at).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
