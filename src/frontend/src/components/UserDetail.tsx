import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Save, X, Trash2, Shield, User as UserIcon, Check } from 'lucide-react';
import type { User, UserPermissions } from '../types';

interface UserDetailProps {
  user: User;
  currentUserId?: number;
  isMobile?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  onSave: (data: Partial<User> & { password?: string }) => void;
  onDelete?: () => void;
}

const defaultPermissions: UserPermissions = {
  customers: { read: true, write: false, delete: false },
  suppliers: { read: true, write: false, delete: false },
  materials: { read: false, write: false, delete: false }
};

export function UserDetail({ user, currentUserId, isMobile, onClose, onBack, onSave, onDelete }: UserDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'permissions'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: user.role,
    password: '',
    permissions: user.permissions || defaultPermissions
  });

  const isCurrentUser = currentUserId === user.id;

  useEffect(() => {
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      password: '',
      permissions: user.permissions || defaultPermissions
    });
    setIsEditing(false);
    setActiveTab('details');
  }, [user]);

  const handleSave = () => {
    const saveData: Partial<User> & { password?: string } = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      permissions: formData.permissions
    };
    if (formData.password) {
      saveData.password = formData.password;
    }
    onSave(saveData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      password: '',
      permissions: user.permissions || defaultPermissions
    });
    setIsEditing(false);
  };

  const updatePermission = (
    module: keyof UserPermissions,
    action: keyof typeof defaultPermissions.customers,
    value: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  const Icon = user.role === 'admin' ? Shield : UserIcon;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(isMobile || onBack) && (
              <button
                onClick={onBack || onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon size={24} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                </span>
                {isCurrentUser && <span className="text-gray-400">(Ich)</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={18} />
                  Bearbeiten
                </button>
                {!isCurrentUser && onDelete && (
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                    Löschen
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  Speichern
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={18} />
                  Abbrechen
                </button>
              </>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Berechtigungen
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Benutzer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort (optional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Leer lassen, um Passwort nicht zu ändern"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Benutzername</label>
                    <p className="text-gray-900 font-medium">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">E-Mail</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Vorname</label>
                    <p className="text-gray-900">{user.first_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nachname</label>
                    <p className="text-gray-900">{user.last_name || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Rolle</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? (
                        <><Shield size={14} /> Administrator</>
                      ) : (
                        <><UserIcon size={14} /> Benutzer</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-gray-400" />
              Berechtigungen
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                {(Object.keys(formData.permissions) as Array<keyof UserPermissions>).map((module) => (
                  <div key={module} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize w-32">{module}</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions[module].read}
                          onChange={(e) => updatePermission(module, 'read', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">Lesen</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions[module].write}
                          onChange={(e) => updatePermission(module, 'write', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">Bearbeiten</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions[module].delete}
                          onChange={(e) => updatePermission(module, 'delete', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">Löschen</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(Object.entries(user.permissions || {}) as [keyof UserPermissions, { read: boolean; write: boolean; delete: boolean }][]).map(([module, perms]) => (
                  <div key={module} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{module}</span>
                    <div className="flex gap-3">
                      {perms.read && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                          <Check size={14} /> Lesen
                        </span>
                      )}
                      {perms.write && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                          <Check size={14} /> Bearbeiten
                        </span>
                      )}
                      {perms.delete && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-sm rounded">
                          <Check size={14} /> Löschen
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
