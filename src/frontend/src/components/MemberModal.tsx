import { useState, useEffect } from "react";
import { X, Asterisk, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import type { MemberFormData } from "../types";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
}

// All possible fields - matching MemberDetail.tsx
const allFieldDefinitions = [
  { key: "first_name", label: "Vorname", type: "text" },
  { key: "last_name", label: "Nachname", type: "text" },
  { key: "email", label: "E-Mail", type: "email" },
  { key: "phone", label: "Telefon", type: "tel" },
  { key: "address", label: "Straße", type: "text" },
  { key: "postal_code", label: "PLZ", type: "text" },
  { key: "city", label: "Ort", type: "text" },
  { key: "country", label: "Land", type: "text" },
];

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
          type="button"
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

// Fetch module settings for required fields
const fetchModuleSettings = async () => {
  const response = await axios.get("/api/module-settings/members");
  return response.data;
};

export function MemberModal({
  isOpen,
  onClose,
  onSubmit,
}: MemberModalProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
    country: "Deutschland",
    notes: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showNotesPreview, setShowNotesPreview] = useState(false);

  // Fetch required fields from module settings
  const { data: moduleSettings } = useQuery({
    queryKey: ["module-settings-members"],
    queryFn: fetchModuleSettings,
    enabled: isOpen,
  });

  // Get required fields from settings
  const requiredFields = moduleSettings?.required_fields || {};
  
  // Check if field is required
  const isRequiredField = (fieldKey: string): boolean => {
    // Always require first_name and last_name
    if (fieldKey === "first_name" || fieldKey === "last_name") return true;
    return requiredFields[fieldKey] === true;
  };

  // All fields should be visible in the modal (not just required ones)
  // Required fields are marked with a red asterisk
  const visibleFields = allFieldDefinitions;

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        postal_code: "",
        city: "",
        country: "Deutschland",
        notes: "",
        is_active: true,
      });
      setErrors({});
      setTouched({});
      setShowNotesPreview(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate all visible required fields
    visibleFields.forEach((field) => {
      if (isRequiredField(field.key)) {
        const value = formData[field.key as keyof MemberFormData];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          newErrors[field.key] = `${field.label} ist erforderlich`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      postal_code: "",
      city: "",
      country: "Deutschland",
      notes: "",
      is_active: true,
    });
    setErrors({});
    setTouched({});
    setShowNotesPreview(false);
    onClose();
  };

  const handleBlur = (fieldKey: string) => {
    setTouched({ ...touched, [fieldKey]: true });
    
    // Validate single field
    if (isRequiredField(fieldKey)) {
      const value = formData[fieldKey as keyof MemberFormData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        const fieldDef = allFieldDefinitions.find((f) => f.key === fieldKey);
        setErrors({
          ...errors,
          [fieldKey]: `${fieldDef?.label || fieldKey} ist erforderlich`,
        });
      } else {
        const { [fieldKey]: _, ...rest } = errors;
        setErrors(rest);
      }
    }
  };

  const renderField = (field: typeof allFieldDefinitions[0]) => {
    const isRequired = isRequiredField(field.key);
    const hasError = touched[field.key] && errors[field.key];
    const baseInputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-300 focus:ring-red-500 bg-red-50"
        : "border-gray-300 focus:ring-emerald-500"
    }`;

    const labelClass = "block text-sm font-medium mb-1 flex items-center gap-1 text-gray-700";

    const labelContent = (
      <>
        {field.label}
        {isRequired && (
          <Asterisk size={12} className="text-red-500 fill-red-500" />
        )}
      </>
    );

    return (
      <div key={field.key}>
        <label className={labelClass}>{labelContent}</label>
        <input
          type={field.type}
          value={(formData[field.key as keyof MemberFormData] as string) || ""}
          onChange={(e) =>
            setFormData({ ...formData, [field.key]: e.target.value })
          }
          onBlur={() => handleBlur(field.key)}
          className={baseInputClass}
          placeholder={field.label}
        />
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/30"
      onClick={handleClose}
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Neues Mitglied</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleFields.map(renderField)}
            </div>

            {/* Notes Field with Markdown Support */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1 flex items-center gap-1 text-gray-700">
                Notizen
                {isRequiredField("notes") && (
                  <Asterisk size={12} className="text-red-500 fill-red-500" />
                )}
              </label>
              <MarkdownToolbar 
                onInsert={(text) => 
                  setFormData({ ...formData, notes: (formData.notes || "") + text })
                } 
              />
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowNotesPreview(false)}
                  className={`text-xs px-2 py-1 rounded ${!showNotesPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotesPreview(true)}
                  className={`text-xs px-2 py-1 rounded ${showNotesPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                >
                  Vorschau
                </button>
              </div>
              {showNotesPreview ? (
                <div className="prose prose-sm max-w-none border border-gray-300 rounded-lg p-3 min-h-[150px] bg-white">
                  <ReactMarkdown>{formData.notes || ""}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  onBlur={() => handleBlur("notes")}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Notizen in Markdown-Format..."
                />
              )}
              {touched.notes && errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
