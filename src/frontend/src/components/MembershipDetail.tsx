// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Award, Briefcase, ArrowLeft, BarChart3 } from 'lucide-react';

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

interface MembershipDetailProps {
  member: Member;
  memberTypes: MemberType[];
  memberFunctions: MemberFunction[];
  onBack: () => void;
}

export function MembershipDetail({ member, memberTypes, memberFunctions, onBack }: MembershipDetailProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'types' | 'functions' | 'timeline'>('types');
  
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

  // Inline editing states
  const [editingType, setEditingType] = useState<TypeHistoryEntry | null>(null);
  const [editingFunction, setEditingFunction] = useState<FunctionHistoryEntry | null>(null);

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

  const deleteFunctionMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/members/${member.id}/function-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-function-history', member.id] });
    }
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'heute';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
              activeTab === 'types'
                ? 'border-emerald-600 text-emerald-600'
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
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase size={18} />
            Funktionen
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {functionHistory.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={18} />
            Zeitstrahl
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Types Tab */}
        {activeTab === 'types' && (
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
                      {memberTypes.map((type) => (
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
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => addTypeMutation.mutate(newType)}
                      disabled={!newType.member_type_id || !newType.start_date}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {isLoadingTypes ? (
              <div className="p-8 text-center text-gray-500">Laden...</div>
            ) : typeHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Keine Einträge vorhanden.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Mitgliedsart</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Von</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Bis</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-700">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {typeHistory.map((entry: TypeHistoryEntry) => (
                    <tr key={entry.id} className="border-t border-gray-100">
                      <td className="py-3 px-6">{entry.type_name}</td>
                      <td className="py-3 px-6">{formatDate(entry.start_date)}</td>
                      <td className="py-3 px-6">{formatDate(entry.end_date)}</td>
                      <td className="py-3 px-6 text-right">
                        <button
                          onClick={() => deleteTypeMutation.mutate(entry.id)}
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
        )}

        {/* Functions Tab */}
        {activeTab === 'functions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Funktionen-Historie</h3>
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
                      {memberFunctions.map((func) => (
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
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => addFunctionMutation.mutate(newFunction)}
                      disabled={!newFunction.member_function_id || !newFunction.start_date}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {isLoadingFunctions ? (
              <div className="p-8 text-center text-gray-500">Laden...</div>
            ) : functionHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Keine Einträge vorhanden.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Funktion</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Von</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Bis</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-700">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {functionHistory.map((entry: FunctionHistoryEntry) => (
                    <tr key={entry.id} className="border-t border-gray-100">
                      <td className="py-3 px-6">{entry.function_name}</td>
                      <td className="py-3 px-6">{formatDate(entry.start_date)}</td>
                      <td className="py-3 px-6">{formatDate(entry.end_date)}</td>
                      <td className="py-3 px-6 text-right">
                        <button
                          onClick={() => deleteFunctionMutation.mutate(entry.id)}
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
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <TimelineView 
            typeHistory={typeHistory} 
            functionHistory={functionHistory}
            memberTypes={memberTypes}
            memberFunctions={memberFunctions}
          />
        )}
      </div>
    </div>
  );
}

// Timeline/Gantt Chart Component
interface TimelineViewProps {
  typeHistory: TypeHistoryEntry[];
  functionHistory: FunctionHistoryEntry[];
  memberTypes: MemberType[];
  memberFunctions: MemberFunction[];
}

function TimelineView({ typeHistory, functionHistory, memberTypes, memberFunctions }: TimelineViewProps) {
  // Combine all entries with their types
  const allEntries = [
    ...typeHistory.map(entry => ({
      ...entry,
      category: 'type' as const,
      name: entry.type_name || memberTypes.find(t => t.id === entry.member_type_id)?.name || 'Unbekannt',
      color: 'bg-blue-500'
    })),
    ...functionHistory.map(entry => ({
      ...entry,
      category: 'function' as const,
      name: entry.function_name || memberFunctions.find(f => f.id === entry.member_function_id)?.name || 'Unbekannt',
      color: 'bg-amber-500'
    }))
  ].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Find date range
  const dates = allEntries.flatMap(e => [new Date(e.start_date), e.end_date ? new Date(e.end_date) : new Date()]);
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
  
  // Add padding
  const rangeStart = new Date(minDate);
  rangeStart.setMonth(rangeStart.getMonth() - 3);
  const rangeEnd = new Date(maxDate);
  rangeEnd.setMonth(rangeEnd.getMonth() + 3);
  
  const totalRange = rangeEnd.getTime() - rangeStart.getTime();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'heute';
    return new Date(dateString).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
  };

  const getPosition = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    const left = ((startTime - rangeStart.getTime()) / totalRange) * 100;
    const width = ((endTime - startTime) / totalRange) * 100;
    return { left: Math.max(0, left), width: Math.max(2, width) };
  };

  // Generate year markers - dynamic step based on range
  const yearsRange = rangeEnd.getFullYear() - rangeStart.getFullYear();
  const yearStep = yearsRange >= 20 ? 5 : 1;
  const yearMarkers = [];
  const currentYear = new Date(rangeStart);
  currentYear.setMonth(0, 1);
  // Round to nearest step
  const startYear = Math.ceil(currentYear.getFullYear() / yearStep) * yearStep;
  currentYear.setFullYear(startYear);
  while (currentYear <= rangeEnd) {
    yearMarkers.push(new Date(currentYear));
    currentYear.setFullYear(currentYear.getFullYear() + yearStep);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Mitgliedschafts-Zeitstrahl</h3>
      
      {allEntries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Keine Einträge vorhanden.</div>
      ) : (
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-sm text-gray-600">Mitgliedsart</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-sm text-gray-600">Funktion</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Year markers */}
            <div className="relative h-8 border-b border-gray-200 mb-4 ml-32">
              {yearMarkers.map((year, idx) => {
                const pos = ((year.getTime() - rangeStart.getTime()) / totalRange) * 100;
                return (
                  <div key={idx} className="absolute transform -translate-x-1/2" style={{ left: `${pos}%` }}>
                    <div className="h-2 w-px bg-gray-400 mx-auto" />
                    <span className="text-xs text-gray-500">{year.getFullYear()}</span>
                  </div>
                );
              })}
            </div>

            {/* Entries */}
            <div className="space-y-3">
              {(['type', 'function'] as const).map(category => {
                const categoryEntries = allEntries.filter(e => e.category === category);
                if (categoryEntries.length === 0) return null;
                
                return categoryEntries.map((entry, idx) => {
                  const { left, width } = getPosition(entry.start_date, entry.end_date);
                  return (
                    <div key={`${category}-${entry.id || idx}`} className="relative h-10">
                      <div className="absolute inset-y-0 left-0 w-32 flex items-center pr-2">
                        <span className="text-sm font-medium text-gray-700 truncate">{entry.name}</span>
                      </div>
                      <div className="absolute inset-y-0 left-32 right-0">
                        <div
                          className={`absolute h-6 top-2 rounded ${entry.color} opacity-80 hover:opacity-100 cursor-pointer transition-opacity`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${entry.name}: ${formatDate(entry.start_date)} - ${formatDate(entry.end_date)}`}
                        >
                          <span className="text-xs text-white px-2 truncate block leading-6">{entry.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Zusammenfassung</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Mitgliedsarten:</span>{' '}
                <span className="font-medium">{typeHistory.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Funktionen:</span>{' '}
                <span className="font-medium">{functionHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
