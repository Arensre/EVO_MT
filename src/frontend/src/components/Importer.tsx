import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

interface ImportModule {
  key: string;
  name: string;
  description: string;
  fields: string[];
}

interface PreviewResponse {
  preview: any[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
  headers: string[];
}

interface ImportResponse {
  success: number;
  errors: number;
  message: string;
  importErrors?: Array<{
    row: any;
    error: string;
  }>;
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
  const [fileContent, setFileContent] = useState<string>('');
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setPreviewData(null);
      setImportResult(null);
      setError('');
      
      try {
        const base64 = await readFileAsBase64(file);
        setFileContent(base64);
      } catch (err) {
        setError('Fehler beim Lesen der Datei');
      }
    }
  };

  const handlePreview = async () => {
    if (!fileContent || !selectedModule) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<PreviewResponse>('/api/import/preview', {
        module: selectedModule,
        fileContent: fileContent
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setPreviewData(response.data);
    } catch (error: any) {
      console.error('Preview failed:', error);
      setError(error.response?.data?.error || 'Vorschau fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!fileContent || !selectedModule) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<ImportResponse>('/api/import/execute', {
        module: selectedModule,
        fileContent: fileContent
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setImportResult(response.data);
      setPreviewData(null);
      setUploadFile(null);
      setFileContent('');
    } catch (error: any) {
      console.error('Import failed:', error);
      setError(error.response?.data?.error || 'Import fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setUploadFile(null);
    setFileContent('');
    setPreviewData(null);
    setImportResult(null);
    setError('');
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

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
                  onClick={() => { setSelectedModule(module.key); setPreviewData(null); }}
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
              
              {!uploadFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="csv-upload"
                  />
                  
                  <div className="flex flex-col items-center pointer-events-none">
                    <Upload size={48} className="text-gray-400 mb-4" />
                    <span className="text-gray-600">
                      CSV-Datei hierher ziehen oder klicken zum Auswählen
                    </span>
                    <span className="text-sm text-gray-400 mt-2">
                      Nur .csv Dateien mit Semikolon-Trennung
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="text-emerald-600" size={24} />
                      <div>
                        <p className="font-medium">{uploadFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {!previewData && !importResult && (
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
            </div>
          )}

          {/* Preview */}
          {previewData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Vorschau
                </h3>
                <div className="text-sm text-gray-600">
                  <span className="text-emerald-600 font-medium">{previewData.validRows} gültig</span>
                  {previewData.errorRows > 0 && (
                    <>, <span className="text-red-600 font-medium">{previewData.errorRows} mit Fehlern</span></>
                  )}
                  {' '}von {previewData.totalRows} Zeilen
                </div>
              </div>
              
              {previewData.preview.length > 0 && (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {previewData.headers.map((key) => (
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
                      {previewData.preview.map((row, idx) => (
                        <tr key={idx}>
                          {previewData.headers.map((key) => (
                            <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row[key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.totalRows > previewData.preview.length && (
                    <p className="text-center text-gray-500 mt-4">
                      ... und {previewData.totalRows - previewData.preview.length} weitere Zeilen
                    </p>
                  )}
                </div>
              )}

              {/* Errors */}
              {previewData.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-red-800 mb-2">Fehler gefunden:</h4>
                  <ul className="space-y-2 text-sm text-red-700">
                    {previewData.errors.map((err, idx) => (
                      <li key={idx}>
                        Zeile {err.row}: {err.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Import Button */}
              {previewData.validRows > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    {isLoading ? 'Importiere...' : `${previewData.validRows} Einträge importieren`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`rounded-lg border p-6 ${
              importResult.errors === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                {importResult.errors === 0 ? (
                  <CheckCircle className="text-emerald-600" size={24} />
                ) : (
                  <AlertCircle className="text-amber-600" size={24} />
                )}
                <div>
                  <h3 className="font-semibold">
                    {importResult.errors === 0 ? 'Import erfolgreich!' : 'Import teilweise erfolgreich'}
                  </h3>
                  <p className="text-gray-600">
                    {importResult.success} von {importResult.success + importResult.errors} Einträgen importiert
                  </p>
                </div>
              </div>

              {importResult.importErrors && importResult.importErrors.length > 0 && (
                <div className="mt-4 text-sm text-amber-800">
                  <p className="font-medium mb-2">Fehler beim Import:</p>
                  <ul className="space-y-1">
                    {importResult.importErrors.map((err, idx) => (
                      <li key={idx}>{err.error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={clearFile}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Neue Datei importieren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
