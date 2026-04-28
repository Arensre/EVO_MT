import type { ModulePermissions } from '../types';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function UserProfile() {
  const { user, permissions, canRead } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Neues Passwort muss mindestens 6 Zeichen haben');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      return;
    }

    setIsChangingPassword(true);

    try {
      await axios.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
      
      setPasswordSuccess('Passwort wurde erfolgreich geändert');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Fehler beim Ändern des Passworts');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const moduleLabels: Record<keyof typeof permissions, string> = {
    customers: 'Kunden',
    suppliers: 'Lieferanten',
    materials: 'Materialien'
  };

  const permissionLabels = {
    read: 'Lesen',
    write: 'Bearbeiten',
    delete: 'Löschen'
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mein Profil</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profil & Passwort
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Meine Berechtigungen
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-8">
              {/* Profile Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profilinformationen</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{user.username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border capitalize">
                      {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Password Change */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Passwort ändern</h2>
                
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{passwordSuccess}</div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Aktuelles Passwort
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Neues Passwort
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Mindestens 6 Zeichen</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Passwort bestätigen
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isChangingPassword ? 'Wird geändert...' : 'Passwort ändern'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Meine Berechtigungen</h2>
              
              {permissions && (
                <div className="space-y-4">
                  {(Object.keys(moduleLabels) as Array<keyof typeof moduleLabels>).map((module) => (
                    <div key={module} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{moduleLabels[module]}</h3>
                        {canRead(module) ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Zugang</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Kein Zugang</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(permissionLabels).map(([action, label]) => {
                          const hasPerm = permissions[module][action as keyof ModulePermissions];
                          return (
                            <div
                              key={action}
                              className={`text-center py-2 px-3 rounded text-sm ${
                                hasPerm
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-gray-50 text-gray-400 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {hasPerm ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span>{label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
