import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  customerName: string;
  customerNumber: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ 
  isOpen, 
  customerName, 
  customerNumber, 
  onClose, 
  onConfirm 
}: DeleteConfirmModalProps) {
  const [inputNumber, setInputNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputNumber.trim() === customerNumber) {
      setInputNumber('');
      setError('');
      onConfirm();
    } else {
      setError('Kundennummer stimmt nicht überein. Bitte versuchen Sie es erneut.');
    }
  };

  const handleClose = () => {
    setInputNumber('');
    setError('');
    onClose();
  };

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
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Kunde löschen?</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Sie sind dabei, den Kunden <strong>"{customerName}"</strong> zu löschen. 
              Diese Aktion kann nicht rückgängig gemacht werden!
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Um das Löschen zu bestätigen, geben Sie bitte die Kundennummer ein:
              </p>
              <p className="text-lg font-mono font-bold text-gray-900 bg-white px-3 py-2 rounded border border-gray-200 inline-block">
                {customerNumber}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kundennummer bestätigen
              </label>
              <input
                type="text"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="Kundennummer eingeben..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Endgültig löschen
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
