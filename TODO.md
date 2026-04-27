# Event-ERP TODO

**Letzte Aktualisierung:** 2026-04-27 21:27 UTC

---

## 🔴 Blockiert / Warte auf Input

_Keine aktiven Blocker._

---

## 🟢 Nächste Aufgaben (nacheinander abarbeiten)

### 1. Lieferantenverwaltung [Priorität: Hoch]
- [ ] **Datenbank:** suppliers Tabelle erstellen (analog customers)
  - Felder: id, supplier_number (L00001), name, type, email, phone, address, postal_code, city, country, tax_id, notes, status, created_at, updated_at
  - persons Tabelle erweitern: optional supplier_id hinzufügen
- [ ] **Backend:** REST API Endpunkte für Lieferanten
  - GET /api/suppliers, GET /api/suppliers/:id, POST /api/suppliers, PUT /api/suppliers/:id, DELETE /api/suppliers/:id
  - GET /api/suppliers/:id/persons
  - Automatische supplier_number Generierung (L00001, L00002...)
- [ ] **Frontend:** SupplierList.tsx, SupplierDetail.tsx, SupplierModal.tsx
  - Analog zu Customer-Komponenten
  - Ansprechpartner für Lieferanten
- [ ] **Navigation:** Sidebar erweitern mit "Lieferanten" Menüpunkt
- [ ] **App.tsx:** Route für Lieferanten hinzufügen
- [ ] **Deployment:** Git commit, push, Docker rebuild

### 2. Benutzerverwaltung mit Authentication [Priorität: Hoch]
- [ ] **Datenbank:** users Tabelle erstellen
  - Felder: id, username (unique), email (unique), password_hash, role (admin/user/readonly), first_name, last_name, is_active, last_login, created_at, updated_at
  - sessions Tabelle (optional): id, user_id, token, expires_at
- [ ] **Backend:** Authentication implementieren
  - npm install bcrypt jsonwebtoken
  - JWT Middleware erstellen (auth.js)
  - Endpunkte: POST /api/auth/login, POST /api/auth/logout, POST /api/auth/refresh
  - User-Endpunkte: GET /api/users/me, GET /api/users (admin only), POST /api/users (admin), PUT /api/users/:id, DELETE /api/users/:id (admin)
  - Rollen-Prüfung: requireAuth, requireAdmin
  - Geschützte Routen: Alle /api/customers/*, /api/suppliers/*, /api/persons/*
- [ ] **Frontend:** Authentication Flow
  - LoginPage.tsx (Login-Formular)
  - AuthContext.tsx (React Context für Auth-Status)
  - ProtectedRoute.tsx (geschützte Seiten)
  - UserProfile.tsx (eigene Daten anzeigen/bearbeiten)
  - UserManagement.tsx (nur admin: User verwalten)
  - Logout-Button in Sidebar
  - Axios Interceptor für JWT Token
- [ ] **Sicherheit:**
  - Passwörter mit bcrypt hashen (salt rounds: 10)
  - JWT Secret aus .env
  - Token-Ablauf nach 24h
  - Rate-Limiting für Login (5 Versuche pro Minute)
- [ ] **Default User:** admin/admin123 (muss bei erstem Login geändert werden)
- [ ] **Deployment:** Git commit, push, Docker rebuild

### 3. Materialverwaltung [Priorität: Mittel]
- [ ] **Datenbank:** Tabellen erstellen
  - materials: id, material_number (M00001), name, description, category_id, unit, current_stock, min_stock_level, location_id, supplier_id, price_per_unit, currency, barcode, status, notes, created_at, updated_at
  - material_categories: id, name, description, color, parent_id
  - storage_locations: id, name, description, building, floor, room
  - material_movements: id, material_id, type (in/out/adjustment), quantity, unit_price, reference_type, reference_id, notes, created_by, created_at
- [ ] **Backend:** Material API
  - CRUD für Materialien: GET/POST/PUT/DELETE /api/materials
  - CRUD für Kategorien: /api/material-categories
  - CRUD für Lagerorte: /api/storage-locations
  - Buchungen: POST /api/materials/:id/movements, GET /api/materials/:id/movements
  - Automatische material_number Generierung (M00001)
  - Mindestbestand-Check
- [ ] **Frontend:** Materialverwaltung
  - MaterialList.tsx (Tabelle mit Filter, Ampel-System für Bestände)
  - MaterialDetail.tsx (Bestandsanzeige, Buchungshistorie)
  - MaterialModal.tsx (anlegen/bearbeiten)
  - MovementModal.tsx (Zugang/Abgang buchen)
  - MaterialCategories.tsx (nur admin)
  - StorageLocations.tsx (nur admin)
- [ ] **Features:**
  - Ampel-System: 🟢 OK, 🟡 Niedrig, 🔴 Kritisch (< min_stock)
  - Schnell-Buchung: +/- Buttons in Liste
  - Filter "Niedrige Bestände"
  - Bewegungsprotokoll pro Material
  - Berichte (Export CSV)
- [ ] **Navigation:** Sidebar erweitern mit "Material"
- [ ] **Deployment:** Git commit, push, Docker rebuild

---

## ✅ Erledigt

- [x] **Design Guide erstellen** [done: 2026-04-27]
  - Farbpalette, Layout-Prinzipien, Button-Stile, Typographie
  - Icon-Verwendung, Responsive Design, Best Practices
  - Datei: docs/DESIGN-GUIDE.md
  - Commit: acb0a2c

- [x] **Kundenverwaltung** [done: 2026-04-27]
  - CRUD für Kunden
  - Ansprechpartner mit Bestätigungsdialog
  - Filter für Kunden und Ansprechpartner
  - Split-View Layout
  - Markdown-Notizen
  - Automatische Kundennummern (K00001)

- [x] **Backend API** [done: 2026-04-27]
  - Express + PostgreSQL
  - REST Endpunkte für customers, persons
  - CORS konfiguriert
  - Port 3001

- [x] **Frontend** [done: 2026-04-27]
  - Vite + React + TypeScript
  - Tailwind CSS v4
  - React Query
  - Build erfolgreich

- [x] **Docker Deployment** [done: 2026-04-27]
  - Alle Container laufen stabil
  - Port 80 (Frontend), 3001 (Backend)

---

## 🟡 Optional / Zukünftige Erweiterungen

- [ ] **Autorefresh optimieren** - React Query Cache invalidation statt window.reload()
- [ ] **Erweiterte Filter** - Filter nach Typ, Stadt, Status
- [ ] **Sortierung** - Kundenliste sortierbar nach Spalten
- [ ] **E-Mail Validierung** - Eindeutigkeit prüfen
- [ ] **Export-Funktion** - CSV Export für Listen
- [ ] **Dokumentenmanagement** - Dateien zu Kunden/Lieferanten hochladen
- [ ] **Auftragsverwaltung** - Projekte/Aufträge zuordnen
- [ ] **Dashboard** - Statistiken, Übersichten
- [ ] **Notifications** - E-Mail Benachrichtigungen

---

## 📁 Dokumente

- **Design Guide:** `docs/DESIGN-GUIDE.md`
- **Database Schema:** `docs/DATABASE-SCHEMA.md`
- **UI Skizze:** `docs/UI-SKIZZE.md`
- **Projekt-Status:** `STATUS-2026-04-27.md`

---

## 🔧 Technische Details

- **VM IP:** 172.16.0.125
- **SSH User:** openclaw
- **GitHub Repo:** Arensre/EVO_MT
- **Frontend:** http://172.16.0.125 (Port 80)
- **Backend API:** http://172.16.0.125:3001
- **Datenbank:** PostgreSQL (Port 5432)

---
_Stand: 2026-04-27 21:27 UTC_
