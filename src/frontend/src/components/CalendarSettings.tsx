import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Calendar, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

interface EventCategory {
  id: number;
  name: string;
  color: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface CalendarSettingsProps {
  moduleSetting?: {
    id: number;
    module_name: string;
    is_enabled: boolean;
  };
  onToggle?: () => void;
}

export function CalendarSettings({ moduleSetting, onToggle }: CalendarSettingsProps) {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/events/categories/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/events/categories/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/events/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      cancelEdit();
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert('Fehler beim Speichern: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diese Kategorie wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Fehler beim Löschen');
    }
  };

  const startEdit = (category: EventCategory) => {
    setEditingId(category.id);
    setIsCreating(false);
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || '',
      is_active: category.is_active ?? false
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ name: '', color: '#3B82F6', description: '', is_active: true });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', color: '#3B82F6', description: '', is_active: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Calendar size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Kalender</h2>
              <p className="text-gray-600">Kalender und Terminkategorien verwalten</p>
            </div>
          </div>
          {onToggle && moduleSetting && (
            <button
              onClick={() => onToggle()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                moduleSetting?.is_enabled
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {moduleSetting?.is_enabled ? (
                <>
                  <ToggleRight size={20} />
                  <span>Modul aktiv</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={20} />
                  <span>Modul inaktiv</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag size={20} className="text-emerald-600" />
            Kategorien
          </h3>
          {!isCreating && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={18} />
              Neue Kategorie
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {/* Create new row */}
          {isCreating && (
            <div className="p-4 bg-emerald-50">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: formData.color }}
                >
                  <Tag size={20} className="text-white" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Kategoriename"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farbe *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-16 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      rows={2}
                      placeholder="Optionale Beschreibung"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active_new"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="is_active_new" className="text-sm font-medium text-gray-700">Aktiv</label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!formData.name}
                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Speichern"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Abbrechen"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {categories.length === 0 && !isCreating ? (
            <div className="p-8 text-center text-gray-500">
              <Tag size={48} className="mx-auto text-gray-300 mb-4" />
              <p>Keine Kategorien vorhanden</p>
              <p className="text-sm mt-1">Erstellen Sie eine neue Kategorie für Ihre Termine</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4">
                {editingId === category.id ? (
                  /* Edit mode */
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: formData.color }}
                    >
                      <Tag size={20} className="text-white" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farbe *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`is_active_${category.id}`}
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <label htmlFor={`is_active_${category.id}`} className="text-sm font-medium text-gray-700">Aktiv</label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={!formData.name}
                        className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Speichern"
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Abbrechen"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <Tag size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!category.is_active && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Inaktiv
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
