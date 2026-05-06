import { useState, useRef, useEffect } from 'react';
import { Image, Upload, X, Check, Monitor } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function GeneralSettings() {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current background on mount
  useEffect(() => {
    fetchCurrentBackground();
  }, []);

  const fetchCurrentBackground = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/login-background`);
      if (response.data?.url) {
        setSavedUrl(response.data.url);
      }
    } catch (error) {
      // No background set yet, that's okay
      console.log('No background set');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Bitte wählen Sie ein Bild (JPG, PNG, GIF)' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Das Bild darf maximal 5MB groß sein' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setUploading(true);
    setMessage(null);

    try {
      // Convert base64 to file
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'login-background.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('background', file);

      await axios.post(`${API_URL}/settings/login-background`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSavedUrl(previewUrl);
      setMessage({ type: 'success', text: 'Hintergrund erfolgreich gespeichert' });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern des Hintergrunds' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Möchten Sie den Hintergrund wirklich entfernen?')) return;

    try {
      await axios.delete(`${API_URL}/settings/login-background`);
      setSavedUrl(null);
      setPreviewUrl(null);
      setMessage({ type: 'success', text: 'Hintergrund entfernt' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Entfernen' });
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Monitor className="text-blue-600" size={28} />
          Allgemeine Einstellungen
        </h1>
        <p className="text-gray-600 mt-2">
          Verwalten Sie globale Einstellungen für die Anwendung.
        </p>
      </div>

      {/* Login Background Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Login-Hintergrund</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Laden Sie ein Bild hoch, das auf dem Anmeldebildschirm als Hintergrund angezeigt wird.
          Empfohlene Größe: 1920x1080 Pixel oder größer. Maximale Dateigröße: 5MB.
        </p>

        {/* Current/Saved Background */}
        {savedUrl && !previewUrl && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Aktueller Hintergrund:</h3>
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={savedUrl}
                alt="Aktueller Login-Hintergrund"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <X size={16} />
                  Entfernen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview of new upload */}
        {previewUrl && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Vorschau:</h3>
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={previewUrl}
                alt="Vorschau"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Übernehmen
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
                >
                  <X size={16} />
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {!previewUrl && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Upload className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-gray-600 mb-1">
              Klicken Sie hier oder ziehen Sie ein Bild hinein
            </p>
            <p className="text-sm text-gray-400">
              JPG, PNG, GIF • Max. 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
