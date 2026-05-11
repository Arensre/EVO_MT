import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface ImportModule {
  key: string;
  name: string;
  description: string;
  fields: string[];
}

const importModules: ImportModule[] = [
  {
    key: 'members',
    name: 'Mitglieder',
    description: 'Import von Mitgliedern mit Stammdaten',
    fields: ['first_name', 'last_name', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'notes']
  },
  {
    key: 'customers',
    name: 'Kunden',
    description: 'Import von Kunden mit Kontaktdaten',
    fields: ['name', 'type', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes']
  },
  {
    key: 'suppliers',
    name: 'Lieferanten',
    description: 'Import von Lieferanten mit Stammdaten',
    fields: ['name', 'type', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes']
  }
];

export function Importer() {
  const [activeTab, setActiveTab] = useState<'download' | 'upload'>('download');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const downloadTemplate = async (moduleKey: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Nicht angemeldet');
        return;
      }
      
      const response = await axios.get(`/api/import/template/${moduleKey}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleKey}_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      if (error.response?.status === 401) {
        alert('Authentifizierungsfehler - bitte neu anmelden');
      } else {
        alert('Download fehlgeschlagen: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setPreviewData([]);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!uploadFile || !selectedModule) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('module', selectedModule);

    try {
      const response = await axios.post('/api/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreviewData(response.data.preview);
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Vorschau fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!uploadFile || !selectedModule) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('module', selectedModule);

    try {
      const response = await axios.post('/api/import/execute', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(response.data);
      setPreviewData([]);
      setUploadFile(null);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileSpreadsheet className="text-emerald-600" size={32} />
          Import / Export
        </h1>
        <p className="text-gray-600 mt-2">
          Importieren Sie Daten aus CSV-Dateien oder laden Sie Templates herunter.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors ${
              activeTab === 'download'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download size={20} />
            <span className="font-medium">Templates herunterladen</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={20} />
            <span className="font-medium">CSV importieren</span>
          </button>
        </nav>
      </div>

      {/* Download Templates */}
      {activeTab === 'download' && (
        <div className="space-y-4">
          {importModules.map((module) => (
            <div
              key={module.key}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                <p className="text-gray-600">{module.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Felder: {module.fields.join(', ')}
                </div>
              </div>
              <button
                onClick={() => downloadTemplate(module.key)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download size={20} />
                Template herunterladen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload CSV */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Module Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zielmodul wählen</h3>
            <div className="grid grid-cols-3 gap-4">
              {importModules.map((module) => (
                <button
                  key={module.key}
                  onClick={() => setSelectedModule(module.key)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedModule === module.key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm text-gray-500">{module.fields.length} Felder</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          {selectedModule && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CSV-Datei hochladen</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload size={48} className="text-gray-400 mb-4" />
                  <span className="text-gray-600">
                    {uploadFile ? uploadFile.name : 'CSV-Datei hierher ziehen oder klicken'}
                  </span>
                </label>
              </div>

              {uploadFile && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handlePreview}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Laden...' : 'Vorschau anzeigen'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vorschau ({previewData.length} Einträge)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value: any, vIdx) => (
                          <td key={vIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="text-center text-gray-500 mt-4">
                    ... und {previewData.length - 5} weitere
                  </p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  {isLoading ? 'Importiere...' : 'Import durchführen'}
                </button>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle size={24} />
                <div>
                  <h3 className="font-semibold">Import erfolgreich!</h3>
                  <p>
                    {importResult.success} Einträge importiert
                    {importResult.errors > 0 && `, ${importResult.errors} Fehler`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
