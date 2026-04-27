import { useState } from 'react';
import { Home, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeView: 'home' | 'customers' | 'settings';
  onViewChange: (view: 'home' | 'customers' | 'settings') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'customers', label: 'Kunden', icon: Users },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ] as const;

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {isOpen && <span className="font-bold text-lg">EVO MT</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                activeView === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {isOpen && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
