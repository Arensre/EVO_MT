# EVO_MT - Dokumentation v1.17.3

**Stand:** 2026-05-05 18:10 UTC  
**Version:** 1.17.3-2026-05-05-1806  
**Commit:** 2e6f204

---

## Übersicht

EVO_MT ist ein Event-Management-Tool für die Organisation von Events, Mitgliedern, Kunden und Lieferanten.

---

## Aktuelles UI-Design (v1.17.3)

### Farbcodierung nach Bereichen

| Bereich | Markierung | Buttons (Bearbeiten) | Buttons (Löschen) |
|---------|-----------|---------------------|-------------------|
| **Kunden** | Blau (`bg-blue-100`) | Blau (`bg-blue-600`) | Rot (`bg-red-600`) |
| **Lieferanten** | Gelb/Orange (`bg-amber-100`) | Blau (`bg-blue-600`) | Rot (`bg-red-600`) |
| **Mitglieder** | Grün (`bg-emerald-100`) | Blau (`bg-blue-600`) | Rot (`bg-red-600`) |
| **Mitgliedschaften** | Grün (`bg-emerald-100`) | Blau/Grün | Rot |

### Design-Elemente

#### Listen-Ansicht (alle Bereiche)
- **Eine weiße Kachel** (`bg-white rounded-lg shadow`) für die gesamte Liste
- **Trennlinien** (`divide-y divide-gray-200`) zwischen den Einträgen
- **Kompakte Einträge** ohne große Icons links
- **Farbige Markierung** bei Auswahl (je nach Bereich)

#### Header (alle Bereiche)
- **Einheitliche Größe:** `px-6 py-4`
- **Weißer Hintergrund:** `bg-white`
- **Unterer Rand:** `border-b border-gray-200`
- **Titel:** `text-2xl font-bold`

#### Detail-Ansicht
- **Hintergrund:** Grau (`bg-gray-50`)
- **Kacheln:** Weiß mit Schatten (`bg-white rounded-lg shadow`)
- **Buttons:** Vollfarbig (nicht nur Icons)

---

## Inline-Bearbeitung (NEU in v1.17.x)

### Mitgliedsarten & Funktionen

**Verfügbar in:** Mitgliedschaft-Details → Tabs "Mitgliedsarten" oder "Funktionen"

**Features:**
- **Bearbeiten-Button** (Pencil-Icon) in jeder Zeile
- **Inline-Editing:** Zeile wird zu Eingabefeldern beim Klick auf Bearbeiten
- **Dropdown** für Mitgliedsart/Funktion-Auswahl
- **Datumsfelder** mit Date-Picker (Von/Bis)
- **"Heute"-Button** neben dem Bis-Datum (setzt auf aktuelles Datum)
- **Speichern** (Check-Icon, grün) und **Abbrechen** (X-Icon, grau)
- **Alte Werte** werden als graue Tags unter den Datumsfeldern angezeigt

**Technisch:**
- `editingType` / `editingFunction` States
- `updateTypeMutation` / `updateFunctionMutation` für API-Calls
- PUT-Requests an `/api/members/{id}/type-history/{entryId}` bzw. `/function-history/{entryId}`

---

## Gantt-Diagramm / Zeitstrahl

**Verfügbar in:** Mitgliedschaft-Details → Tab "Zeitstrahl"

**Features:**
- **Dynamische Zeitachse:**
  - < 20 Jahre: Jedes Jahr angezeigt
  - ≥ 20 Jahre: Nur alle 5 Jahre
- **Legende:** Mitgliedsarten (blau) und Funktionen (gelb)
- **Balken:** Zeigen Zeitraum an
- **Tooltip:** Zeigt Details beim Hover

---

## Technische Details

### Build-System
- **Vite** für Frontend-Build
- **TypeScript** für Typisierung
- **Tailwind CSS** für Styling
- **Docker Compose** für Deployment

### Wichtige Befehle

```bash
# Frontend bauen
cd /home/openclaw/EVO_MT/src/frontend
npm run build

# Docker-Container neu bauen
cd /home/openclaw/EVO_MT
docker compose up -d --build frontend

# Version anpassen
# In src/frontend/src/components/Sidebar.tsx:
# const APP_VERSION = '1.x.x-YYYY-MM-DD-HHMM';
```

---

## Deployment-Status

- **Server:** 172.16.0.125
- **Container:** evo_mt_frontend läuft
- **Port:** 80 (HTTP)
- **Letztes Deployment:** 2026-05-05 18:10 UTC

---

## Versions-Historie

| Version | Datum | Beschreibung |
|---------|-------|--------------|
| 1.17.3 | 2026-05-05 | Heute-Button setzt undefined |
| 1.17.2 | 2026-05-05 | Heute-Button für End-Datum |
| 1.17.1 | 2026-05-05 | Update-Mutationen hinzugefügt |
| 1.17.0 | 2026-05-05 | Inline-Bearbeitung für Mitgliedsarten/Funktionen |
| 1.16.1 | 2026-05-05 | Dynamische Zeitachse (1/5 Jahre) |
| 1.16.0 | 2026-05-05 | Einheitliches UI-Design für alle Bereiche |
| 1.15.x | 2026-05-05 | Vorbereitungen für Inline-Bearbeitung |
| 1.14.x | 2026-05-05 | Listen-Design mit farbiger Markierung |

---

## Nächste Schritte (optional)

1. Mobile-Ansicht optimieren
2. Dark Mode implementieren
3. Export-Funktion für Listen
4. Erweiterte Filter-Optionen

---

*Dokumentation erstellt von R2*
