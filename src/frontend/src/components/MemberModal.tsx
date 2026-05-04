import { useState } from "react";
import { X } from "lucide-react";
import type { MemberFormData, MemberType, MemberFunction } from "../types";

interface MemberModalProps {
  isOpen: boolean;
  memberTypes: MemberType[];
  memberFunctions: MemberFunction[];
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
}

export function MemberModal({
  isOpen,
  memberTypes,
  memberFunctions,
  onClose,
  onSubmit,
}: MemberModalProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    member_type_id: undefined,
    member_function_id: undefined,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "Vorname ist erforderlich";
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Nachname ist erforderlich";
    }

    if (!formData.member_type_id) {
      newErrors.member_type_id = "Mitgliedsart ist erforderlich";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        member_type_id: undefined,
        member_function_id: undefined,
        is_active: true,
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      member_type_id: undefined,
      member_function_id: undefined,
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Neues Mitglied</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.first_name
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Max"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.last_name
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Mustermann"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitgliedsart *
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.member_type_id
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">-- Bitte wählen --</option>
                  {memberTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.member_type_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.member_type_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funktion
                </label>
                <select
                  value={formData.member_function_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      member_function_id: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Keine Funktion --</option>
                  {memberFunctions
                    .filter((f) => f.is_active)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((func) => (
                      <option key={func.id} value={func.id}>
                        {func.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail (optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="max@beispiel.de"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

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
