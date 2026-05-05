# EVO_MT - Dokumentation v1.15.0

**Stand:** 2026-05-05 11:28 UTC  
**Version:** 1.15.0-2026-05-05-1123  
**Commit:** 3c78aac

---

## Übersicht

EVO_MT ist ein Event-Management-Tool für die Organisation von Events, Mitglieder, Kunden und Lieferanten.

---

## Aktuelles UI-Design (v1.15.0)

### Farbcodierung nach Bereichen

| Bereich | Markierung | Buttons (Bearbeiten) | Buttons (Löschen) |
|---------|-----------|---------------------|-------------------|
| **Kunden** | Blau (`bg-blue-100`) | Blau (`bg-blue-600`) | Rot (`bg-red-600`) |
| **Lieferanten** | Gelb/Orange (`bg-amber-100`) | Blau (`bg-blue-600`) | Rot (`bg-red-600`) |
| **Mitglieder** | Grün (`bg-emerald-100`) | Blau (`bg-blue-600`) | Rot (`bg-red-600`) |
| **Mitgliedschaften** | Grün (`bg-emerald-100`) | - | - |

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

## Komponenten-Übersicht

### CustomerList.tsx
- Zeigt Kunden in Listenform
- Blaue Markierung bei Auswahl
- Filter: Suche, Typ

### SupplierList.tsx
- Zeigt Lieferanten in Listenform
- Gelbe/Orange Markierung bei Auswahl
- Filter: Lieferant, Ansprechpartner

### MemberList.tsx
- Zeigt Mitglieder in Listenform
- Grüne Markierung bei Auswahl
- Filter: Suche, Mitgliederart, Status

### MembershipManagement.tsx
- Zeigt Mitgliedschaften
- Grüne Markierung bei Auswahl
- Tabs für Mitgliedsarten, Funktionen, Zeitleiste

### MemberDetail.tsx
- Detail-Ansicht für Mitglieder
- Grauer Hintergrund, weiße Kacheln
- Vollfarbige Buttons (blau/rot)

### CustomerDetail.tsx / SupplierDetail.tsx
- Detail-Ansichten
- Ähnliches Design wie MemberDetail
- Vollfarbige Buttons

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
# const APP_VERSION = '1.x.x-YYYY-MM-DD-HHMM'
```

---

## Deployment-Status

- **Server:** 172.16.0.125
- **Container:** evo_mt_frontend läuft
- **Port:** 80 (HTTP)
- **Letztes Deployment:** 2026-05-05 11:28 UTC

---

## Nächste Schritte (optional)

1. Header-Größen final vereinheitlichen (alle Bereiche prüfen)
2. Mobile-Ansicht optimieren
3. Dark Mode implementieren

---

*Dokumentation erstellt von R2*