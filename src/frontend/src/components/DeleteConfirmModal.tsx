import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  customerName?: string;
  customerNumber?: string;
  title?: string;
  message?: string;
  requireConfirmation?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ 
  isOpen, 
  customerName, 
  customerNumber, 
  title,
  message,
  requireConfirmation = true,
  onClose, 
  onConfirm 
}: DeleteConfirmModalProps) {
  const [inputNumber, setInputNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    // For customers, require number confirmation
    if (customerNumber && requireConfirmation) {
      if (inputNumber.trim() === customerNumber) {
        setInputNumber('');
        setError('');
        onConfirm();
      } else {
        setError('Kundennummer stimmt nicht überein. Bitte versuchen Sie es erneut.');
      }
    } else {
      // Generic delete without confirmation
      onConfirm();
    }
  };

  const handleClose = () => {
    setInputNumber('');
    setError('');
    onClose();
  };

  // Use provided title/message or fallback
  const modalTitle = title || 'Löschen bestätigen';
  const modalMessage = message || (
    customerName 
      ? `Möchten Sie "${customerName}" wirklich löschen?`
      : 'Möchten Sie diesen Eintrag wirklich löschen?'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={(e) => e.stopPropagation()}></div>
        
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
            </div>
            
            <p className="text-gray-600 mb-4">{modalMessage}</p>
            
            {customerNumber && requireConfirmation && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geben Sie zur Bestätigung die Kundennummer ein:
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded ml-1">{customerNumber}</span>
                </label>
                <input
                  type="text"
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Kundennummer eingeben..."
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {error}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Löschen
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
