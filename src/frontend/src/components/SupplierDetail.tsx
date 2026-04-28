import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  Plus,
  Building2, 
  Users, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  Eye,
  Trash2,
  Edit3,
  Star
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Supplier, SupplierType, SupplierFormData, Person, PersonFormData } from '../types';
import { PersonModal } from './PersonModal';
import { PersonDeleteModal } from './PersonDeleteModal';
import { personApi } from '../api';

interface SupplierDetailProps {
  supplier: Supplier;
  onClose?: () => void;
  onBack?: () => void;
  onSave: (data: SupplierFormData) => void;
  onDelete?: () => void;
  isMobile?: boolean;
  onSupplierUpdate?: () => void;
}

const typeIcons: Record<SupplierType, typeof Building2> = {
  company: Building2,
  
  private: User,
};

const typeLabels: Record<SupplierType, string> = {
  company: 'Firma',
  
  private: 'Privat',
};

// Simple Markdown Toolbar
function MarkdownToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const buttons = [
    { icon: Bold, text: '**fett**', label: 'Fett' },
    { icon: Italic, text: '*kursiv*', label: 'Kursiv' },
    { icon: List, text: '\n- Listenpunkt', label: 'Liste' },
    { icon: LinkIcon, text: '[Link](url)', label: 'Link' },
  ];

  return (
    <div className="flex gap-1 p-2 bg-gray-100 rounded-t-lg border-b border-gray-200">
      {buttons.map(({ icon: Icon, text, label }) => (
        <button
          key={label}
          onClick={() => onInsert(text)}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

export function SupplierDetail({ supplier, onClose, onBack, onSave, onDelete, isMobile, onSupplierUpdate }: SupplierDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: supplier.name,
    type: supplier.type,
    email: supplier.email || '',
    phone: supplier.phone || '',
    address: supplier.address || '',
    postal_code: supplier.postal_code || '',
    city: supplier.city || '',
    country: supplier.country || 'Germany',
    status: supplier.status || 'active',
    notes: supplier.notes || '',
  });

  // Persons state
  const [persons, setPersons] = useState<Person[]>([]);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isPersonDeleteModalOpen, setIsPersonDeleteModalOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    setFormData({
      name: supplier.name,
      type: supplier.type,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      postal_code: supplier.postal_code || '',
      city: supplier.city || '',
      country: supplier.country || 'Germany',
      status: supplier.status || 'active',
      notes: supplier.notes || '',
    });
    // Load persons for this supplier
    if (supplier.type !== 'private') {
      loadPersons();
    }
  }, [supplier]);

  const loadPersons = async () => {
    try {
      const data = await personApi.getBySupplier(supplier.id);
      setPersons(data);
    } catch (error) {
      console.error('Error loading persons:', error);
    }
  };

  const Icon = typeIcons[supplier.type] || Building2;
  const showContactPersons = supplier.type !== 'private';

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
    if (onSupplierUpdate) onSupplierUpdate();
  };

  const handleCancel = () => {
    setFormData({
      name: supplier.name,
      type: supplier.type,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      postal_code: supplier.postal_code || '',
      city: supplier.city || '',
      country: supplier.country || 'Germany',
      status: supplier.status || 'active',
      notes: supplier.notes || '',
    });
    setIsEditing(false);
  };

  const insertMarkdown = (text: string) => {
    setFormData({ ...formData, notes: (formData.notes || '') + text });
  };

  // Person handlers
  const handleAddPerson = () => {
    setEditingPerson(null);
    setIsPersonModalOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleDeletePersonClick = (person: Person) => {
    setPersonToDelete({ id: person.id, name: `${person.first_name} ${person.last_name}` });
    setIsPersonDeleteModalOpen(true);
  };

  const handleDeletePersonConfirm = async () => {
    if (!personToDelete) return;
    try {
      await personApi.delete(personToDelete.id);
      setIsPersonDeleteModalOpen(false);
      setPersonToDelete(null);
      await loadPersons();
      if (onSupplierUpdate) onSupplierUpdate();
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handlePersonSubmit = async (data: PersonFormData) => {
    try {
      if (editingPerson) {
        await personApi.update(editingPerson.id, data);
      } else {
        await personApi.create(data);
      }
      setIsPersonModalOpen(false);
      setEditingPerson(null);
      await loadPersons();
      if (onSupplierUpdate) onSupplierUpdate();
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

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
              <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {typeLabels[supplier.type] || 'Firma'}
                </span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {supplier.supplier_number}
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
                  <Edit2 size={18} />
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
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SupplierType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="company">Firma</option>
                    <option value="club">Verein</option>
                    <option value="private">Privat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplier.address && (
                <div>
                  <label className="text-sm text-gray-500">Adresse</label>
                  <p className="text-gray-900">{supplier.address}</p>
                </div>
              )}
              {(supplier.postal_code || supplier.city) && (
                <div>
                  <label className="text-sm text-gray-500">Ort</label>
                  <p className="text-gray-900">{supplier.postal_code} {supplier.city}</p>
                </div>
              )}
              {supplier.country && (
                <div>
                  <label className="text-sm text-gray-500">Land</label>
                  <p className="text-gray-900">{supplier.country}</p>
                </div>
              )}
              {supplier.email && (
                <div>
                  <label className="text-sm text-gray-500">E-Mail</label>
                  <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Mail size={14} />
                    {supplier.email}
                  </a>
                </div>
              )}
              {supplier.phone && (
                <div>
                  <label className="text-sm text-gray-500">Telefon</label>
                  <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Phone size={14} />
                    {supplier.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notizen mit Markdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Notizen
          </h3>
          
          {isEditing ? (
            <div>
              <MarkdownToolbar onInsert={insertMarkdown} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Code size={14} />
                    Markdown
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="# Überschrift\n\n- Listenpunkt\n- **fett** oder *kursiv*\n\n[Link](https://...)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Eye size={14} />
                    Vorschau
                  </label>
                  <div className="w-full h-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-auto prose prose-sm max-w-none">
                    {formData.notes ? (
                      <ReactMarkdown>{formData.notes}</ReactMarkdown>
                    ) : (
                      <p className="text-gray-400 italic">Vorschau...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
              {supplier.notes ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{supplier.notes}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-400 italic">Keine Notizen vorhanden. Klicken Sie auf Bearbeiten, um Notizen hinzuzufügen.</p>
              )}
            </div>
          )}
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
                onClick={handleAddPerson}
                className="relative group p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Ansprechpartner hinzufügen
                </span>
              </button>
            </div>
            
            {persons.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                Keine Ansprechpartner vorhanden.
                <br />
                <button onClick={handleAddPerson} className="text-emerald-600 hover:underline mt-2">
                  Ersten Ansprechpartner anlegen
                </button>
              </div>
            ) : (
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
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                              <Star size={12} fill="currentColor" />
                              Hauptansprechpartner
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {person.position && <div className="text-gray-500">{person.position}</div>}
                          {person.department && <div className="text-gray-500">{person.department}</div>}
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            {person.email && (
                              <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                <Mail size={14} />
                                {person.email}
                              </a>
                            )}
                            {person.phone && (
                              <a href={`tel:${person.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                <Phone size={14} />
                                {person.phone}
                              </a>
                            )}
                            {person.mobile && (
                              <a href={`tel:${person.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                <Phone size={14} />
                                Mobil: {person.mobile}
                              </a>
                            )}
                          </div>
                        </div>
                        
                        {person.notes && (
                          <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            {person.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPerson(person)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePersonClick(person)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Weitere Informationen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weitere Informationen</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {supplier.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-500">Erstellt am</label>
              <p className="text-gray-900">{new Date(supplier.created_at).toLocaleDateString('de-DE')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Letzte Änderung</label>
              <p className="text-gray-900">{new Date(supplier.updated_at).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Person Modal */}
      <PersonModal
        isOpen={isPersonModalOpen}
        supplierId={supplier.id}
        person={editingPerson}
        onClose={() => {
          setIsPersonModalOpen(false);
          setEditingPerson(null);
        }}
        onSubmit={handlePersonSubmit}
      />

      {/* Person Delete Modal */}
      <PersonDeleteModal
        isOpen={isPersonDeleteModalOpen}
        personName={personToDelete?.name || ''}
        onClose={() => {
          setIsPersonDeleteModalOpen(false);
          setPersonToDelete(null);
        }}
        onConfirm={handleDeletePersonConfirm}
      />
    </div>
  );
}
