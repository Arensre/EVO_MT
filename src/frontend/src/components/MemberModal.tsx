import { useState, useEffect } from "react";
import { X, Asterisk } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { MemberFormData, MemberType } from "../types";

interface MemberModalProps {
  isOpen: boolean;
  memberTypes: MemberType[];
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
}

// Field definitions with labels
const fieldDefinitions = [
  { key: "salutation", label: "Anrede", type: "select", options: ["Herr", "Frau", "Dr.", "Prof."] },
  { key: "title", label: "Titel", type: "text" },
  { key: "first_name", label: "Vorname", type: "text" },
  { key: "last_name", label: "Nachname", type: "text" },
  { key: "birth_name", label: "Geburtsname", type: "text" },
  { key: "birth_date", label: "Geburtsdatum", type: "date" },
  { key: "birth_place", label: "Geburtsort", type: "text" },
  { key: "gender", label: "Geschlecht", type: "select", options: ["männlich", "weiblich", "divers"] },
  { key: "marital_status", label: "Familienstand", type: "select", options: ["ledig", "verheiratet", "geschieden", "verwitwet"] },
  { key: "wedding_date", label: "Hochzeitsdatum", type: "date" },
  { key: "street", label: "Straße", type: "text" },
  { key: "postal_code", label: "PLZ", type: "text" },
  { key: "city", label: "Ort", type: "text" },
  { key: "country", label: "Land", type: "text" },
  { key: "email", label: "E-Mail", type: "email" },
  { key: "phone", label: "Telefon", type: "tel" },
  { key: "mobile", label: "Mobil", type: "tel" },
  { key: "member_type_id", label: "Mitgliedsart", type: "select_member_type" },
  { key: "entry_date", label: "Eintrittsdatum", type: "date" },
  { key: "profession", label: "Beruf", type: "text" },
  { key: "occupation", label: "Beschäftigung", type: "text" },
  { key: "notes", label: "Notizen", type: "textarea" },
];

// Fetch module settings for required fields
const fetchModuleSettings = async () => {
  const response = await axios.get("/api/module-settings/members");
  return response.data;
};

export function MemberModal({
  isOpen,
  memberTypes,
  onClose,
  onSubmit,
}: MemberModalProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    member_type_id: undefined,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch required fields from module settings
  const { data: moduleSettings } = useQuery({
    queryKey: ["module-settings-members"],
    queryFn: fetchModuleSettings,
    enabled: isOpen,
  });

  // Get required fields from settings
  const requiredFields = moduleSettings?.required_fields || {};
  
  // Predefined required fields (always required)
  const isRequiredField = (fieldKey: string): boolean => {
    if (fieldKey === "first_name" || fieldKey === "last_name") return true;
    return requiredFields[fieldKey] === true;
  };

  // Show ALL fields, not just configured ones
  const visibleFields = fieldDefinitions;

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        member_type_id: undefined,
        is_active: true,
      });
      setErrors({});
      setTouched({});
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
      member_type_id: undefined,
      is_active: true,
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleBlur = (fieldKey: string) => {
    setTouched({ ...touched, [fieldKey]: true });
    
    // Validate single field
    if (isRequiredField(fieldKey)) {
      const value = formData[fieldKey as keyof MemberFormData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        const fieldDef = fieldDefinitions.find((f) => f.key === fieldKey);
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

  const renderField = (field: typeof fieldDefinitions[0]) => {
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

    switch (field.type) {
      case "select":
        return (
          <div key={field.key}>
            <label className={labelClass}>{labelContent}</label>
            <select
              value={(formData[field.key as keyof MemberFormData] as string) || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              onBlur={() => handleBlur(field.key)}
              className={baseInputClass}
            >
              <option value="">-- Bitte wählen --</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
            )}
          </div>
        );

      case "select_member_type":
        return (
          <div key={field.key}>
            <label className={labelClass}>{labelContent}</label>
            <select
              value={formData.member_type_id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  member_type_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              onBlur={() => handleBlur(field.key)}
              className={baseInputClass}
            >
              <option value="">-- Bitte wählen --</option>
              {memberTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.key} className="col-span-2">
            <label className={labelClass}>{labelContent}</label>
            <textarea
              value={(formData[field.key as keyof MemberFormData] as string) || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              onBlur={() => handleBlur(field.key)}
              className={`${baseInputClass} min-h-[80px]`}
              rows={3}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.key}>
            <label className={labelClass}>{labelContent}</label>
            <input
              type="date"
              value={(formData[field.key as keyof MemberFormData] as string) || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              onBlur={() => handleBlur(field.key)}
              className={baseInputClass}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
            )}
          </div>
        );

      default:
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
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Neues Mitglied</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Felder mit <Asterisk size={10} className="inline text-red-500 fill-red-500" /> sind Pflichtfelder
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields always first */}
              <div className="grid grid-cols-2 gap-4">
                {renderField(fieldDefinitions.find((f) => f.key === "first_name")!)}
                {renderField(fieldDefinitions.find((f) => f.key === "last_name")!)}
              </div>

              {/* Other visible fields */}
              <div className="grid grid-cols-2 gap-4">
                {visibleFields
                  .filter((f) => f.key !== "first_name" && f.key !== "last_name" && f.key !== "notes")
                  .map((field) => renderField(field))}
              </div>

              {/* Notes field (full width) */}
              {visibleFields.some((f) => f.key === "notes") &&
                renderField(fieldDefinitions.find((f) => f.key === "notes")!)}

              {/* Active checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-700"
                >
                  Aktives Mitglied
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Mitglied anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
