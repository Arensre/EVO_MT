import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, List } from 'lucide-react';
import axios from 'axios';
import { EventModal } from './EventModal';

interface Event {
  id?: number;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  is_all_day: boolean;
  category_id?: number;
  category_name?: string;
  category_color?: string;
  position?: 'single' | 'start' | 'middle' | 'end';
}

type ViewType = 'month' | 'week' | 'list';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching events with token:', token ? 'present' : 'missing');
      const response = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched events:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSave = async (eventData: Event) => {
    try {
      const token = localStorage.getItem('token');
      if (eventData.id) {
        await axios.put(`/api/events/${eventData.id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/events', eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = (id: number) => {
    if (!id) return;
    deleteEvent(id);
  };

  const deleteEvent = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (dateStr: string) => {
    const dayEvents = events.filter(event => {
      const startDate = event.start_date ? event.start_date.split('T')[0] : null;
      const endDate = event.end_date ? event.end_date.split('T')[0] : startDate;
      if (!startDate) return false;
      
      // Event starts on this day
      if (startDate === dateStr) return true;
      // Event spans over this day
      if (endDate && endDate !== startDate) {
        const current = new Date(dateStr);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return current >= start && current <= end;
      }
      return false;
    }).map(event => {
      const eventStart = event.start_date ? event.start_date.split('T')[0] : '';
      const eventEnd = event.end_date ? event.end_date.split('T')[0] : eventStart;
      
      let position: 'single' | 'start' | 'middle' | 'end' = 'single';
      if (eventStart !== eventEnd) {
        if (dateStr === eventStart) position = 'start';
        else if (dateStr === eventEnd) position = 'end';
        else position = 'middle';
      }
      
      return { ...event, position };
    });
    return dayEvents;
  };

  const formatDateStr = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    setSelectedDate(new Date(year, month, day));
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const renderMonthView = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Get all events for this month
  const monthEvents = events.filter(event => {
    const start = event.start_date ? event.start_date.split('T')[0] : '';
    const end = event.end_date ? event.end_date.split('T')[0] : start;
    const monthStart = formatDateStr(year, month, 1);
    const monthEnd = formatDateStr(year, month, daysInMonth);
    return start <= monthEnd && end >= monthStart;
  });
  
  // Separate multi-day and single-day events
  const multiDayEvents = monthEvents.filter(e => {
    const start = e.start_date ? e.start_date.split('T')[0] : '';
    const end = e.end_date ? e.end_date.split('T')[0] : start;
    return start !== end;
  });
  
  // Build week by week
  const weeks = [];
  let currentWeek = [];
  let dayCounter = 1;
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }
  
  // Days of month
  while (dayCounter <= daysInMonth) {
    currentWeek.push(dayCounter);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    dayCounter++;
  }
  
  // Fill last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  return (
    <div className="space-y-4">
      {weeks.map((week, weekIndex) => {
        const weekStart = week.find(d => d !== null);
        const weekEnd = [...week].reverse().find(d => d !== null);
        
        return (
          <div key={weekIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Multi-day events for this week */}
            <div className="bg-gray-50 border-b">
              {multiDayEvents
                .filter(event => {
                  const eventStart = event.start_date ? event.start_date.split('T')[0] : '';
                  const eventEnd = event.end_date ? event.end_date.split('T')[0] : eventStart;
                  const weekStartStr = weekStart ? formatDateStr(year, month, weekStart) : '';
                  const weekEndStr = weekEnd ? formatDateStr(year, month, weekEnd) : '';
                  return eventStart <= weekEndStr && eventEnd >= weekStartStr;
                })
                .map(event => {
                  const eventStart = event.start_date ? event.start_date.split('T')[0] : '';
                  const eventEnd = event.end_date ? event.end_date.split('T')[0] : eventStart;
                  const weekStartStr = weekStart ? formatDateStr(year, month, weekStart) : '';
                  const weekEndStr = weekEnd ? formatDateStr(year, month, weekEnd) : '';
                  
                  const visibleStart = eventStart > weekStartStr ? eventStart : weekStartStr;
                  const visibleEnd = eventEnd < weekEndStr ? eventEnd : weekEndStr;
                  
                  const startDayIndex = week.findIndex(d => d && formatDateStr(year, month, d) === visibleStart);
                  const endDayIndex = week.findIndex(d => d && formatDateStr(year, month, d) === visibleEnd);
                  
                  if (startDayIndex === -1 || endDayIndex === -1) return null;
                  
                  const span = endDayIndex - startDayIndex + 1;
                  
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className="mx-1 my-1 px-2 py-1 rounded cursor-pointer text-white text-sm truncate hover:opacity-80"
                      style={{
                        marginLeft: `${startDayIndex * 14.28}%`,
                        width: `${span * 14.28}%`,
                        backgroundColor: event.category_color || '#6B7280'
                      }}
                    >
                      {event.title}
                    </div>
                  );
                })}
            </div>
            
            {/* Days grid */}
            <div className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <div key={dayIndex} className="h-24 bg-gray-200 border-r last:border-r-0"></div>;
                }
                
                const dateStr = formatDateStr(year, month, day);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                const dayEvents = getEventsForDate(dateStr).filter(e => {
                  const s = e.start_date ? e.start_date.split('T')[0] : '';
                  const ed = e.end_date ? e.end_date.split('T')[0] : s;
                  return s === ed; // Only single-day events
                });
                
                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(year, month, day)}
                    className={`h-24 border-r last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 hover:shadow-inner transition-colors ${
                      isToday ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ 
                            backgroundColor: event.category_color || '#6B7280', 
                            color: 'white'
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};


  const renderWeekView = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <CalendarIcon size={48} className="mx-auto text-emerald-600 mb-4" />
        <p className="text-xl text-gray-700">Wochenansicht</p>
        <p className="text-gray-500 mt-2">Coming soon...</p>
      </div>
    );
  };

  const renderListView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    return (
      <div className="bg-white rounded-lg shadow">
        {sortedEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p>Keine Termine vorhanden</p>
            <p className="text-sm mt-1">Klicken Sie auf "+" um einen neuen Termin zu erstellen</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: event.category_color || '#6B7280' }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(event.start_date).toLocaleDateString('de-DE')}
                        {!event.is_all_day && event.start_time && ` ${event.start_time}`}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="text-emerald-600" size={32} />
          Vereinsaktivitäten
        </h1>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setSelectedDate(new Date());
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Neuer Termin
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'month'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monat
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'week'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Woche
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                viewType === 'list'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List size={16} />
              Liste
            </button>
          </div>
        </div>

        {viewType === 'month' && (
          <>
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div>
              {renderMonthView()}
            </div>
          </>
        )}

        {viewType === 'week' && (
          <div className="p-6">
            {renderWeekView()}
          </div>
        )}

        {viewType === 'list' && (
          <div className="p-6">
            {renderListView()}
          </div>
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedEvent?.id ? handleDelete : undefined}
        event={selectedEvent}
        initialDate={selectedDate}
      />
    </div>
  );
}
