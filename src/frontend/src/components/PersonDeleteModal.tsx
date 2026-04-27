import { AlertTriangle } from 'lucide-react';

interface PersonDeleteModalProps {
  isOpen: boolean;
  personName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function PersonDeleteModal({ isOpen, personName, onClose, onConfirm }: PersonDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
        
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Ansprechpartner löschen
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Möchten Sie den Ansprechpartner <strong className="text-gray-900">{personName}</strong> wirklich löschen?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ja, löschen
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
