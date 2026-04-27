# EVO_MT Design Guide

**Version:** 1.0  
**Letzte Aktualisierung:** 2026-04-27

---

## 🎨 Farbpalette

### Primärfarben

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| **Blau** | `#3B82F6` | Primäre Aktionen, Buttons (Speichern, Bearbeiten), Links |
| **Blau-Hover** | `#2563EB` | Hover-Zustand für primäre Buttons |
| **Grün** | `#10B981` | Erfolg, Positive Aktionen, "Neu"-Buttons, Bestätigungen |
| **Grün-Hover** | `#059669` | Hover-Zustand für grüne Buttons |

### Status-Farben

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| **Rot** | `#DC2626` | Löschen, Fehler, Warnungen, Gefahren |
| **Rot-Hover** | `#B91C1C` | Hover-Zustand für Löschen-Buttons |
| **Gelb/Amber** | `#F59E0B` | Filter aktiv, Warnungen, Hinweise |
| **Gelb-Hover** | `#D97706` | Hover für Filter-Buttons |

### Neutrale Farben

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| **Schwarz** | `#111827` | Haupttext, Überschriften |
| **Dunkelgrau** | `#6B7280` | Sekundärtext, Labels, Platzhalter |
| **Grau** | `#9CA3AF` | Deaktivierte Elemente, Icons |
| **Hellgrau** | `#F3F4F6` | Hintergründe, Zeilen abwechselnd |
| **Weiß** | `#FFFFFF` | Karten-Hintergrund, Seitenhintergrund |
| **Rahmen** | `#E5E7EB` | Borders, Divider, Trennlinien |

### Spezielle Farben

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| **Gold/Amber** | `#F59E0B` | Hauptansprechpartner (⭐ Badge) |
| **Emerald** | `#10B981` | "Neuer Kunde" / "Hinzufügen" Buttons |
| **Primary-500** | `#3B82F6` | Sidebar-Aktiv, Hauptnavigation |

---

## 🏗️ Layout-Prinzipien

### 1. Container & Abstände

```
Seite: p-6 (padding: 1.5rem / 24px)
Karten: rounded-lg + shadow + p-6
Innenabstand in Karten: space-y-6 (24px zwischen Elementen)
```

### 2. Grid-System

```
Desktop: 2-spaltig (w-1/2 w-1/2)
Tablet: 1-spaltig mit Seitenleiste
Mobile: Single-View, kein Split
```

### 3. Split-View Layout (Desktop)

```
Linke Seite: Kundenliste (w-1/2)
Rechte Seite: Detailansicht (w-1/2)
Übergang: transition-all duration-300
```

### 4. Mobile Layout

```
Liste → Detail (einzelne Ansicht)
Zurück-Button: Pfeil-Icon + Text
Slide-Animation für Übergang
```

---

## 🔘 Buttons

### Primärer Button (Speichern, Bearbeiten)

```tsx
className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
```

### Gefahren-Button (Löschen)

```tsx
className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
```

### Hinzufügen-Button (Neuer Kunde, Ansprechpartner)

```tsx
className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
// Mit Tooltip für Icon-Only Buttons
```

### Icon-Only Buttons

```tsx
// Mit Tooltip
className="relative group p-3 bg-emerald-600 text-white rounded-lg"
// Tooltip-Text als Span mit group-hover
```

### Sekundärer Button (Abbrechen)

```tsx
className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
```

### Filter-Button

```tsx
// Inaktiv:
className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"

// Aktiv (Filter gesetzt):
className="p-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
```

---

## 📝 Typografie

### Überschriften

| Element | Größe | Gewicht | Farbe |
|---------|-------|---------|-------|
| H1 (Seitentitel) | text-4xl (36px) | font-bold | text-gray-900 |
| H2 (Abschnitte) | text-2xl (24px) | font-bold | text-gray-900 |
| H3 (Karten-Titel) | text-lg (18px) | font-semibold | text-gray-900 |

### Text

| Element | Größe | Gewicht | Farbe |
|---------|-------|---------|-------|
| Haupttext | text-base (16px) | font-normal | text-gray-900 |
| Sekundär | text-sm (14px) | font-normal | text-gray-500 |
| Klein | text-xs (12px) | font-normal | text-gray-400 |
| Code/Nummern | font-mono | - | text-gray-600 |

### Links

```tsx
className="text-blue-600 hover:underline"
// Für Mailto: und Tel: Links
```

---

## 🎭 Icons

### Icon-Größen

| Verwendung | Größe |
|------------|-------|
| Buttons (mit Text) | size={18} |
| Icon-Only Buttons | size={20} |
| In-Text Icons | size={14} |
| Überschriften | size={20} |
| Sidebar | size={24} |

### Icon-Set

**Lucide React** wird verwendet:
- Import: `import { IconName } from 'lucide-react';`
- Alle Icons konsistent aus derselben Bibliothek

### Häufige Icons

| Aktion | Icon |
|--------|------|
| Speichern | `Save` |
| Bearbeiten | `Edit2` oder `Edit3` |
| Löschen | `Trash2` |
| Hinzufügen | `Plus` |
| Zurück | `ArrowLeft` |
| Schließen | `X` |
| Suchen | `Search` |
| Filter | `Filter` |
| Filter zurücksetzen | `RotateCcw` |
| Kunden | `Users` |
| Firma | `Building2` |
| Verein | `Users` (mit context) |
| Privat | `User` |
| Ansprechpartner | `UserSearch` |
| E-Mail | `Mail` |
| Telefon | `Phone` |
| Adresse | `MapPin` |
| Notizen | `FileText` |
| Stern | `Star` |
| Warnung | `AlertTriangle` |

---

## 📦 Karten & Container

### Standard-Karte

```tsx
className="bg-white rounded-lg shadow p-6"
```

### Karte mit Hover-Effekt (Liste)

```tsx
className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
```

### Ausgewählte Karte (in Liste)

```tsx
className="p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-blue-50 border-l-4 border-blue-500"
```

### Filter-Bereich

```tsx
className="bg-gray-50 rounded-lg p-4 border border-gray-200"
```

---

## 🏷️ Badges & Chips

### Standard Badge (Typ-Label)

```tsx
className="px-2 py-0.5 bg-gray-100 rounded text-xs"
```

### Kundennummer

```tsx
className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded"
```

### Status Aktiv

```tsx
className="px-2 py-1 rounded text-sm bg-green-100 text-green-700"
```

### Status Inaktiv

```tsx
className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700"
```

### Hauptansprechpartner

```tsx
className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full"
// Mit Star-Icon
```

### Aktive Filter-Chips

```tsx
// Kunden-Filter:
className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"

// Ansprechpartner-Filter:
className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
```

---

## 🧭 Navigation

### Sidebar

```tsx
// Aktiver Menüpunkt:
className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 border-r-4 border-primary-500"

// Inaktiver Menüpunkt:
className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
```

### Sidebar-Größen

- Breite: `w-64` (16rem / 256px)
- Collapsed: `w-20` (nur Icons)

---

## 📋 Formulare

### Input-Felder

```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

### Label

```tsx
className="block text-sm font-medium text-gray-700 mb-1"
```

### Pflichtfeld-Markierung

```tsx
<label>
  Name <span className="text-red-500">*</span>
</label>
```

### Grid für Formularfelder

```tsx
// 2-spaltig:
className="grid grid-cols-2 gap-4"

// 3-spaltig:
className="grid grid-cols-3 gap-4"
```

---

## 💬 Modals

### Modal-Overlay

```tsx
className="fixed inset-0 z-50 overflow-y-auto"
// Hintergrund:
className="fixed inset-0 bg-gray-900 bg-opacity-50"
```

### Modal-Container

```tsx
className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10"
// oder max-w-md für kleine Modals (Löschen-Bestätigung)
```

### Modal-Titel

```tsx
className="text-lg font-medium text-gray-900"
```

---

## 📱 Responsive Design

### Breakpoints

```
Mobile: < 640px (default)
Tablet: 640px - 1024px (sm:, md:)
Desktop: > 1024px (lg:)
```

### Mobile-First Ansatz

```tsx
// Basis (Mobile):
className="w-full"

// Desktop:
className="w-full md:w-1/2"
```

### Split-View Bedingungen

```tsx
const isDesktop = window.innerWidth >= 1024;

// Desktop: Split-View
// Mobile: Single-View mit Navigation
```

---

## 🎯 Best Practices

1. **Konsistenz:** Immer dieselben Farben für dieselben Zwecke verwenden
2. **Hover-Zustände:** Nie vergessen - bessere UX
3. **Transitions:** Immer `transition-colors` für Farbänderungen
4. **Abstände:** space-y-4 oder space-y-6 für vertikale Abstände
5. **Rahmen:** rounded-lg für Karten, rounded-full für Badges
6. **Icons:** Mit Text für primäre Aktionen, Icon-only mit Tooltip für Sekundäre
7. **Shadows:** shadow für Karten, shadow-xl für Modals
8. **Z-Index:** z-50 für Modals, z-40 für Overlays

---

## 📁 Datei-Struktur (Frontend)

```
src/
├── components/
│   ├── customers/
│   │   ├── CustomerList.tsx      # Liste mit Filter
│   │   ├── CustomerDetail.tsx    # Detail + Ansprechpartner
│   │   ├── CustomerModal.tsx     # Neu/Bearbeiten
│   │   └── CustomerForm.tsx      # Formular-Logik
│   ├── suppliers/                # (analog zu customers)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── ui/                       # Wiederverwendbare UI-Elemente
├── api.ts                        # API-Funktionen
├── types.ts                      # TypeScript Interfaces
└── App.tsx                       # Haupt-Routing
```

---

## 🚀 Deployment-Checkliste

- [ ] Alle Farben konsistent verwendet?
- [ ] Hover-Zustände vorhanden?
- [ ] Mobile-View getestet?
- [ ] Icons korrekt importiert?
- [ ] Keine festen Pixel-Werte (nur Tailwind-Klassen)?

---

*Dieser Design Guide ist ein Lebendes Dokument und sollte bei neuen Features erweitert werden.*
