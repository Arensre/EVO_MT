import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Calendar, X, Save } from 'lucide-react';

interface MemberHistoryTablesProps {
  memberId: number;
  memberTypes: Array<{ id: number; name: string }>;
  memberFunctions?: Array<{ id: number; name: string; is_active: boolean; sort_order: number }>;
  isEditing: boolean;
}

interface TypeHistoryEntry {
  id: number;
  member_type_id: number;
  type_name: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

interface FunctionHistoryEntry {
  id: number;
  member_function_id: number;
  function_name: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export function MemberHistoryTables({ 
  memberId, 
  memberTypes, 
  memberFunctions = [],
  isEditing 
}: MemberHistoryTablesProps) {
  const queryClient = useQueryClient();
  const [showAddType, setShowAddType] = useState(false);
  const [showAddFunction, setShowAddFunction] = useState(false);

  // Form states for new entries
  const [newTypeForm, setNewTypeForm] = useState({
    member_type_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const [newFunctionForm, setNewFunctionForm] = useState({
    member_function_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  // Fetch type history
  const { data: typeHistory, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['member-type-history', memberId],
    queryFn: async () => {
      const response = await axios.get(`/api/members/${memberId}/type-history`);
      return response.data as TypeHistoryEntry[];
    },
    enabled: !!memberId
  });

  // Fetch function history
  const { data: functionHistory, isLoading: isLoadingFunctions } = useQuery({
    queryKey: ['member-function-history', memberId],
    queryFn: async () => {
      const response = await axios.get(`/api/members/${memberId}/function-history`);
      return response.data as FunctionHistoryEntry[];
    },
    enabled: !!memberId
  });

  // Mutations
  const addTypeMutation = useMutation({
    mutationFn: (data: typeof newTypeForm) => 
      axios.post(`/api/members/${memberId}/type-history`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-type-history', memberId] });
      setShowAddType(false);
      setNewTypeForm({ member_type_id: '', start_date: '', end_date: '', notes: '' });
    }
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id: number) => 
      axios.delete(`/api/members/${memberId}/type-history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-type-history', memberId] });
    }
  });

  const addFunctionMutation = useMutation({
    mutationFn: (data: typeof newFunctionForm) => 
      axios.post(`/api/members/${memberId}/function-history`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-function-history', memberId] });
      setShowAddFunction(false);
      setNewFunctionForm({ member_function_id: '', start_date: '', end_date: '', notes: '' });
    }
  });

  const deleteFunctionMutation = useMutation({
    mutationFn: (id: number) => 
      axios.delete(`/api/members/${memberId}/function-history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-function-history', memberId] });
    }
  });

  const formatDateGerman = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('de-DE');
  };

  if (isLoadingTypes || isLoadingFunctions) {
    return <div className="text-center py-4">Lade Historie...</div>;
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Mitgliedsarten Historie */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            Mitgliedsarten-Historie
          </h3>
          {isEditing && (
            <button
              onClick={() => setShowAddType(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} />
              Hinzufügen
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Add Form */}
          {showAddType && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Neue Mitgliedsart</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsart *</label>
                  <select
                    value={newTypeForm.member_type_id}
                    onChange={(e) => setNewTypeForm({ ...newTypeForm, member_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Bitte wählen --</option>
                    {memberTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                  <input
                    type="date"
                    value={newTypeForm.start_date}
                    onChange={(e) => setNewTypeForm({ ...newTypeForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bis (optional)</label>
                  <input
                    type="date"
                    value={newTypeForm.end_date}
                    onChange={(e) => setNewTypeForm({ ...newTypeForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <input
                    type="text"
                    value={newTypeForm.notes}
                    onChange={(e) => setNewTypeForm({ ...newTypeForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addTypeMutation.mutate(newTypeForm)}
                  disabled={!newTypeForm.member_type_id || !newTypeForm.start_date}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  Speichern
                </button>
                <button
                  onClick={() => setShowAddType(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X size={16} />
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {typeHistory && typeHistory.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Mitgliedsart</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Von</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Bis</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Notizen</th>
                  {isEditing && <th className="text-right py-2 px-4 font-medium text-gray-700">Aktionen</th>}
                </tr>
              </thead>
              <tbody>
                {typeHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{entry.type_name}</td>
                    <td className="py-3 px-4">{formatDateGerman(entry.start_date)}</td>
                    <td className="py-3 px-4">{entry.end_date ? formatDateGerman(entry.end_date) : 'heute'}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.notes || '-'}</td>
                    {isEditing && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTypeMutation.mutate(entry.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-4">Keine Historie vorhanden.</p>
          )}
        </div>
      </div>

      {/* Funktionen Historie */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            Funktions-Historie
          </h3>
          {isEditing && (
            <button
              onClick={() => setShowAddFunction(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} />
              Hinzufügen
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Add Form */}
          {showAddFunction && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Neue Funktion</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funktion *</label>
                  <select
                    value={newFunctionForm.member_function_id}
                    onChange={(e) => setNewFunctionForm({ ...newFunctionForm, member_function_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Bitte wählen --</option>
                    {memberFunctions
                      .filter((f) => f.is_active)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((func) => (
                        <option key={func.id} value={func.id}>{func.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                  <input
                    type="date"
                    value={newFunctionForm.start_date}
                    onChange={(e) => setNewFunctionForm({ ...newFunctionForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bis (optional)</label>
                  <input
                    type="date"
                    value={newFunctionForm.end_date}
                    onChange={(e) => setNewFunctionForm({ ...newFunctionForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <input
                    type="text"
                    value={newFunctionForm.notes}
                    onChange={(e) => setNewFunctionForm({ ...newFunctionForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addFunctionMutation.mutate(newFunctionForm)}
                  disabled={!newFunctionForm.member_function_id || !newFunctionForm.start_date}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  Speichern
                </button>
                <button
                  onClick={() => setShowAddFunction(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X size={16} />
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {functionHistory && functionHistory.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Funktion</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Von</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Bis</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Notizen</th>
                  {isEditing && <th className="text-right py-2 px-4 font-medium text-gray-700">Aktionen</th>}
                </tr>
              </thead>
              <tbody>
                {functionHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{entry.function_name}</td>
                    <td className="py-3 px-4">{formatDateGerman(entry.start_date)}</td>
                    <td className="py-3 px-4">{entry.end_date ? formatDateGerman(entry.end_date) : 'heute'}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.notes || '-'}</td>
                    {isEditing && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteFunctionMutation.mutate(entry.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-4">Keine Historie vorhanden.</p>
          )}
        </div>
      </div>
    </div>
  );
}
