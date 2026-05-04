// @ts-nocheck
import { useState } from 'react';
// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Award, Briefcase, Save, X, ArrowLeft } from 'lucide-react';

// @ts-nocheck
const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.125:3001/api';

interface Member {
  id: number;
  member_number: string;
  first_name: string;
  last_name: string;
}

interface MemberType {
  id: number;
  name: string;
}

interface MemberFunction {
  id: number;
  name: string;
  is_active: boolean;
  sort_order: number;
}

interface MembershipDetailProps {
  member: Member;
  memberTypes: MemberType[];
  memberFunctions: MemberFunction[];
  onBack: () => void;
}

export function MembershipDetail({ member, memberTypes, memberFunctions, onBack }: MembershipDetailProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'types' | 'functions'>('types');
  
  const [showAddType, setShowAddType] = useState(false);
  const [showAddFunction, setShowAddFunction] = useState(false);
  
  const [newType, setNewType] = useState({
    member_type_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  
  const [newFunction, setNewFunction] = useState({
    member_function_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const { data: typeHistory = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['member-type-history', member.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/members/${member.id}/type-history`);
      return response.data;
    }
  });

  const { data: functionHistory = [], isLoading: isLoadingFunctions } = useQuery({
    queryKey: ['member-function-history', member.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/members/${member.id}/function-history`);
      return response.data;
    }
  });

  const addTypeMutation = useMutation({
    mutationFn: async (data: typeof newType) => {
      await axios.post(`${API_URL}/members/${member.id}/type-history`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-type-history', member.id] });
      setShowAddType(false);
      setNewType({ member_type_id: '', start_date: '', end_date: '', notes: '' });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Fehler beim Hinzufügen');
    }
  });

  const deleteTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/members/${member.id}/type-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-type-history', member.id] });
    }
  });

  const addFunctionMutation = useMutation({
    mutationFn: async (data: typeof newFunction) => {
      await axios.post(`${API_URL}/members/${member.id}/function-history`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-function-history', member.id] });
      setShowAddFunction(false);
      setNewFunction({ member_function_id: '', start_date: '', end_date: '', notes: '' });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Fehler beim Hinzufügen');
    }
  });

  const deleteFunctionMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/members/${member.id}/function-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-function-history', member.id] });
    }
  });

  const formatDateGerman = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-medium">
                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-sm text-gray-500">{member.member_number}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
              activeTab === 'types'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award size={18} />
            Mitgliedsarten
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {typeHistory.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('functions')}
            className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
              activeTab === 'functions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase size={18} />
            Funktionen
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {functionHistory.length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'types' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Mitgliedsarten-Historie</h3>
              <button
                onClick={() => setShowAddType(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Hinzufügen
              </button>
            </div>
            
            {showAddType && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Neue Mitgliedsart</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsart *</label>
                    <select
                      value={newType.member_type_id}
                      onChange={(e) => setNewType({ ...newType, member_type_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">-- Wählen --</option>
                      {memberTypes.map((type: MemberType) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                    <input
                      type="date"
                      value={newType.start_date}
                      onChange={(e) => setNewType({ ...newType, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bis (optional)</label>
                    <input
                      type="date"
                      value={newType.end_date}
                      onChange={(e) => setNewType({ ...newType, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                    <input
                      type="text"
                      value={newType.notes}
                      onChange={(e) => setNewType({ ...newType, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => addTypeMutation.mutate(newType)}
                    disabled={!newType.member_type_id || !newType.start_date || addTypeMutation.isPending}
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
            
            <div className="p-6">
              {isLoadingTypes ? (
                <div className="text-center py-8">Laden...</div>
              ) : typeHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto text-gray-300 mb-4" />
                  <p>Noch keine Mitgliedsarten vorhanden.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Mitgliedsart</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Von</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Bis</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Notizen</th>
                      <th className="text-right py-2 px-4 font-medium text-gray-700">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeHistory.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{entry.type_name}</td>
                        <td className="py-3 px-4">{formatDateGerman(entry.start_date)}</td>
                        <td className="py-3 px-4">{entry.end_date ? formatDateGerman(entry.end_date) : 'heute'}</td>
                        <td className="py-3 px-4 text-gray-600">{entry.notes || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteTypeMutation.mutate(entry.id)}
                            disabled={deleteTypeMutation.isPending}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Funktions-Historie</h3>
              <button
                onClick={() => setShowAddFunction(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Hinzufügen
              </button>
            </div>
            
            {showAddFunction && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Neue Funktion</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funktion *</label>
                    <select
                      value={newFunction.member_function_id}
                      onChange={(e) => setNewFunction({ ...newFunction, member_function_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">-- Wählen --</option>
                      {memberFunctions
                        .filter((f: MemberFunction) => f.is_active)
                        .sort((a: MemberFunction, b: MemberFunction) => a.sort_order - b.sort_order)
                        .map((func: MemberFunction) => (
                          <option key={func.id} value={func.id}>{func.name}</option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                    <input
                      type="date"
                      value={newFunction.start_date}
                      onChange={(e) => setNewFunction({ ...newFunction, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bis (optional)</label>
                    <input
                      type="date"
                      value={newFunction.end_date}
                      onChange={(e) => setNewFunction({ ...newFunction, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                    <input
                      type="text"
                      value={newFunction.notes}
                      onChange={(e) => setNewFunction({ ...newFunction, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => addFunctionMutation.mutate(newFunction)}
                    disabled={!newFunction.member_function_id || !newFunction.start_date || addFunctionMutation.isPending}
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
            
            <div className="p-6">
              {isLoadingFunctions ? (
                <div className="text-center py-8">Laden...</div>
              ) : functionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                  <p>Noch keine Funktionen vorhanden.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Funktion</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Von</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Bis</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Notizen</th>
                      <th className="text-right py-2 px-4 font-medium text-gray-700">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {functionHistory.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{entry.function_name}</td>
                        <td className="py-3 px-4">{formatDateGerman(entry.start_date)}</td>
                        <td className="py-3 px-4">{entry.end_date ? formatDateGerman(entry.end_date) : 'heute'}</td>
                        <td className="py-3 px-4 text-gray-600">{entry.notes || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteFunctionMutation.mutate(entry.id)}
                            disabled={deleteFunctionMutation.isPending}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
