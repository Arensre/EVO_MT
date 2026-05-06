import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, UserPlus, TrendingUp, Plus, ArrowRight, UsersRound, Building2, Zap, Sun, ChevronRight, Cake } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface DashboardStats {
  members: { total: number; active: number; newThisMonth: number };
  customers: { total: number; newThisMonth: number };
  suppliers: { total: number };
}

interface BirthdayPerson {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  age: number;
}

// Welcome widget
function WelcomeWidget() {
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Guten Morgen');
    else if (hour < 18) setGreeting('Guten Tag');
    else setGreeting('Guten Abend');
    
    setDate(new Date().toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm mb-1">{date}</p>
          <h2 className="text-2xl font-bold">{greeting}! 👋</h2>
          <p className="text-blue-100 mt-2">Hier ist Ihr Überblick für heute</p>
        </div>
        <div className="text-right">
          <Sun className="w-12 h-12 text-yellow-300" />
          <p className="text-3xl font-bold mt-2">{new Date().getHours()}:00</p>
        </div>
      </div>
    </div>
  );
}

// Stat card with hover effect
function StatCard({ title, count, subtitle, icon, color, onClick }: any) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6 transition-all duration-300 cursor-pointer ${isHovered ? 'shadow-lg transform -translate-y-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('500', '100')} ${color.replace('border-', 'text-')}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm font-medium transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <span className={color.replace('border-', 'text-')}>Details anzeigen</span>
        <ChevronRight className={`w-4 h-4 ml-1 ${color.replace('border-', 'text-')}`} />
      </div>
    </div>
  );
}

// Quick action button
function QuickAction({ icon, label, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
    >
      <div className={`p-3 rounded-full ${color} text-white mb-2 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

// Birthday widget
function BirthdayWidget({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { data: birthdays } = useQuery<BirthdayPerson[]>({
    queryKey: ['birthdays-this-month'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/members`);
      const members = response.data;
      const now = new Date();
      const currentMonth = now.getMonth();
      
      return members
        .filter((m: any) => m.birth_date)
        .map((m: any) => {
          const birthDate = new Date(m.birth_date);
          const age = now.getFullYear() - birthDate.getFullYear();
          return {
            id: m.id,
            first_name: m.first_name,
            last_name: m.last_name,
            birth_date: m.birth_date,
            age: age
          };
        })
        .filter((m: BirthdayPerson) => {
          const birthDate = new Date(m.birth_date);
          return birthDate.getMonth() === currentMonth;
        })
        .sort((a: BirthdayPerson, b: BirthdayPerson) => {
          const dateA = new Date(a.birth_date).getDate();
          const dateB = new Date(b.birth_date).getDate();
          return dateA - dateB;
        });
    }
  });

  const monthName = new Date().toLocaleDateString('de-DE', { month: 'long' });

  return (
    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Cake className="w-5 h-5" />
          Geburtstage im {monthName}
        </h3>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {birthdays?.length || 0} anstehend
        </span>
      </div>

      {birthdays && birthdays.length > 0 ? (
        <div className="space-y-2">
          {birthdays.slice(0, 5).map((person) => (
            <div 
              key={person.id} 
              className="flex items-center justify-between bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => onNavigate('members')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {new Date(person.birth_date).getDate()}
                </div>
                <div>
                  <p className="font-medium">{person.first_name} {person.last_name}</p>
                  <p className="text-sm text-pink-100">
                    wird {person.age}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-pink-200" />
            </div>
          ))}
          {birthdays.length > 5 && (
            <p className="text-center text-sm text-pink-200 mt-2">
              +{birthdays.length - 5} weitere
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Cake className="w-12 h-12 mx-auto text-white/30 mb-2" />
          <p className="text-pink-100">Keine Geburtstage diesen Monat</p>
        </div>
      )}
    </div>
  );
}

// Main Dashboard
export function Dashboard({ onNavigate }: { onNavigate: (view: any) => void }) {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [membersRes, customersRes, suppliersRes] = await Promise.all([
        axios.get(`${API_URL}/members`),
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/suppliers`)
      ]);
      
      const members = membersRes.data;
      const customers = customersRes.data;
      const suppliers = suppliersRes.data;
      
      return {
        members: {
          total: members.length,
          active: members.filter((m: any) => m.is_active).length,
          newThisMonth: members.filter((m: any) => {
            const created = new Date(m.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).length
        },
        customers: {
          total: customers.length,
          newThisMonth: customers.filter((c: any) => {
            const created = new Date(c.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).length
        },
        suppliers: {
          total: suppliers.length
        }
      };
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <WelcomeWidget />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Mitglieder"
          count={stats?.members.total || 0}
          subtitle={`${stats?.members.active || 0} aktiv • +${stats?.members.newThisMonth || 0} diesen Monat`}
          icon={<UsersRound className="w-6 h-6" />}
          color="border-amber-500"
          onClick={() => onNavigate('members')}
        />

        <StatCard
          title="Kunden"
          count={stats?.customers.total || 0}
          subtitle={`+${stats?.customers.newThisMonth || 0} neue diesen Monat`}
          icon={<Building2 className="w-6 h-6" />}
          color="border-blue-500"
          onClick={() => onNavigate('customers')}
        />

        <StatCard
          title="Lieferanten"
          count={stats?.suppliers.total || 0}
          subtitle="Im System"
          icon={<Users className="w-6 h-6" />}
          color="border-emerald-500"
          onClick={() => onNavigate('suppliers')}
        />
      </div>

      {/* Quick Actions + Birthdays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gray-400" />
            Schnellzugriff
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction
              icon={<UserPlus className="w-5 h-5" />}
              label="Neues Mitglied"
              onClick={() => onNavigate('members')}
              color="bg-amber-500"
            />
            <QuickAction
              icon={<Plus className="w-5 h-5" />}
              label="Neuer Kunde"
              onClick={() => onNavigate('customers')}
              color="bg-blue-500"
            />
            <QuickAction
              icon={<Plus className="w-5 h-5" />}
              label="Neuer Lieferant"
              onClick={() => onNavigate('suppliers')}
              color="bg-emerald-500"
            />
            <QuickAction
              icon={<Calendar className="w-5 h-5" />}
              label="Kalender"
              onClick={() => {}}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Birthdays */}
        <BirthdayWidget onNavigate={onNavigate} />
      </div>

      {/* Tip Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-sm p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Tipp des Tages
        </h3>
        <p className="text-gray-300 mb-4">
          Nutzen Sie die Filter in der Mitgliederübersicht, um schnell die gewünschten 
          Kontakte zu finden. Sie können nach Name, Mitgliedsart und Status filtern.
        </p>
        <button 
          onClick={() => onNavigate('members')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          Zu den Mitgliedern <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
