import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, User } from 'lucide-react';
import axios from 'axios';

interface AvatarUploadProps {
  userId: number;
  currentAvatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  onAvatarChange?: (newAvatarUrl: string | null) => void;
}

export function AvatarUpload({ 
  userId, 
  currentAvatarUrl, 
  firstName = '', 
  lastName = '',
  onAvatarChange 
}: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate initials for placeholder
  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Handle file validation
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      setError('Nur JPEG und PNG Bilder sind erlaubt');
      return false;
    }

    if (file.size > maxSize) {
      setError('Bild darf maximal 2MB groß sein');
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    if (!validateFile(file)) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] && !previewUrl) {
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`/api/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPreviewUrl(null);
      onAvatarChange?.(response.data.avatarUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Hochladen');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete avatar
  const handleDelete = async () => {
    if (!currentAvatarUrl && !previewUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      await axios.delete(`/api/users/${userId}/avatar`);
      setPreviewUrl(null);
      onAvatarChange?.(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Löschen');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel preview
  const handleCancel = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine which image to show
  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Avatar display */}
      <div className="flex items-center gap-4">
        <div 
          className={`relative w-24 h-24 rounded-full overflow-hidden border-4 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          } transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                {getInitials()}
              </span>
            </div>
          )}

          {/* Upload overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2">
          {/* Upload button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="image/jpeg,image/png"
            className="hidden"
            id="avatar-upload"
          />
          
          {!previewUrl && (
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
            >
              <Upload size={16} />
              {currentAvatarUrl ? 'Avatar ändern' : 'Avatar hochladen'}
            </label>
          )}

          {/* Preview actions */}
          {previewUrl && (
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Speichern
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                <X size={16} />
                Abbrechen
              </button>
            </div>
          )}

          {/* Delete button */}
          {(currentAvatarUrl || previewUrl) && !isUploading && (
            <button
              onClick={handleDelete}
              disabled={isUploading}
              className="block text-red-600 hover:text-red-700 text-sm transition-colors"
            >
              Avatar entfernen
            </button>
          )}
        </div>
      </div>

      {/* Drag and drop hint */}
      {!previewUrl && (
        <p className="text-xs text-gray-500">
          Ziehen Sie ein Bild hierher oder klicken Sie auf "Avatar hochladen". 
          Unterstützte Formate: JPEG, PNG. Maximal 2MB.
        </p>
      )}
    </div>
  );
}
