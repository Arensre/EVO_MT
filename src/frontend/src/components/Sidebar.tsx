import { useState } from 'react';
import { Home, Users, Truck, Settings, UsersRound, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LogOut, Database, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';

// APP VERSION - Increment on every deployment
const APP_VERSION = '1.7.2-2026-05-04-1727';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [erpExpanded, setErpExpanded] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const { user } = useAuth();

  const isErpActive = activeView === 'customers' || activeView === 'suppliers';
  const isMembersActive = activeView === 'members';
  const isAdminActive = activeView === 'settings' || activeView === 'users';

  // Generate initials for avatar placeholder
  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || user?.first_name?.charAt(0) || '';
    const last = user?.last_name?.charAt(0) || user?.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

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
        {/* Home */}
        <button
          onClick={() => onViewChange('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
            activeView === 'home'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <Home size={20} />
          {isOpen && <span>Home</span>}
        </button>

        {/* ERP (aufgklappbar) */}
        <div className="mt-4">
          <button
            onClick={() => setErpExpanded(!erpExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
              isErpActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 size={20} />
              {isOpen && <span>ERP</span>}
            </div>
            {isOpen && (
              erpExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>

          {/* Untermenü ERP */}
          {erpExpanded && isOpen && (
            <div className="bg-gray-900 py-2">
              <button
                onClick={() => onViewChange('customers')}
                className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                  activeView === 'customers'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span>Kunden</span>
              </button>
              <button
                onClick={() => onViewChange('suppliers')}
                className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                  activeView === 'suppliers'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Truck size={16} />
                <span>Lieferanten</span>
              </button>
            </div>
          )}
        </div>

        {/* Mitgliederverwaltung (aufgklappbar) */}
        <div className="mt-4">
          <button
            onClick={() => setMembersExpanded(!membersExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
              isMembersActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCircle size={20} />
              {isOpen && <span>Mitgliederverwaltung</span>}
            </div>
            {isOpen && (
              membersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>

          {/* Untermenü Mitglieder */}
          {membersExpanded && isOpen && (
            <div className="bg-gray-900 py-2">
              <button
                onClick={() => onViewChange('members')}
                className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                  activeView === 'members'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UsersRound size={16} />
                <span>Mitglieder</span>
              </button>
            </div>
          )}
        </div>

        {/* Administration (aufgklappbar) */}
        <div className="mt-4">
          <button
            onClick={() => setAdminExpanded(!adminExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
              isAdminActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} />
              {isOpen && <span>Administration</span>}
            </div>
            {isOpen && (
              adminExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>

          {/* Untermenü Administration */}
          {adminExpanded && isOpen && (
            <div className="bg-gray-900 py-2">
              <button
                onClick={() => onViewChange('settings')}
                className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                  activeView === 'settings'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Database size={16} />
                <span>Stammdaten</span>
              </button>
              
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => onViewChange('modules')}
                    className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                      activeView === 'modules'
                        ? 'text-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Settings size={16} />
                    <span>Module</span>
                  </button>
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
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-700">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-orange-400 hover:bg-gray-700 hover:text-orange-300"
        >
          <LogOut size={20} />
          {isOpen && <span>Abmelden</span>}
        </button>

        {/* Footer mit User Info & Version - Klickbarer Profil-Button */}
        {isOpen && user && (
          <button
            onClick={() => onViewChange("profile")}
            className={`w-full p-4 border-t border-gray-700 text-left transition-colors ${
              activeView === "profile"
                ? "bg-gray-700"
                : "hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {/* Avatar in Sidebar */}
              <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                activeView === "profile"
                  ? "bg-blue-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}>
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url + '?t=' + Date.now()} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
            {/* VERSION */}
            <div className="text-xs text-gray-600 mt-1 font-mono">
              v{APP_VERSION}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
