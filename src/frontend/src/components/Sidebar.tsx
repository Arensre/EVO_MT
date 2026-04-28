import { useState } from 'react';
import { Home, Users, Truck, Settings, UsersRound, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { user } = useAuth();

  const mainMenuItems: { id: View; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'customers', label: 'Kunden', icon: Users },
    { id: 'suppliers', label: 'Lieferanten', icon: Truck },
  ];

  const isSettingsActive = activeView === 'settings' || activeView === 'users';

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
        {/* Hauptmenü */}
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Einstellungen (aufgklappbar) */}
        <div className="mt-4">
          <button
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
              isSettingsActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} />
              {isOpen && <span>Einstellungen</span>}
            </div>
            {isOpen && (
              settingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>

          {/* Untermenü Einstellungen */}
          {settingsExpanded && isOpen && (
            <div className="bg-gray-900 py-2">
              <button
                onClick={() => onViewChange('settings')}
                className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                  activeView === 'settings'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Allgemein</span>
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => onViewChange('users')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'users'
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UsersRound size={16} />
                  <span>Benutzerverwaltung</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile Button */}
      <button
        onClick={() => onViewChange("profile")}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-t border-gray-700 ${
          activeView === "profile"
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <User size={20} />
        {isOpen && <span>Mein Profil</span>}
      </button>
      {/* Footer mit User Info */}
      {isOpen && user && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {user.role}
          </div>
        </div>
      )}
    </div>
  );
}
