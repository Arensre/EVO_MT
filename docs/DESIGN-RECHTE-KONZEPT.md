# Design-Dokument: Rechte-Konzept & Modul-Visualisierung

**Version:** 1.0  
**Erstellt:** 2026-05-04  
**Autor:** R2 (AI Assistant)  
**Projekt:** EVO_MT

---

## 1. Übersicht

Dieses Dokument beschreibt das Rechte-Konzept für EVO_MT, insbesondere die Modul-basierte Berechtigungssteuerung und die Visualisierung von Pflichtfeldern.

---

## 2. Modul-Aktivierung

### 2.1 Datenbank-Struktur

```sql
CREATE TABLE module_settings (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(50) UNIQUE NOT NULL,  -- 'members', 'customers', 'suppliers'
  is_enabled BOOLEAN DEFAULT true,
  required_fields JSONB DEFAULT '{}',       -- {"email": true, "phone": false}
  allow_multiple_types BOOLEAN DEFAULT false,  -- Für Mitglieder: Mehrere Mitgliedsarten
  allow_multiple_functions BOOLEAN DEFAULT false, -- Für Mitglieder: Mehrere Funktionen
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 API-Endpunkte

| Methode | Endpoint | Beschreibung | Auth |
|---------|----------|--------------|------|
| GET | `/api/module-settings` | Alle Moduleinstellungen | Ja |
| GET | `/api/module-settings/:moduleName` | Einzelnes Modul | Ja |
| GET | `/api/module-settings/enabled` | Nur aktivierte Module | **Nein** (public) |
| PUT | `/api/module-settings/:moduleName` | Modul aktualisieren | Admin |

### 2.3 Frontend-Integration

```typescript
// Sidebar: Filterung basierend auf aktivierten Modulen
const { data: enabledModules } = useQuery({
  queryKey: ['enabled-modules'],
  queryFn: fetchEnabledModules,
});

const isModuleEnabled = (moduleName: string): boolean => {
  if (!enabledModules) return true; // Loading state
  return enabledModules.includes(moduleName);
};
```

### 2.4 Verhalten bei Deaktivierung

| Modul | Bei Deaktivierung |
|-------|-------------------|
| **Mitglieder** | Menüpunkt "Mitgliederverwaltung" ausblenden |
| **Kunden** | Untermenü "Kunden" unter ERP ausblenden |
| **Lieferanten** | Untermenü "Lieferanten" unter ERP ausblenden |
| **ERP** | Komplett ausblenden wenn Kunden UND Lieferanten deaktiviert |

---

## 3. Pflichtfelder-System

### 3.1 Konfiguration

Pflichtfelder werden pro Modul in `required_fields` als JSON gespeichert:

```json
{
  "email": true,
  "phone": true,
  "street": false,
  "postal_code": true
}
```

**Regel:** `true` = Pflichtfeld, `false` oder nicht vorhanden = Optional

### 3.2 Vordefinierte Pflichtfelder

Diese Felder sind **immer** Pflichtfelder (unabhängig von der Konfiguration):

| Modul | Feld | Begründung |
|-------|------|------------|
| Mitglieder | `first_name` | Grundlegende Identifikation |
| Mitglieder | `last_name` | Grundlegende Identifikation |
| Kunden | `name` | Grundlegende Identifikation |
| Lieferanten | `name` | Grundlegende Identifikation |

### 3.3 Visualisierung

#### 3.3.1 MemberModal (Neuanlage)

- **Rotes Sternchen** (★) neben dem Label bei Pflichtfeldern
- **Roter Rahmen** bei Validierungsfehlern
- **Live-Validierung** beim Verlassen des Feldes

```typescript
const RequiredLabel = ({ label, fieldKey }) => (
  <span className="flex items-center gap-1">
    {label}
    {isRequiredField(fieldKey) && (
      <Asterisk size={12} className="text-red-500 fill-red-500" />
    )}
  </span>
);
```

#### 3.3.2 MemberDetail (Bearbeitung)

- **Rotes Sternchen** (★) neben dem Label bei Pflichtfeldern
- **Gleiche Validierung** wie im Modal

### 3.4 Backend-Validierung

```typescript
// members.js
async function getModuleSettings(moduleName) {
  const result = await pool.query(
    'SELECT required_fields FROM module_settings WHERE module_name = $1',
    [moduleName]
  );
  return result.rows[0]?.required_fields || {};
}

function validateRequiredFields(data, requiredFields) {
  const errors = [];
  
  // Immer erforderlich
  if (!data.first_name?.trim()) errors.push('Vorname ist erforderlich');
  if (!data.last_name?.trim()) errors.push('Nachname ist erforderlich');
  
  // Modul-spezifisch
  for (const [field, isRequired] of Object.entries(requiredFields)) {
    if (isRequired && (!data[field] || data[field].toString().trim() === '')) {
      errors.push(`${fieldLabels[field]} ist erforderlich`);
    }
  }
  
  return errors;
}
```

---

## 4. UI-Komponenten

### 4.1 ModuleSettings.tsx

**Tabs:** Mitglieder | Kunden | Lieferanten

**Pro Tab:**
- Modul-Status (Aktiv/Inaktiv)
- Mitglieder-spezifische Einstellungen (Mehrere Arten/Funktionen)
- Pflichtfelder (ausklappbar)
  - Vordefinierte Felder (gelockt)
  - Zusätzliche Felder (hinzufügbar/entfernbar)

### 4.2 Sidebar.tsx

**Hauptmenüpunkte:**
- Home (immer)
- ERP (nur wenn Kunden ODER Lieferanten aktiviert)
  - Kunden (optional)
  - Lieferanten (optional)
- Mitgliederverwaltung (nur wenn Mitglieder aktiviert)
- Administration (immer, für Zugriff auf Moduleinstellungen)

**Filter-Logik:**
```typescript
// ERP nur anzeigen wenn mindestens ein Unterpunkt aktiv
const showErp = isModuleEnabled('customers') || isModuleEnabled('suppliers');

// Mitglieder nur wenn aktiviert
const showMembers = isModuleEnabled('members');
```

---

## 5. Erweiterung für neue Module

### 5.1 Schritt-für-Schritt

1. **Datenbank:** Eintrag in `module_settings` erstellen
2. **Backend:** API-Endpunkte für das neue Modul erstellen
3. **Frontend:** 
   - Felddefinitionen in `ModuleSettings.tsx` ergänzen
   - Sidebar-Filter erweitern
   - Modal/Detail-Komponenten erstellen

### 5.2 Vorlage für neue Felddefinition

```typescript
const fieldDefinitions = [
  // ... bestehende Felder
  { 
    key: 'neues_feld', 
    label: 'Neues Feld', 
    type: 'text' // oder 'select', 'date', 'textarea', 'email', 'tel'
  },
];
```

### 5.3 Sidebar-Integration

```typescript
// In Sidebar.tsx hinzufügen:
const showNewModule = isModuleEnabled('new_module');

{showNewModule && (
  <div className="mt-4">
    <button onClick={() => onViewChange('new_module')}>
      <NewIcon size={20} />
      {isOpen && <span>Neues Modul</span>}
    </button>
  </div>
)}
```

---

## 6. Versionierung

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.0 | 2026-05-04 | Erstellen des Design-Dokuments |

---

## 7. Anhänge

### 7.1 Nützliche Links

- Backend-Route: `/api/module-settings`
- Frontend-Seite: Administration → Module
- Datenbank-Tabelle: `module_settings`

### 7.2 Abhängigkeiten

- `@tanstack/react-query` für API-Abfragen
- `axios` für HTTP-Requests
- `lucide-react` für Icons (Asterisk)

---

*Dieses Dokument sollte bei jedem neuen Modul aktualisiert werden.*
