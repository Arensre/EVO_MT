import { useState, useEffect } from 'react';
import { CalendarSettings } from './CalendarSettings';
import { Settings, Users, Building2, Truck, Calendar as CalendarIcon, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Plus, X, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface ModuleSetting {
  id: number;
  module_name: string;
  is_enabled: boolean;
  required_fields: Record<string, boolean>;
  allow_multiple_types?: boolean;
  allow_multiple_functions?: boolean;
  created_at: string;
  updated_at: string;
}

interface FieldDefinition {
  key: string;
  label: string;
  predefined?: boolean; // Cannot be removed, always shown
}

const modules = [
  { key: 'members', name: 'Mitglieder', icon: Users, description: 'Mitgliederverwaltung und Funktionen' },
  { key: 'customers', name: 'Kunden', icon: Building2, description: 'Kundenstamm und Ansprechpartner' },
  { key: 'suppliers', name: 'Lieferanten', icon: Truck, description: 'Lieferantenverwaltung' },
  { key: 'calendar', name: 'Kalender', icon: CalendarIcon, description: 'Kalender und Terminkategorien' },
];

// Field definitions per module
const fieldDefinitions: Record<string, FieldDefinition[]> = {
  calendar: [],
  members: [
    { key: 'first_name', label: 'Vorname', predefined: true },
    { key: 'last_name', label: 'Nachname', predefined: true },
    { key: 'email', label: 'E-Mail' },
    { key: 'phone', label: 'Telefon' },
    { key: 'address', label: 'Straße' },
    { key: 'postal_code', label: 'PLZ' },
    { key: 'city', label: 'Ort' },
    { key: 'country', label: 'Land' },
    { key: 'notes', label: 'Notizen' },
  ],
  customers: [
    { key: 'name', label: 'Name', predefined: true },
    { key: 'type', label: 'Typ', predefined: true },
    { key: 'email', label: 'E-Mail' },
    { key: 'phone', label: 'Telefon' },
    { key: 'address', label: 'Straße' },
    { key: 'postal_code', label: 'PLZ' },
    { key: 'city', label: 'Ort' },
    { key: 'country', label: 'Land' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notizen' },
  ],
  suppliers: [
    { key: 'name', label: 'Name', predefined: true },
    { key: 'type', label: 'Typ', predefined: true },
    { key: 'email', label: 'E-Mail' },
    { key: 'phone', label: 'Telefon' },
    { key: 'address', label: 'Straße' },
    { key: 'postal_code', label: 'PLZ' },
    { key: 'city', label: 'Ort' },
    { key: 'country', label: 'Land' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notizen' },
  ],
};

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
  const [showRequiredFields, setShowRequiredFields] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
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
      data: {
        is_enabled: newEnabled,
        required_fields: currentSetting.required_fields,
        allow_multiple_types: currentSetting.allow_multiple_types,
        allow_multiple_functions: currentSetting.allow_multiple_functions,
      },
    });
  };

  const handleToggleSetting = (settingName: 'allow_multiple_types' | 'allow_multiple_functions') => {
    const currentSetting = localSettings['members'];
    if (!currentSetting) return;

    const newValue = !currentSetting[settingName];
    setLocalSettings({
      ...localSettings,
      members: { ...currentSetting, [settingName]: newValue },
    });

    updateMutation.mutate({
      moduleName: 'members',
      data: {
        is_enabled: currentSetting.is_enabled,
        required_fields: currentSetting.required_fields,
        allow_multiple_types: settingName === 'allow_multiple_types' ? newValue : currentSetting.allow_multiple_types,
        allow_multiple_functions: settingName === 'allow_multiple_functions' ? newValue : currentSetting.allow_multiple_functions,
      },
    });
  };

  const handleAddField = (moduleKey: string, fieldKey: string) => {
    const currentSetting = localSettings[moduleKey];
    if (!currentSetting) return;

    // Feld wird als Pflichtfeld hinzugefügt (true)
    const newRequiredFields = {
      ...currentSetting.required_fields,
      [fieldKey]: true,
    };

    setLocalSettings({
      ...localSettings,
      [moduleKey]: { ...currentSetting, required_fields: newRequiredFields },
    });

    updateMutation.mutate({
      moduleName: moduleKey,
      data: {
        is_enabled: currentSetting.is_enabled,
        required_fields: newRequiredFields,
        allow_multiple_types: currentSetting.allow_multiple_types,
        allow_multiple_functions: currentSetting.allow_multiple_functions,
      },
    });

    setShowAddField(false);
  };

  const handleRemoveField = (moduleKey: string, fieldKey: string) => {
    const currentSetting = localSettings[moduleKey];
    if (!currentSetting) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [fieldKey]: _, ...remainingFields } = currentSetting.required_fields;

    setLocalSettings({
      ...localSettings,
      [moduleKey]: { ...currentSetting, required_fields: remainingFields },
    });

    updateMutation.mutate({
      moduleName: moduleKey,
      data: {
        is_enabled: currentSetting.is_enabled,
        required_fields: remainingFields,
        allow_multiple_types: currentSetting.allow_multiple_types,
        allow_multiple_functions: currentSetting.allow_multiple_functions,
      },
    });
  };

  // Calendar settings view
  if (activeTab === 'calendar') {
    return (
      <div className="max-w-6xl mx-auto p-6 overflow-y-auto max-h-screen">
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
                  {setting && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        setting.is_enabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {setting.is_enabled ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        <CalendarSettings />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const activeModule = modules.find((m) => m.key === activeTab);
  const currentSetting = localSettings[activeTab];
  const allFields = fieldDefinitions[activeTab] || [];

  // Separate fields
  const predefinedFields = allFields.filter((f) => f.predefined);
  const activeFields = allFields.filter(
    (f) => !f.predefined && currentSetting?.required_fields.hasOwnProperty(f.key)
  );
  const availableFields = allFields.filter(
    (f) => !f.predefined && !currentSetting?.required_fields.hasOwnProperty(f.key)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 overflow-y-auto max-h-screen">
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

          {/* Mitglieder-spezifische Einstellungen */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mitglieder-Einstellungen</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Mehrere Mitgliedsarten</span>
                    <p className="text-sm text-gray-600">Erlaubt die Zuweisung mehrerer Mitgliedsarten gleichzeitig</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('allow_multiple_types')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentSetting.allow_multiple_types ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentSetting.allow_multiple_types ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Mehrere Funktionen</span>
                    <p className="text-sm text-gray-600">Erlaubt die Zuweisung mehrerer Funktionen gleichzeitig</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('allow_multiple_functions')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentSetting.allow_multiple_functions ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentSetting.allow_multiple_functions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Required Fields - Collapsible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowRequiredFields(!showRequiredFields)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pflichtfelder</h3>
                <p className="text-gray-600 mt-1">
                  Definieren Sie welche Felder beim Erstellen eines neuen Eintrags Pflichtfelder sind.
                </p>
              </div>
              <div className="text-emerald-600">
                {showRequiredFields ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </button>

            {showRequiredFields && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="space-y-4 pt-6">
                  {/* Predefined Fields (always shown, locked) */}
                  {predefinedFields.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Immer erforderlich
                      </h4>
                      <div className="space-y-2">
                        {predefinedFields.map((field) => (
                          <div
                            key={field.key}
                            className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">{field.label}</span>
                              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                Pflichtfeld
                              </span>
                            </div>
                            <div className="text-gray-400">
                              <ToggleRight size={20} className="text-amber-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Fields - always required */}
                  {activeFields.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Zusätzliche Pflichtfelder
                      </h4>
                      <div className="space-y-2">
                        {activeFields.map((field) => (
                          <div
                            key={field.key}
                            className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-lg group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">{field.label}</span>
                              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Pflichtfeld
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveField(activeTab, field.key)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Feld entfernen"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Field Button */}
                  {availableFields.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      {!showAddField ? (
                        <button
                          onClick={() => setShowAddField(true)}
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <Plus size={20} />
                          <span>Feld hinzufügen</span>
                        </button>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Verfügbare Felder:</h4>
                          <div className="flex flex-wrap gap-2">
                            {availableFields.map((field) => (
                              <button
                                key={field.key}
                                onClick={() => handleAddField(activeTab, field.key)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                              >
                                <Plus size={14} />
                                {field.label}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setShowAddField(false)}
                            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                          >
                            Abbrechen
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeFields.length === 0 && availableFields.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Keine zusätzlichen Felder verfügbar.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
