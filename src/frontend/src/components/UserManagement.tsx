import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { User, UserPermissions } from '../types';

interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: string;
  permissions: UserPermissions;
}

const defaultPermissions: UserPermissions = {
  customers: { read: true, write: false, delete: false },
  suppliers: { read: true, write: false, delete: false },
  materials: { read: false, write: false, delete: false }
};

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    permissions: defaultPermissions
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsEditing(true);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      permissions: defaultPermissions
    });
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setIsEditing(true);
    setFormData({
      username: selectedUser.username,
      email: selectedUser.email,
      first_name: selectedUser.first_name || '',
      last_name: selectedUser.last_name || '',
      role: selectedUser.role,
      permissions: selectedUser.permissions || defaultPermissions
    });
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsEditing(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await fetch(`/api/users/${userToDelete.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const updatePermission = (module: keyof UserPermissions, action: keyof typeof defaultPermissions.customers, value: boolean) => {
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

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center text-gray-500">
        Sie haben keine Berechtigung für diese Seite.
      </div>
    );
  }

  // Desktop Split-View
  return (
    <div className="flex h-full">
      {/* Linke Seite - Benutzerliste */}
      <div className={`${selectedUser || isEditing ? 'w-1/2' : 'w-full'} overflow-auto p-6 transition-all duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <Plus size={20} />
            Neuer Benutzer
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Benutzername</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rolle</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => handleSelectUser(user)}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUser.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(user);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rechte Seite - Details/Bearbeitung */}
      {(selectedUser || isEditing) && (
        <div className="w-1/2 border-l border-gray-200 overflow-auto bg-gray-50 p-6">
          {/* Header mit Zurück-Button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              Zurück zur Liste
            </button>
          </div>

          {isEditing ? (
            // Bearbeiten/Neu Formular
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {selectedUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="user">Benutzer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {!selectedUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
                    <input
                      type="password"
                      required={!selectedUser}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Mindestens 8 Zeichen"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Shield size={16} className="inline mr-1" />
                    Berechtigungen
                  </label>
                  <div className="space-y-3">
                    {(Object.keys(formData.permissions) as Array<keyof UserPermissions>).map((module) => (
                      <div key={module} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize w-32">{module}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions[module].read}
                            onChange={(e) => updatePermission(module, 'read', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Lesen</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions[module].write}
                            onChange={(e) => updatePermission(module, 'write', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Bearbeiten</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions[module].delete}
                            onChange={(e) => updatePermission(module, 'delete', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Löschen</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {selectedUser ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedUser) {
                        setIsEditing(false);
                      } else {
                        setSelectedUser(null);
                        setIsEditing(false);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Detail-Ansicht
            selectedUser && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.username}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                      Bearbeiten
                    </button>
                    {selectedUser.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteClick(selectedUser)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={18} />
                        Löschen
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vorname</label>
                      <p className="text-gray-900">{selectedUser.first_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nachname</label>
                      <p className="text-gray-900">{selectedUser.last_name || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Rolle</label>
                    <p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        selectedUser.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedUser.role === 'admin' ? 'Administrator' : 'Benutzer'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Shield size={16} />
                      Berechtigungen
                    </label>
                    <div className="mt-2 space-y-2">
                      {(Object.entries(selectedUser.permissions || {}) as [keyof UserPermissions, UserPermissions[keyof UserPermissions]][]).map(([module, perms]) => (
                        <div key={module} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="capitalize font-medium">{module}</span>
                          <div className="flex gap-2 text-sm">
                            {perms.read && <span className="text-green-600">✓ Lesen</span>}
                            {perms.write && <span className="text-blue-600">✓ Bearbeiten</span>}
                            {perms.delete && <span className="text-red-600">✓ Löschen</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Benutzer löschen</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Möchten Sie den Benutzer <strong>{userToDelete.username}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Löschen
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
