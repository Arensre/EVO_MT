# EVO_MT Design Dokumentation - Importer Modul

**Datum:** 2026-05-11  
**Version:** 1.2  
**Feature:** Importer / CSV Import-Export

---

## 📦 Importer Modul

### Übersicht

Das Importer-Modul ermöglicht den Import von Daten aus CSV-Dateien für Vereine, die bisher mit Excel gearbeitet haben.

**Ort im Menü:** Administration → Import / Export

### Funktionsweise

1. **Templates herunterladen**
   - CSV-Dateien mit korrektem Format für jedes Modul
   - Enthalten Header und Beispieldaten

2. **CSV hochladen**
   - Drag & Drop oder Datei-Auswahl
   - Modul-Auswahl vor dem Upload

3. **Vorschau & Import**
   - Datenvorschau vor dem endgültigen Import
   - Fehlerbehandlung und Validierung

### Verfügbare Module

| Modul | Felder im CSV |
|-------|---------------|
| **Mitglieder** | first_name, last_name, email, phone, address, postal_code, city, country, notes |
| **Kunden** | name, type, email, phone, address, postal_code, city, country, status, notes |
| **Lieferanten** | name, type, email, phone, address, postal_code, city, country, status, notes |

### CSV-Format

- **Trennzeichen:** Semikolon (;)
- **Kodierung:** UTF-8
- **Header:** Erste Zeile enthält Feldnamen
- **Zeilenumbruch:** \n

### Beispiel (Mitglieder)

```csv
first_name;last_name;email;phone;address;postal_code;city;country;notes
Max;Mustermann;max@example.com;0123-4567890;Musterstraße 1;12345;Musterstadt;Deutschland;Beispielnotiz
```

---

## 🏗️ Architektur

### Frontend

```
src/components/
├── Importer.tsx           # Hauptkomponente
├── Sidebar.tsx            # Menü-Eintrag hinzugefügt
└── types.ts               # 'importer' zu View-Typ hinzugefügt
```

### Backend

```
src/backend/src/
├── routes/
│   └── import.js          # API-Endpunkte
└── server.js               # Route registriert
```

### API-Endpunkte

| Methode | URL | Beschreibung |
|---------|-----|--------------|
| GET | `/api/import/template/:module` | CSV-Template herunterladen |
| POST | `/api/import/preview` | Vorschau der Daten (TODO) |
| POST | `/api/import/execute` | Import durchführen (TODO) |

---

## 📝 Technische Details

### Authentication

Alle Import-Endpunkte erfordern:
- Gültigen JWT-Token im Authorization-Header
- Schreibberechtigung für das jeweilige Modul

### Template-Generierung

```javascript
// Dynamische Template-Erstellung
const fields = fieldDefinitions[module];  // Modul-spezifische Felder
const header = fields.join(';') + '\n';   // CSV-Header
const sample = generateSampleData(module); // Beispieldaten
const csv = header + sample;              // Komplettes CSV
```

### Status

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| UI Design | ✅ | Komplett implementiert |
| Template Download | ✅ | Funktioniert |
| Modul-Auswahl | ✅ | Dropdown mit Infos |
| File Upload | ✅ | Drag & Drop + Click |
| Vorschau | 🔄 | UI vorhanden, API TODO |
| Import | 🔄 | UI vorhanden, API TODO |

---

## 🎯 Roadmap

### Version 1.2.1 (Geplant)
- [ ] CSV-Parsing mit Validierung
- [ ] Vorschau mit Fehleranzeige
- [ ] Batch-Import (Datenbank)
- [ ] Import-Historie
- [ ] Fehlerprotokoll

### Version 1.3.0 (Geplant)
- [ ] Excel-Import (.xlsx)
- [ ] Import-Mapping (Spalten zuordnen)
- [ ] Duplikats-Erkennung
- [ ] Rollback-Funktion

---

## 📋 Test-Checkliste

- [ ] Templates für alle 3 Module downloadbar
- [ ] CSV-Struktur korrekt
- [ ] Authentifizierung funktioniert
- [ ] UI responsive
- [ ] Menü-Eintrag sichtbar für Admins

---

## 🐛 Bekannte Issues

Keine

---

*Dokumentation erstellt: 2026-05-11*
