import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserList } from './UserList';
import { UserDetail } from './UserDetail';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import type { User, UserPermissions } from '../types';

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
  const [filters, setFilters] = useState<{ search?: string }>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadUsers();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    const username = prompt('Benutzername:');
    if (!username) return;
    
    const email = prompt('E-Mail:');
    if (!email) return;
    
    const password = prompt('Passwort (mindestens 8 Zeichen):');
    if (!password || password.length < 8) {
      alert('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    
    const first_name = prompt('Vorname:') || '';
    const last_name = prompt('Nachname:') || '';
    
    handleSave({
      username,
      email,
      first_name,
      last_name,
      password,
      role: 'user',
      permissions: defaultPermissions
    });
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleSave = async (data: Partial<User> & { password?: string }) => {
    try {
      if (selectedUser && selectedUser.id) {
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          loadUsers();
          const updatedUser = await response.json();
          setSelectedUser(updatedUser);
        }
      } else {
        const newUserData = {
          ...data,
          permissions: data.permissions || defaultPermissions
        };
        
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newUserData)
        });
        
        if (response.ok) {
          loadUsers();
        }
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
    if (!userToDelete || !userToDelete.id) return;
    
    try {
      await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleFilterChange = (newFilters: { search?: string }) => {
    setFilters(newFilters);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.first_name || '').toLowerCase().includes(search) ||
      (user.last_name || '').toLowerCase().includes(search)
    );
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center text-gray-500">
        Sie haben keine Berechtigung für diese Seite.
      </div>
    );
  }

  const currentUserId: number | undefined = currentUser?.id;

  if (isMobile) {
    if (selectedUser) {
      const canDelete = selectedUser.id !== currentUserId;
      return (
        <>
          <UserDetail
            user={selectedUser}
            currentUserId={currentUserId}
            isMobile={true}
            onBack={handleBackToList}
            onSave={handleSave}
            onDelete={canDelete ? () => handleDeleteClick(selectedUser) : undefined}
          />
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            title="Benutzer löschen"
            message={`Möchten Sie den Benutzer "${userToDelete?.username}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        </>
      );
    }

    return (
      <>
        <div className="p-6">
          <UserList
            users={filteredUsers}
            selectedId={undefined}
            currentUserId={currentUserId}
            onAddNew={handleAddNew}
            onSelect={handleSelectUser}
            onDelete={handleDeleteClick}
            onFilterChange={handleFilterChange}
          />
        </div>

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title="Benutzer löschen"
          message={`Möchten Sie den Benutzer "${userToDelete?.username}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  }

  const canDeleteDesktop = selectedUser && selectedUser.id !== currentUserId;

  return (
    <>
      <div className={`${selectedUser ? 'w-1/2' : 'w-full'} overflow-auto p-6 transition-all duration-300`}>
        <UserList
          users={filteredUsers}
          selectedId={undefined}
          currentUserId={currentUserId}
          onAddNew={handleAddNew}
          onSelect={handleSelectUser}
          onDelete={handleDeleteClick}
          onFilterChange={handleFilterChange}
        />
      </div>

      {selectedUser && (
        <div className="w-1/2 border-l border-gray-200 overflow-auto bg-gray-50">
          <UserDetail
            user={selectedUser}
            currentUserId={currentUserId}
            onClose={handleBackToList}
            onSave={handleSave}
            onDelete={canDeleteDesktop ? () => handleDeleteClick(selectedUser) : undefined}
          />
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Benutzer löschen"
        message={`Möchten Sie den Benutzer "${userToDelete?.username}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
