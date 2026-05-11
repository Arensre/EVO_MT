import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, List, Clock } from 'lucide-react';
import axios from 'axios';
import { EventModal } from './EventModal';

interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  category_id?: number;
  category_name?: string;
  category_color?: string;
  color?: string;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load events
  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await axios.get('/api/events', {
        params: {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0],
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleSaveEvent = async (eventData: any) => {
    const token = localStorage.getItem('token');
    if (selectedEvent) {
      await axios.put(`/api/events/${selectedEvent.id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post('/api/events', eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    await loadEvents();
  };

  const handleDeleteEvent = async (id: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadEvents();
  };

  const openNewEvent = (date?: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const openEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const start = event.start_date;
      const end = event.end_date || event.start_date;
      return dateStr >= start && dateStr <= end;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const calendarDays = getDaysInMonth(currentDate);

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
            <button onClick={goToToday} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Heute
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setView('month')} className={`px-4 py-2 rounded-md text-sm transition-colors ${view === 'month' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>
                Monat
              </button>
              <button onClick={() => setView('week')} className={`px-4 py-2 rounded-md text-sm transition-colors ${view === 'week' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>
                Woche
              </button>
              <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md text-sm transition-colors ${view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>
                Liste
              </button>
            </div>
            <button onClick={() => openNewEvent()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Plus size={20} />
              Neuer Termin
            </button>
          </div>
        </div>
      </div>

      {view === 'month' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div
                  key={index}
                  onClick={() => openNewEvent(date)}
                  className={`min-h-[100px] p-2 border-b border-r cursor-pointer hover:bg-gray-50 transition-colors ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''} ${isToday(date) ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); openEditEvent(event); }}
                        className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.category_color || event.color || '#3B82F6', color: 'white' }}
                        title={event.title}
                      >
                        {!event.is_all_day && <Clock size={10} className="inline mr-1" />}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">+{dayEvents.length - 3} weitere</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Wochenansicht wird entwickelt...</p>
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y">
            {events.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <List size={48} className="mx-auto mb-4 opacity-50" />
                <p>Keine Termine in diesem Monat</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} onClick={() => openEditEvent(event)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-12 rounded-full" style={{ backgroundColor: event.category_color || event.color || '#3B82F6' }} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString('de-DE')}
                        {event.end_date && event.end_date !== event.start_date && ` - ${new Date(event.end_date).toLocaleDateString('de-DE')}`}
                        {event.is_all_day && ' (Ganztägig)'}
                        {!event.is_all_day && event.start_time && `, ${event.start_time}`}
                      </div>
                      {event.location && <div className="text-sm text-gray-500">📍 {event.location}</div>}
                    </div>
                    <div className="text-sm text-gray-500">{event.category_name || 'Keine Kategorie'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={selectedDate || undefined}
      />
    </div>
  );
}
