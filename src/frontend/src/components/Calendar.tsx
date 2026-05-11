import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, List } from 'lucide-react';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="text-emerald-600" size={32} />
          Vereinsaktivitäten
        </h1>
        <p className="text-gray-600 mt-2">
          Verwalten Sie alle Termine und Aktivitäten des Vereins.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Heute
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  view === 'month'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-200'
                }`}
              >
                Monat
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  view === 'week'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-200'
                }`}
              >
                Woche
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  view === 'list'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-200'
                }`}
              >
                Liste
              </button>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
              Neuer Termin
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {view === 'month' && (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Kalender wird entwickelt...</p>
            <p className="text-sm">Monatsansicht für {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
          </div>
        )}
        
        {view === 'week' && (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Wochenansicht wird entwickelt...</p>
          </div>
        )}
        
        {view === 'list' && (
          <div className="text-center py-12 text-gray-500">
            <List size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Listenansicht wird entwickelt...</p>
          </div>
        )}
      </div>
    </div>
  );
}
