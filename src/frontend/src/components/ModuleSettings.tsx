import { useState, useEffect } from 'react';
import { Settings, Users, Building2, Truck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface ModuleSetting {
  id: number;
  module_name: string;
  is_enabled: boolean;
  required_fields: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

const modules = [
  { key: 'members', name: 'Mitglieder', icon: Users, description: 'Mitgliederverwaltung und Funktionen' },
  { key: 'customers', name: 'Kunden', icon: Building2, description: 'Kundenstamm und Ansprechpartner' },
  { key: 'suppliers', name: 'Lieferanten', icon: Truck, description: 'Lieferantenverwaltung' },
];

// API functions
const fetchModuleSettings = async (): Promise<ModuleSetting[]> => {
  const response = await axios.get('/api/module-settings');
  return response.data;
};

const updateModuleSetting = async ({ moduleName, data }: { moduleName: string; data: Partial<ModuleSetting> }) => {
  const response = await axios.put(`/api/module-settings/${moduleName}`, data);
  return response.data;
};

export function ModuleSettings() {
  const [activeTab, setActiveTab] = useState('members');
  const [localSettings, setLocalSettings] = useState<Record<string, ModuleSetting>>({});
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['module-settings'],
    queryFn: fetchModuleSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateModuleSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-settings'] });
    },
  });

  useEffect(() => {
    if (settings) {
      const settingsMap: Record<string, ModuleSetting> = {};
      settings.forEach((s) => {
        settingsMap[s.module_name] = s;
      });
      setLocalSettings(settingsMap);
    }
  }, [settings]);

  const handleToggleModule = (moduleKey: string) => {
    const currentSetting = localSettings[moduleKey];
    if (!currentSetting) return;

    const newEnabled = !currentSetting.is_enabled;
    setLocalSettings({
      ...localSettings,
      [moduleKey]: { ...currentSetting, is_enabled: newEnabled },
    });

    updateMutation.mutate({
      moduleName: moduleKey,
      data: { is_enabled: newEnabled, required_fields: currentSetting.required_fields },
    });
  };

  const handleToggleRequiredField = (moduleKey: string, field: string) => {
    const currentSetting = localSettings[moduleKey];
    if (!currentSetting) return;

    const newRequiredFields = {
      ...currentSetting.required_fields,
      [field]: !currentSetting.required_fields[field],
    };

    setLocalSettings({
      ...localSettings,
      [moduleKey]: { ...currentSetting, required_fields: newRequiredFields },
    });

    updateMutation.mutate({
      moduleName: moduleKey,
      data: { is_enabled: currentSetting.is_enabled, required_fields: newRequiredFields },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const activeModule = modules.find((m) => m.key === activeTab);
  const currentSetting = localSettings[activeTab];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="text-emerald-600" size={32} />
          Moduleinstellungen
        </h1>
        <p className="text-gray-600 mt-2">
          Verwalten Sie die Aktivierung und Pflichtfelder für jedes Modul.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeTab === module.key;
            const setting = localSettings[module.key];

            return (
              <button
                key={module.key}
                onClick={() => setActiveTab(module.key)}
                className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{module.name}</span>
                {setting?.is_enabled && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                    Aktiv
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeModule && currentSetting && (
        <div className="space-y-6">
          {/* Module Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <activeModule.icon size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{activeModule.name}</h2>
                  <p className="text-gray-600">{activeModule.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleModule(activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentSetting.is_enabled
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {currentSetting.is_enabled ? (
                  <>
                    <ToggleRight size={24} />
                    <span>Modul aktiv</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} />
                    <span>Modul inaktiv</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Required Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pflichtfelder</h3>
            <p className="text-gray-600 mb-6">
              Definieren Sie welche Felder beim Erstellen eines neuen Eintrags Pflichtfelder sind.
            </p>

            <div className="space-y-3">
              {getFieldsForModule(activeTab).map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-900">{field.label}</span>
                    <span className="text-gray-500 text-sm ml-2">({field.key})</span>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm text-gray-600">
                      {currentSetting.required_fields[field.key] ? 'Pflichtfeld' : 'Optional'}
                    </span>
                    <button
                      onClick={() => handleToggleRequiredField(activeTab, field.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        currentSetting.required_fields[field.key]
                          ? 'bg-emerald-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          currentSetting.required_fields[field.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFieldsForModule(moduleKey: string): Array<{ key: string; label: string }> {
  switch (moduleKey) {
    case 'members':
      return [
        { key: 'first_name', label: 'Vorname' },
        { key: 'last_name', label: 'Nachname' },
        { key: 'email', label: 'E-Mail' },
        { key: 'phone', label: 'Telefon' },
        { key: 'mobile', label: 'Mobil' },
        { key: 'street', label: 'Straße' },
        { key: 'postal_code', label: 'PLZ' },
        { key: 'city', label: 'Ort' },
        { key: 'birth_date', label: 'Geburtsdatum' },
        { key: 'member_type_id', label: 'Mitgliedsart' },
        { key: 'entry_date', label: 'Eintrittsdatum' },
        { key: 'profession', label: 'Beruf' },
        { key: 'notes', label: 'Notizen' },
      ];
    case 'customers':
      return [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'E-Mail' },
        { key: 'phone', label: 'Telefon' },
        { key: 'street', label: 'Straße' },
        { key: 'postal_code', label: 'PLZ' },
        { key: 'city', label: 'Ort' },
        { key: 'tax_id', label: 'USt-IdNr.' },
        { key: 'notes', label: 'Notizen' },
      ];
    case 'suppliers':
      return [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'E-Mail' },
        { key: 'phone', label: 'Telefon' },
        { key: 'street', label: 'Straße' },
        { key: 'postal_code', label: 'PLZ' },
        { key: 'city', label: 'Ort' },
        { key: 'contact_person', label: 'Ansprechpartner' },
        { key: 'notes', label: 'Notizen' },
      ];
    default:
      return [];
  }
}
