import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Plus, Mail, Phone, Globe, MapPin, User, Building2, Users, X, Check } from 'lucide-react';
import { Customer, CustomerType, Person } from '../../types';
import { customerApi, personApi } from '../../services/api';
import { CustomerForm } from './CustomerForm';
import { PersonForm } from './PersonForm';

interface CustomerDetailProps {
  customerId: number | null;
  onClose: () => void;
}

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  company: 'Firma',
  club: 'Verein',
  private: 'Privatperson',
};

const CUSTOMER_TYPE_ICONS: Record<CustomerType, typeof Building2> = {
  company: Building2,
  club: Users,
  private: User,
};

export function CustomerDetail({ customerId, onClose }: CustomerDetailProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getById(customerId!),
    enabled: !!customerId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => customerApi.delete(customerId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: (personId: number) => personApi.delete(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    },
  });

  if (!customerId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4" />
          <p>Wählen Sie einen Kunden aus der Liste</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-red-600">Kunde nicht gefunden.</div>
      </div>
    );
  }

  const TypeIcon = CUSTOMER_TYPE_ICONS[customer.type];

  if (isEditing) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Kunde bearbeiten</h2>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <CustomerForm
          customer={customer}
          onSuccess={() => {
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-lg">
            <TypeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
              {CUSTOMER_TYPE_LABELS[customer.type]}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Bearbeiten</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Löschen</span>
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Kontaktdaten</h3>
        <div className="grid grid-cols-2 gap-4">
          {customer.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <a href={`mailto:${customer.email}`} className="text-primary-600 hover:underline">
                {customer.email}
              </a>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <a href={`tel:${customer.phone}`} className="text-primary-600 hover:underline">
                {customer.phone}
              </a>
            </div>
          )}
          {customer.website && (
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <a
                href={customer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {customer.website}
              </a>
            </div>
          )}
          {(customer.street || customer.city) && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                {customer.street && <div>{customer.street}</div>}
                {(customer.zipCode || customer.city) && (
                  <div>
                    {customer.zipCode} {customer.city}
                  </div>
                )}
                <div>{customer.country}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Ansprechpartner</h3>
          <button
            onClick={() => setIsAddingPerson(true)}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Hinzufügen</span>
          </button>
        </div>

        {isAddingPerson && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <PersonForm
              customerId={customer.id}
              onSuccess={() => {
                setIsAddingPerson(false);
                queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
              }}
              onCancel={() => setIsAddingPerson(false)}
            />
          </div>
        )}

        {editingPerson && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <PersonForm
              customerId={customer.id}
              person={editingPerson}
              onSuccess={() => {
                setEditingPerson(null);
                queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
              }}
              onCancel={() => setEditingPerson(null)}
            />
          </div>
        )}

        <div className="space-y-3">
          {customer.persons?.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium">
                    {person.firstName} {person.lastName}
                    {person.isPrimary && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                        Primär
                      </span>
                    )}
                  </div>
                  {person.role && <div className="text-sm text-gray-500">{person.role}</div>}
                  {person.email && <div className="text-sm text-gray-500">{person.email}</div>}
                  {person.phone && <div className="text-sm text-gray-500">{person.phone}</div>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPerson(person)}
                  className="p-2 text-gray-400 hover:text-primary-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deletePersonMutation.mutate(person.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!customer.persons?.length && (
            <div className="text-center text-gray-500 py-4">
              Keine Ansprechpartner vorhanden
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Notizen</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Kunde löschen</h3>
            <p className="text-gray-600 mb-4">
              Möchten Sie "{customer.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Abbrechen
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                className="btn-danger"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
