import { useState, useEffect } from 'react';
import { X, Clock, MapPin, AlignLeft, Calendar, Tag } from 'lucide-react';
import axios from 'axios';

interface EventCategory {
  id: number;
  name: string;
  color: string;
}

interface Event {
  id?: number;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  category_id?: number;
  color?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: (id: number) => void;
  event?: Event | null;
  initialDate?: Date;
}

export function EventModal({ isOpen, onClose, onSave, onDelete, event, initialDate }: EventModalProps) {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [formData, setFormData] = useState<Event>({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    is_all_day: false,
    category_id: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/events/categories/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    if (isOpen) loadCategories();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        end_date: event.end_date || event.start_date,
      });
    } else if (initialDate) {
      const dateStr = initialDate.toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: dateStr,
        end_date: dateStr,
        start_time: '',
        end_time: '',
        is_all_day: false,
        category_id: undefined,
      });
    }
  }, [event, initialDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date) return;
    
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;
    if (!confirm('Termin wirklich löschen?')) return;
    
    setIsLoading(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {event ? 'Termin bearbeiten' : 'Neuer Termin'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Terminname"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag size={16} className="inline mr-1" />
              Kategorie
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Keine Kategorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formData.category_id && (
              <div className="mt-1 flex items-center gap-2">
                {categories.find(c => c.id === formData.category_id) && (
                  <>
                    <span 
                      className="inline-block w-4 h-4 rounded-full" 
                      style={{ backgroundColor: categories.find(c => c.id === formData.category_id)?.color }}
                    />
                    <span className="text-sm text-gray-600">
                      {categories.find(c => c.id === formData.category_id)?.name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_all_day"
              checked={formData.is_all_day}
              onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="is_all_day" className="text-sm font-medium text-gray-700">
              Ganztägiger Termin
            </label>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Startdatum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {!formData.is_all_day && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock size={16} className="inline mr-1" />
                  Startzeit
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enddatum
              </label>
              <input
                type="date"
                value={formData.end_date || formData.start_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!formData.is_all_day && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endzeit
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="inline mr-1" />
              Ort
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Veranstaltungsort"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <AlignLeft size={16} className="inline mr-1" />
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Beschreibung des Termins"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            {event?.id && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={isLoading}
              >
                Löschen
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || !formData.title || !formData.start_date}
            >
              {isLoading ? 'Speichern...' : (event ? 'Aktualisieren' : 'Speichern')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
