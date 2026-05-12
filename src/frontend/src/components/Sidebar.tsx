import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Home, Users, Truck, Settings, UsersRound, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LogOut, Database, Building2, UserCircle, Award, Monitor, FileSpreadsheet, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';

const APP_VERSION = '1.21.8';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const fetchEnabledModules = async (): Promise<string[]> => {
  const response = await axios.get('/api/module-settings/enabled');
  return response.data;
};

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [erpExpanded, setErpExpanded] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const { user } = useAuth();

  const { data: enabledModules } = useQuery({
    queryKey: ['enabled-modules'],
    queryFn: fetchEnabledModules,
  });

  const isModuleEnabled = (moduleName: string): boolean => {
    if (!enabledModules) return true;
    return enabledModules.includes(moduleName);
  };

  const isErpActive = activeView === 'customers' || activeView === 'suppliers';
  const isMembersActive = activeView === 'members' || activeView === 'membership';
  const isActivitiesActive = activeView === 'calendar';
  const isAdminActive = activeView === 'settings' || activeView === 'users' || activeView === 'modules' || activeView === 'general' || activeView === 'importer';

  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || '';
    const last = user?.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {isOpen && <span className="font-bold text-lg">EVO</span>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-700 transition-colors">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {/* 1) Dashboard */}
        <button
          onClick={() => onViewChange('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
            activeView === 'home' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <Home size={20} />
          {isOpen && <span>Dashboard</span>}
        </button>

        {/* 2) Mitgliederverwaltung */}
        {isModuleEnabled('members') && (
          <div className="mt-4">
            <button
              onClick={() => setMembersExpanded(!membersExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isMembersActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <UsersRound size={20} />
                {isOpen && <span>Mitgliederverwaltung</span>}
              </div>
              {isOpen && (membersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
            {membersExpanded && isOpen && (
              <div className="bg-gray-900 py-2">
                <button
                  onClick={() => onViewChange('members')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'members' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UsersRound size={16} />
                  <span>Mitglieder</span>
                </button>
                <button
                  onClick={() => onViewChange('membership')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'membership' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Award size={16} />
                  <span>Mitgliedschaft</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3) Vereinsaktivitäten (aufgklappbar) */}
        {isModuleEnabled('calendar') && (
        <div className="mt-4">
          <button
            onClick={() => setActivitiesExpanded(!activitiesExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
              isActivitiesActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon size={20} />
              {isOpen && <span>Vereinsaktivitäten</span>}
            </div>
            {isOpen && (activitiesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
          </button>
          {activitiesExpanded && isOpen && (
            <div className="bg-gray-900 py-2">
              <button
                onClick={() => onViewChange('calendar')}
                className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                  activeView === 'calendar' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <CalendarIcon size={16} />
                <span>Kalender</span>
              </button>
            </div>
          )}
        </div>

        )}
        {/* 4) ERP */}
        {(isModuleEnabled('customers') || isModuleEnabled('suppliers')) && (
          <div className="mt-4">
            <button
              onClick={() => setErpExpanded(!erpExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isErpActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={20} />
                {isOpen && <span>ERP</span>}
              </div>
              {isOpen && (erpExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
            {erpExpanded && isOpen && (
              <div className="bg-gray-900 py-2">
                {isModuleEnabled('customers') && (
                  <button
                    onClick={() => onViewChange('customers')}
                    className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                      activeView === 'customers' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users size={16} />
                    <span>Kunden</span>
                  </button>
                )}
                {isModuleEnabled('suppliers') && (
                  <button
                    onClick={() => onViewChange('suppliers')}
                    className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                      activeView === 'suppliers' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Truck size={16} />
                    <span>Lieferanten</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5) Administration */}
        {user?.role === 'admin' && (
          <div className="mt-4">
            <button
              onClick={() => setAdminExpanded(!adminExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isAdminActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={20} />
                {isOpen && <span>Administration</span>}
              </div>
              {isOpen && (adminExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
            {adminExpanded && isOpen && (
              <div className="bg-gray-900 py-2">
                <button
                  onClick={() => onViewChange('general')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'general' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor size={16} />
                  <span>Allgemein</span>
                </button>
                <button
                  onClick={() => onViewChange('settings')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'settings' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Database size={16} />
                  <span>Stammdaten</span>
                </button>
                <button
                  onClick={() => onViewChange('modules')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'modules' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings size={16} />
                  <span>Module</span>
                </button>
                <button
                  onClick={() => onViewChange('importer')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'importer' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet size={16} />
                  <span>Import / Export</span>
                </button>
                <button
                  onClick={() => onViewChange('users')}
                  className={`w-full flex items-center gap-3 px-8 py-2 transition-colors ${
                    activeView === 'users' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UserCircle size={16} />
                  <span>Benutzer</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={() => onViewChange('profile')}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
            activeView === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {getInitials()}
            </div>
          )}
          {isOpen && (
            <div className="flex-1 text-left overflow-hidden">
              <div className="font-medium truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.role === 'admin' ? 'Administrator' : 'Benutzer'}</div>
            </div>
          )}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          {isOpen && <span>Abmelden</span>}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-700">
          Version {APP_VERSION}
        </div>
      )}
    </div>
  );
}
