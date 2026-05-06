import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check, Users, Award, MapPin } from 'lucide-react';

interface MemberType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface MemberFunction {
  id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface MemberArea {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export function Stammdaten() {
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [memberFunctions, setMemberFunctions] = useState<MemberFunction[]>([]);
  const [memberAreas, setMemberAreas] = useState<MemberArea[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [activeTab, setActiveTab] = useState<'types' | 'functions' | 'areas'>('types');
  
  // Modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFunctionModal, setShowFunctionModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingType, setEditingType] = useState<MemberType | null>(null);
  const [editingFunction, setEditingFunction] = useState<MemberFunction | null>(null);
  const [editingArea, setEditingArea] = useState<MemberArea | null>(null);

  // Form data
  const [typeForm, setTypeForm] = useState({ name: '', description: '', is_active: true });
  const [functionForm, setFunctionForm] = useState({ name: '', description: '', sort_order: 0, is_active: true });
  const [areaForm, setAreaForm] = useState({ name: '', description: '', is_active: true });

  useEffect(() => {
    fetchMemberTypes();
    fetchMemberFunctions();
    fetchMemberAreas();
  }, []);

  const fetchMemberTypes = async () => {
    try {
      setIsLoadingTypes(true);
      const response = await axios.get('/api/stammdaten/member-types');
      setMemberTypes(response.data);
    } catch (error) {
      console.error('Error fetching member types:', error);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const fetchMemberFunctions = async () => {
    try {
      setIsLoadingFunctions(true);
      const response = await axios.get('/api/stammdaten/member-functions');
      setMemberFunctions(response.data);
    } catch (error) {
      console.error('Error fetching member functions:', error);
    } finally {
      setIsLoadingFunctions(false);
    }
  };

  const fetchMemberAreas = async () => {
    try {
      setIsLoadingAreas(true);
      const response = await axios.get('/api/stammdaten/member-areas/all');
      setMemberAreas(response.data);
    } catch (error) {
      console.error('Error fetching member areas:', error);
    } finally {
      setIsLoadingAreas(false);
    }
  };

  const handleSaveType = async () => {
    try {
      if (editingType) {
        await axios.put(`/api/stammdaten/member-types/${editingType.id}`, typeForm);
      } else {
        await axios.post('/api/stammdaten/member-types', typeForm);
      }
      setShowTypeModal(false);
      setEditingType(null);
      setTypeForm({ name: '', description: '', is_active: true });
      fetchMemberTypes();
    } catch (error) {
      console.error('Error saving member type:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleSaveFunction = async () => {
    try {
      if (editingFunction) {
        await axios.put(`/api/stammdaten/member-functions/${editingFunction.id}`, functionForm);
      } else {
        await axios.post('/api/stammdaten/member-functions', functionForm);
      }
      setShowFunctionModal(false);
      setEditingFunction(null);
      setFunctionForm({ name: '', description: '', sort_order: 0, is_active: true });
      fetchMemberFunctions();
    } catch (error) {
      console.error('Error saving member function:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleSaveArea = async () => {
    try {
      if (editingArea) {
        await axios.put(`/api/stammdaten/member-areas/${editingArea.id}`, areaForm);
      } else {
        await axios.post('/api/stammdaten/member-areas', areaForm);
      }
      setShowAreaModal(false);
      setEditingArea(null);
      setAreaForm({ name: '', description: '', is_active: true });
      fetchMemberAreas();
    } catch (error) {
      console.error('Error saving member area:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleDeleteArea = async (id: number) => {
    if (!confirm('Möchten Sie diesen Bereich wirklich löschen?')) return;
    try {
      await axios.delete(`/api/stammdaten/member-areas/${id}`);
      fetchMemberAreas();
    } catch (error) {
      console.error('Error deleting member area:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm('Möchten Sie diese Mitgliedsart wirklich löschen?')) return;
    try {
      await axios.delete(`/api/stammdaten/member-types/${id}`);
      fetchMemberTypes();
    } catch (error) {
      console.error('Error deleting member type:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleDeleteFunction = async (id: number) => {
    if (!confirm('Möchten Sie diese Funktion wirklich löschen?')) return;
    try {
      await axios.delete(`/api/stammdaten/member-functions/${id}`);
      fetchMemberFunctions();
    } catch (error) {
      console.error('Error deleting member function:', error);
      alert('Fehler beim Löschen');
    }
  };

  const openTypeModal = (type?: MemberType) => {
    if (type) {
      setEditingType(type);
      setTypeForm({ name: type.name, description: type.description, is_active: type.is_active });
    } else {
      setEditingType(null);
      setTypeForm({ name: '', description: '', is_active: true });
    }
    setShowTypeModal(true);
  };

  const openFunctionModal = (func?: MemberFunction) => {
    if (func) {
      setEditingFunction(func);
      setFunctionForm({ name: func.name, description: func.description, sort_order: func.sort_order, is_active: func.is_active });
    } else {
      setEditingFunction(null);
      setFunctionForm({ name: '', description: '', sort_order: 0, is_active: true });
    }
    setShowFunctionModal(true);
  };

  const openAreaModal = (area?: MemberArea) => {
    if (area) {
      setEditingArea(area);
      setAreaForm({ name: area.name, description: area.description, is_active: area.is_active });
    } else {
      setEditingArea(null);
      setAreaForm({ name: '', description: '', is_active: true });
    }
    setShowAreaModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stammdaten</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'types'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Users size={20} />
          Mitgliedsarten
        </button>
        <button
          onClick={() => setActiveTab('functions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'functions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Award size={20} />
          Funktionen
        </button>
        <button
          onClick={() => setActiveTab('areas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'areas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <MapPin size={20} />
          Bereiche
        </button>
      </div>

      {/* Mitgliedsarten */}
      {activeTab === 'types' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mitgliedsarten</h2>
            <button
              onClick={() => openTypeModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Neue Mitgliedsart
            </button>
          </div>

          {isLoadingTypes ? (
            <div className="text-center py-8">Laden...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Beschreibung</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {memberTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{type.name}</td>
                      <td className="px-4 py-3 text-gray-600">{type.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          type.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {type.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openTypeModal(type)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteType(type.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Löschen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Funktionen */}
      {activeTab === 'functions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Funktionen</h2>
            <button
              onClick={() => openFunctionModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Neue Funktion
            </button>
          </div>

          {isLoadingFunctions ? (
            <div className="text-center py-8">Laden...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Beschreibung</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sortierung</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {memberFunctions.map((func) => (
                    <tr key={func.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{func.name}</td>
                      <td className="px-4 py-3 text-gray-600">{func.description}</td>
                      <td className="px-4 py-3">{func.sort_order}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          func.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {func.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openFunctionModal(func)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteFunction(func.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Löschen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mitgliedsart Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingType ? 'Mitgliedsart bearbeiten' : 'Neue Mitgliedsart'}
              </h3>
              <button onClick={() => setShowTypeModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Aktives Mitglied"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Optionale Beschreibung"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="type_active"
                  checked={typeForm.is_active}
                  onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="type_active" className="text-sm text-gray-700">Aktiv</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTypeModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveType}
                disabled={!typeForm.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Funktion Modal */}
      {showFunctionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingFunction ? 'Funktion bearbeiten' : 'Neue Funktion'}
              </h3>
              <button onClick={() => setShowFunctionModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={functionForm.name}
                  onChange={(e) => setFunctionForm({ ...functionForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 1. Vorsitzender"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={functionForm.description}
                  onChange={(e) => setFunctionForm({ ...functionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Optionale Beschreibung"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sortierung</label>
                <input
                  type="number"
                  value={functionForm.sort_order}
                  onChange={(e) => setFunctionForm({ ...functionForm, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="function_active"
                  checked={functionForm.is_active}
                  onChange={(e) => setFunctionForm({ ...functionForm, is_active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="function_active" className="text-sm text-gray-700">Aktiv</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFunctionModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveFunction}
                disabled={!functionForm.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bereiche */}
      {activeTab === 'areas' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bereiche</h2>
            <button
              onClick={() => openAreaModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Neuer Bereich
            </button>
          </div>

          {isLoadingAreas ? (
            <div className="text-center py-8">Laden...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Beschreibung</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {memberAreas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{area.name}</td>
                      <td className="px-4 py-3 text-gray-600">{area.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          area.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {area.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openAreaModal(area)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteArea(area.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Löschen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bereich Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingArea ? 'Bereich bearbeiten' : 'Neuer Bereich'}
              </h3>
              <button onClick={() => setShowAreaModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Marketing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={areaForm.description}
                  onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Optionale Beschreibung"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="area_active"
                  checked={areaForm.is_active}
                  onChange={(e) => setAreaForm({ ...areaForm, is_active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="area_active" className="text-sm text-gray-700">Aktiv</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAreaModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveArea}
                disabled={!areaForm.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
