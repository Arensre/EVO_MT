# Changelog v1.19.10 - Kalender-Modul Implementierung

**Datum:** 2026-05-12  
**Version:** 1.19.10

---

## 🎯 Features

### Kalender-Modul mit Kategorie-Verwaltung

Das Kalender-Modul ist jetzt vollständig in die EVO Plattform integriert:

#### 1. Administration → Module → Kalender
- **Kategorie-Verwaltung**: Erstellen, Bearbeiten, Löschen von Terminkategorien
- **Farbcodierung**: Jede Kategorie hat eine eigene Farbe
- **Aktivier/Deaktivieren**: Kategorien können temporär deaktiviert werden
- **Toggle-Button**: Das gesamte Kalender-Modul kann aktiviert/deaktiviert werden

#### 2. Sidebar-Menü
- **Dynamische Sichtbarkeit**: "Vereinsaktivitäten" erscheint nur wenn Modul aktiv
- **Visuelles Feedback**: "Aktiv"-Badge im Tab wenn Modul eingeschaltet

#### 3. Frontend-Komponenten
- `CalendarSettings.tsx` - Verwaltung der Kategorien
- `Calendar.tsx` - Monats-, Wochen- und Listenansicht
- `EventModal.tsx` - Termin-Erstellung und -Bearbeitung

---

## 🔧 Technische Details

### Backend-API-Endpunkte
```
GET  /api/events/categories/all       - Alle Kategorien laden
POST /api/events/categories          - Neue Kategorie erstellen
PUT  /api/events/categories/:id       - Kategorie aktualisieren
DELETE /api/events/categories/:id      - Kategorie löschen
```

### Datenbank
- **Tabelle:** `event_categories`
- **Spalten:** id, name, color, description, is_active, created_at, updated_at
- **Tabelle:** `module_settings` (Eintrag für 'calendar' hinzugefügt)

### Module-Integration
- `isModuleEnabled('calendar')` steuert Sichtbarkeit im Menü
- `localSettings['calendar']` speichert Aktivierungsstatus

---

## 📁 Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/frontend/src/components/CalendarSettings.tsx` | NEU - Kategorie-Verwaltung |
| `src/frontend/src/components/ModuleSettings.tsx` | Kalender-Tab hinzugefügt |
| `src/frontend/src/components/Sidebar.tsx` | Modul-Sichtbarkeit |
| `src/backend/src/routes/events.js` | CRUD-Endpunkte für Kategorien |

---

## ✅ Tests

- [x] Kategorie erstellen
- [x] Kategorie bearbeiten
- [x] Kategorie löschen
- [x] Modul aktivieren/deaktivieren
- [x] Menü-Sichtbarkeit bei Deaktivierung
- [x] Farbauswahl funktioniert

---

*Letzte Aktualisierung: 2026-05-12*