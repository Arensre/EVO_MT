import { useState, useEffect } from "react";
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
  Code,
  Eye,
  Trash2,
  Plus,
  Calendar,
  Briefcase,
  Award,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Member, MemberType, MemberFormData } from "../types";

interface MemberFunction {
  id?: number;
  title: string;
  from_date: string;
  to_date?: string;
}

interface MemberDetailProps {
  member: Member;
  memberTypes: MemberType[];
  onClose?: () => void;
  onBack?: () => void;
  onSave: (data: MemberFormData) => void;
  onDelete?: () => void;
  isMobile?: boolean;
}

// Helper to format date for display (DD.MM.YYYY)
function formatDateGerman(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE");
}

// Helper to parse German date (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
function parseGermanDate(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split(".");
  if (parts.length !== 3) return dateString; // Return as-is if not German format
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Helper to format ISO date to German input format (DD.MM.YYYY)
function formatDateForGermanInput(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
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
    <div className="flex gap-1 p-2 bg-gray-100 rounded-t-lg border-b border-gray-200">
      {buttons.map(({ icon: Icon, text, label }) => (
        <button
          key={label}
          onClick={() => onInsert(text)}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
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
  isMobile,
}: MemberDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "membership">("general");
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email || "",
    phone: member.phone || "",
    address: member.address || "",
    postal_code: member.postal_code || "",
    city: member.city || "",
    country: member.country || "Germany",
    birth_date: member.birth_date,
    member_type_id: member.member_type_id,
    entry_date: member.entry_date,
    join_date: member.join_date,
    notes: member.notes || "",
    is_active: member.is_active ?? true,
    status: member.status || "active",
  });

  // Member functions state
  const [memberFunctions, setMemberFunctions] = useState<MemberFunction[]>([]);
  const [newFunction, setNewFunction] = useState<Partial<MemberFunction>>({
    title: "",
    from_date: "",
    to_date: "",
  });
  const [showAddFunction, setShowAddFunction] = useState(false);

  // Load member functions from API
  useEffect(() => {
    const loadMemberFunctions = async () => {
      try {
        const response = await fetch(`/api/members/${member.id}/functions`);
        if (response.ok) {
          const data = await response.json();
          setMemberFunctions(data);
        }
      } catch (error) {
        console.error("Failed to load member functions:", error);
      }
    };

    if (member.id) {
      loadMemberFunctions();
    }
  }, [member.id]);

  useEffect(() => {
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
      postal_code: member.postal_code || "",
      city: member.city || "",
      country: member.country || "Germany",
      birth_date: member.birth_date,
      member_type_id: member.member_type_id,
      entry_date: member.entry_date,
      join_date: member.join_date,
      notes: member.notes || "",
      is_active: member.is_active ?? true,
      status: member.status || "active",
    });
  }, [member]);

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
      country: member.country || "Germany",
      birth_date: member.birth_date,
      member_type_id: member.member_type_id,
      entry_date: member.entry_date,
      join_date: member.join_date,
      notes: member.notes || "",
      is_active: member.is_active ?? true,
      status: member.status || "active",
    });
    setIsEditing(false);
  };

  const insertMarkdown = (text: string) => {
    setFormData({ ...formData, notes: (formData.notes || "") + text });
  };

  const handleAddFunction = async () => {
    if (newFunction.title && newFunction.from_date) {
      const funcToAdd = {
        ...newFunction,
        from_date: parseGermanDate(newFunction.from_date),
        to_date: newFunction.to_date ? parseGermanDate(newFunction.to_date) : undefined,
      };
      
      try {
        const response = await fetch(`/api/members/${member.id}/functions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(funcToAdd),
        });
        
        if (response.ok) {
          const savedFunction = await response.json();
          setMemberFunctions([...memberFunctions, savedFunction]);
        } else {
          // Fallback: add locally if API fails
          setMemberFunctions([
            ...memberFunctions,
            {
              id: Date.now(),
              title: newFunction.title,
              from_date: parseGermanDate(newFunction.from_date),
              to_date: newFunction.to_date ? parseGermanDate(newFunction.to_date) : undefined,
            },
          ]);
        }
      } catch (error) {
        // Fallback: add locally if API fails
        setMemberFunctions([
          ...memberFunctions,
          {
            id: Date.now(),
            title: newFunction.title,
            from_date: parseGermanDate(newFunction.from_date),
            to_date: newFunction.to_date ? parseGermanDate(newFunction.to_date) : undefined,
          },
        ]);
      }
      
      setNewFunction({ title: "", from_date: "", to_date: "" });
      setShowAddFunction(false);
    }
  };

  const handleDeleteFunction = async (id: number) => {
    try {
      const response = await fetch(`/api/members/${member.id}/functions/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setMemberFunctions(memberFunctions.filter((f) => f.id !== id));
      } else {
        // Fallback: delete locally if API fails
        setMemberFunctions(memberFunctions.filter((f) => f.id !== id));
      }
    } catch (error) {
      // Fallback: delete locally if API fails
      setMemberFunctions(memberFunctions.filter((f) => f.id !== id));
    }
  };

  const fullName = `${member.first_name} ${member.last_name}`;
  const memberTypeName =
    memberTypes.find((t) => t.id === member.member_type_id)?.name || "";

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
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
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
                {onDelete && (
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-4">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "general"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User size={16} />
            Allgemein
          </button>
          <button
            onClick={() => setActiveTab("membership")}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "membership"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award size={16} />
            Mitgliedschaft
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {activeTab === "general" && (
          <>
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
                        Vorname *
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
                        Nachname *
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
                      Geburtsdatum
                    </label>
                    <input
                      type="text"
                      placeholder="TT.MM.JJJJ"
                      value={formatDateForGermanInput(formData.birth_date)}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: parseGermanDate(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Vorname</label>
                    <p className="text-gray-900">{member.first_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nachname</label>
                    <p className="text-gray-900">{member.last_name}</p>
                  </div>
                  {member.birth_date && (
                    <div>
                      <label className="text-sm text-gray-500">Geburtsdatum</label>
                      <p className="text-gray-900">
                        {formatDateGerman(member.birth_date)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kontaktdaten */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-gray-400" />
                Kontaktdaten
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stadt
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
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.address && (
                    <div>
                      <label className="text-sm text-gray-500">Adresse</label>
                      <p className="text-gray-900">{member.address}</p>
                    </div>
                  )}
                  {(member.postal_code || member.city) && (
                    <div>
                      <label className="text-sm text-gray-500">Ort</label>
                      <p className="text-gray-900">
                        {member.postal_code} {member.city}
                      </p>
                    </div>
                  )}
                  {member.country && (
                    <div>
                      <label className="text-sm text-gray-500">Land</label>
                      <p className="text-gray-900">{member.country}</p>
                    </div>
                  )}
                  {member.email && (
                    <div>
                      <label className="text-sm text-gray-500">E-Mail</label>
                      <a
                        href={`mailto:${member.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail size={14} />
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.phone && (
                    <div>
                      <label className="text-sm text-gray-500">Telefon</label>
                      <a
                        href={`tel:${member.phone}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Phone size={14} />
                        {member.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notizen mit Markdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-gray-400" />
                Notizen
              </h3>

              {isEditing ? (
                <div>
                  <MarkdownToolbar onInsert={insertMarkdown} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Code size={14} />
                        Markdown
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="# Überschrift\n\n- Listenpunkt\n- **fett** oder *kursiv*\n\n[Link](https://...)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Eye size={14} />
                        Vorschau
                      </label>
                      <div className="w-full h-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-auto prose prose-sm max-w-none">
                        {formData.notes ? (
                          <ReactMarkdown>{formData.notes}</ReactMarkdown>
                        ) : (
                          <p className="text-gray-400 italic">Vorschau...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                  {member.notes ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{member.notes}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      Keine Notizen vorhanden. Klicken Sie auf Bearbeiten, um
                      Notizen hinzuzufügen.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "membership" && (
          <>
            {/* Mitgliedschaftsdaten */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={20} className="text-gray-400" />
                Mitgliedschaftsdetails
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mitgliedsart
                    </label>
                    <select
                      value={formData.member_type_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          member_type_id: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Bitte wählen --</option>
                      {memberTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eintrittsdatum
                      </label>
                      <input
                        type="text"
                        placeholder="TT.MM.JJJJ"
                        value={formatDateForGermanInput(formData.entry_date)}
                        onChange={(e) =>
                          setFormData({ ...formData, entry_date: parseGermanDate(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beitrittsdatum
                      </label>
                      <input
                        type="text"
                        placeholder="TT.MM.JJJJ"
                        value={formatDateForGermanInput(formData.join_date)}
                        onChange={(e) =>
                          setFormData({ ...formData, join_date: parseGermanDate(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active ?? true}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium text-gray-700"
                    >
                      Aktives Mitglied
                    </label>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Mitgliedsart</label>
                    <p className="text-gray-900">{memberTypeName || "-"}</p>
                  </div>
                  {member.entry_date && (
                    <div>
                      <label className="text-sm text-gray-500">Eintrittsdatum</label>
                      <p className="text-gray-900">
                        {formatDateGerman(member.entry_date)}
                      </p>
                    </div>
                  )}
                  {member.join_date && (
                    <div>
                      <label className="text-sm text-gray-500">Beitrittsdatum</label>
                      <p className="text-gray-900">
                        {formatDateGerman(member.join_date)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-sm ${
                        member.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Mitgliedsnummer</label>
                    <p className="text-gray-900 font-mono">{member.member_number}</p>
                  </div>
                  {member.created_at && (
                    <div>
                      <label className="text-sm text-gray-500">Erstellt am</label>
                      <p className="text-gray-900">
                        {formatDateGerman(member.created_at)}
                      </p>
                    </div>
                  )}
                  {member.updated_at && (
                    <div>
                      <label className="text-sm text-gray-500">
                        Letzte Änderung
                      </label>
                      <p className="text-gray-900">
                        {formatDateGerman(member.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mitgliedsfunktionen */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase size={20} className="text-gray-400" />
                  Mitgliedsfunktionen
                </h3>
                <button
                  onClick={() => setShowAddFunction(!showAddFunction)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Funktion hinzufügen
                </button>
              </div>

              {/* Add Function Form */}
              {showAddFunction && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Neue Funktion hinzufügen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bezeichnung *
                      </label>
                      <input
                        type="text"
                        value={newFunction.title || ""}
                        onChange={(e) =>
                          setNewFunction({ ...newFunction, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="z.B. Vorsitzender"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Von *
                      </label>
                      <div className="relative">
                        <Calendar
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="TT.MM.JJJJ"
                          value={newFunction.from_date || ""}
                          onChange={(e) =>
                            setNewFunction({
                              ...newFunction,
                              from_date: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bis (optional)
                      </label>
                      <div className="relative">
                        <Calendar
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="TT.MM.JJJJ"
                          value={newFunction.to_date || ""}
                          onChange={(e) =>
                            setNewFunction({
                              ...newFunction,
                              to_date: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowAddFunction(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleAddFunction}
                      disabled={!newFunction.title || !newFunction.from_date}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              )}

              {/* Functions List */}
              {memberFunctions.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Noch keine Funktionen vorhanden.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Klicken Sie auf "Funktion hinzufügen", um eine neue Funktion zu erstellen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberFunctions.map((func) => (
                    <div
                      key={func.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Briefcase size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {func.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>
                              {formatDateGerman(func.from_date)}
                              {func.to_date
                                ? ` - ${formatDateGerman(func.to_date)}`
                                : " - heute"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => func.id && handleDeleteFunction(func.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Funktion löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
