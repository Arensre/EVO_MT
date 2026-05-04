import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Member, MemberType, MemberFormData, MemberFunction } from "../types";

interface MemberDetailProps {
  member: Member;
  memberTypes?: MemberType[];
  memberFunctions?: MemberFunction[];
  onClose?: () => void;
  onBack?: () => void;
  onSave: (data: MemberFormData) => void;
  onDelete?: () => void;
}

// Fetch module settings for required fields
const fetchModuleSettings = async () => {
  const response = await axios.get("/api/module-settings/members");
  return response.data;
};

// Required Label Component
function RequiredLabel({ label, fieldKey }: { label: string; fieldKey: string }) {
  const { data: moduleSettings } = useQuery({
    queryKey: ["module-settings-members-detail"],
    queryFn: fetchModuleSettings,
  });

  const requiredFields = moduleSettings?.configuration?.requiredFields || [];
  const isRequired = requiredFields.includes(fieldKey);

  return (
    <>
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </>
  );
}

// Simple Markdown Toolbar
function MarkdownToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const buttons = [
    { icon: Bold, text: "**fett**", label: "Fett" },
    { icon: Italic, text: "*kursiv*", label: "Kursiv" },
    { icon: List, text: "\n- Listenpunkt", label: "Liste" },
    { icon: LinkIcon, text: "[Link](url)", label: "Link" },
  ];

  return (
    <div className="flex gap-1 mb-2">
      {buttons.map(({ icon: Icon, text, label }) => (
        <button
          key={label}
          onClick={() => onInsert(text)}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

export function MemberDetail({
  member,
  memberTypes,
  onClose,
  onBack,
  onSave,
  onDelete,
}: MemberDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email || "",
    phone: member.phone || "",
    address: member.address || "",
    postal_code: member.postal_code || "",
    city: member.city || "",
    country: member.country || "Deutschland",
    notes: member.notes || "",
    is_active: member.is_active,
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
      postal_code: member.postal_code || "",
      city: member.city || "",
      country: member.country || "Deutschland",
      notes: member.notes || "",
      is_active: member.is_active,
    });
    setIsEditing(false);
    setShowPreview(false);
  };

  const insertMarkdown = (text: string) => {
    setFormData((prev) => ({
      ...prev,
      notes: (prev.notes || "") + text,
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {(onClose || onBack) && (
            <button
              onClick={onBack || onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {member.first_name} {member.last_name}
          </h2>
          <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
            {member.member_number}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              member.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {member.is_active ? "Aktiv" : "Inaktiv"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={16} />
                Speichern
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={16} />
                Abbrechen
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 size={16} />
                Bearbeiten
              </button>
              {onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                  Löschen
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Persönliche Daten */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-gray-400" />
            Persönliche Daten
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <RequiredLabel label="Vorname" fieldKey="first_name" />
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <RequiredLabel label="Nachname" fieldKey="last_name" />
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span>{member.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>{member.phone || "-"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-400" />
            Adresse
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Straße
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div>{member.address || "-"}</div>
              <div>
                {member.postal_code || "-"} {member.city || ""}
              </div>
              <div>{member.country || "Deutschland"}</div>
            </div>
          )}
        </div>

        {/* Notizen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Notizen
          </h3>

          {isEditing ? (
            <div>
              <MarkdownToolbar onInsert={insertMarkdown} />
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`text-xs px-2 py-1 rounded ${!showPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`text-xs px-2 py-1 rounded ${showPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                >
                  Vorschau
                </button>
              </div>
              {showPreview ? (
                <div className="prose prose-sm max-w-none border border-gray-300 rounded-lg p-3 min-h-[150px]">
                  <ReactMarkdown>{formData.notes || ""}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Notizen in Markdown-Format..."
                />
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {member.notes ? (
                <ReactMarkdown>{member.notes}</ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">
                  Keine Notizen vorhanden.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mitglied löschen?
            </h3>
            <p className="text-gray-600 mb-4">
              Möchten Sie {member.first_name} {member.last_name} wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
