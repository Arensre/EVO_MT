import { useState, useCallback } from 'react';
import { X, AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  details?: string;
  source: 'frontend' | 'backend';
  type: 'error' | 'warning';
}

// Global error log state (singleton pattern for simplicity)
let globalErrorLog: ErrorLogEntry[] = [];
let errorListeners: (() => void)[] = [];

export function addErrorLog(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>) {
  const newEntry: ErrorLogEntry = {
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };
  globalErrorLog = [newEntry, ...globalErrorLog].slice(0, 50); // Keep last 50
  errorListeners.forEach(listener => listener());
}

export function clearErrorLog() {
  globalErrorLog = [];
  errorListeners.forEach(listener => listener());
}

export function getErrorLog() {
  return [...globalErrorLog];
}

export function subscribeToErrors(callback: () => void) {
  errorListeners.push(callback);
  return () => {
    errorListeners = errorListeners.filter(l => l !== callback);
  };
}

// Hook to use error log in components
export function useErrorLog() {
  const [errors, setErrors] = useState<ErrorLogEntry[]>(globalErrorLog);
  const [hasUnread, setHasUnread] = useState(globalErrorLog.length > 0);

  const refresh = useCallback(() => {
    setErrors([...globalErrorLog]);
    setHasUnread(globalErrorLog.length > 0);
  }, []);

  const markAsRead = useCallback(() => {
    setHasUnread(false);
  }, []);

  const clear = useCallback(() => {
    clearErrorLog();
    setErrors([]);
    setHasUnread(false);
  }, []);

  // Subscribe to updates
  useState(() => {
    const unsubscribe = subscribeToErrors(refresh);
    return unsubscribe;
  });

  return { errors, hasUnread, refresh, markAsRead, clear };
}

// Error Log Panel Component
interface ErrorLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorLogPanel({ isOpen, onClose }: ErrorLogPanelProps) {
  const { errors, clear } = useErrorLog();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[500px] bg-white rounded-lg shadow-2xl border border-red-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-red-50 border-b border-red-200 rounded-t-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <span className="font-semibold text-red-800">
            Fehlerprotokoll ({errors.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {errors.length > 0 && (
            <button
              onClick={clear}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Alle löschen"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Error List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {errors.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Keine Fehler vorhanden
          </div>
        ) : (
          errors.map((error) => (
            <div
              key={error.id}
              className={`p-3 rounded-lg border ${
                error.type === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        error.source === 'backend'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {error.source}
                    </span>
                    <span className="text-xs text-gray-500">
                      {error.timestamp.toLocaleTimeString('de-DE')}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    error.type === 'error' ? 'text-red-800' : 'text-amber-800'
                  }`}>
                    {error.message}
                  </p>
                </div>
                {error.details && (
                  <button
                    onClick={() => setExpandedId(
                      expandedId === error.id ? null : error.id
                    )}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expandedId === error.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </div>
              {expandedId === error.id && error.details && (
                <div className={`mt-2 p-2 rounded text-xs font-mono whitespace-pre-wrap ${
                  error.type === 'error'
                    ? 'bg-red-100 text-red-900'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {error.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Error Indicator Button
interface ErrorIndicatorProps {
  onClick: () => void;
}

export function ErrorIndicator({ onClick }: ErrorIndicatorProps) {
  const { hasUnread, errors } = useErrorLog();

  if (errors.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-colors ${
        hasUnread
          ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title="Fehlerprotokoll anzeigen"
    >
      <AlertCircle size={20} />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {errors.length}
        </span>
      )}
    </button>
  );
}
