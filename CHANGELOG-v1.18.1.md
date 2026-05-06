# EVO_MT Version 1.18.1 - Release Notes

**Release Date:** 2026-05-06

## Neue Features

### Allgemeine Einstellungen (General Settings)
- Neuer Menüpunkt "Allgemein" unter Administration
- Login-Hintergrund kann hochgeladen und verwaltet werden
  - Unterstützt JPG, PNG, GIF (max. 5MB)
  - Vorschau vor dem Speichern
  - Anzeige des aktuellen Hintergrunds
  - Entfernen des Hintergrunds möglich

### Sicherheitsverbesserungen
- Berechtigungsbasierte Menüführung:
  - Administration-Menü nur für Administratoren sichtbar
  - "Allgemein", "Stammdaten", "Module" und "Benutzerverwaltung" nur für Admins
- Passwort-Anzeige-Option im Login-Formular (Auge-Icon)

### UI/UX Verbesserungen
- Neuer Tab-Titel: "EVO MT" (statt "frontend")
- Neues Favicon: Blauer Kalender mit "EV" Logo
- Deutsche Sprache als Standard (lang="de")
- SEO-Metadaten hinzugefügt

## Geänderte Dateien

### Backend
- `src/backend/src/server.js`
  - Neue Endpunkte für Login-Hintergrund-Verwaltung
  - Multer-Integration für Datei-Uploads
  - Statisches Serving für `/uploads/backgrounds`

### Frontend
- `src/frontend/src/components/GeneralSettings.tsx` (NEU)
  - Komponente für allgemeine Einstellungen
  - Bild-Upload mit Vorschau
- `src/frontend/src/components/LoginPage.tsx`
  - Dynamischer Hintergrund aus Einstellungen
  - Passwort-Anzeige/-Verbergen Funktion
  - Dark overlay bei Bildhintergrund
- `src/frontend/src/components/Sidebar.tsx`
  - Neue Menüpunkte: "Allgemein"
  - Berechtigungsprüfung für Admin-Menüs
  - Versions-Update auf 1.18.1
- `src/frontend/src/MainApp.tsx`
  - GeneralSettingsView hinzugefügt
- `src/frontend/src/types.ts`
  - 'general' zum View-Typ hinzugefügt
- `src/frontend/src/components/Dashboard.tsx`, `MembershipDetail.tsx`, `MembershipManagement.tsx`
  - API-URL auf relative Pfade umgestellt
- `src/frontend/index.html`
  - Neuer Titel: "EVO MT"
  - Deutsche Sprache
  - Meta-Beschreibung
- `src/frontend/public/favicon.svg`
  - Neues Kalender-Icon mit Gradient
- `src/frontend/default.conf`
  - Nginx-Proxy für `/uploads/backgrounds`
  - `client_max_body_size` auf 10M erhöht

### Infrastruktur
- `infra/docker-compose.yml`
  - Umgebungsvariablen für alte Datenbank angepasst
  - DB_HOST: evo_mt_postgres
  - Port-Mapping für Backend: 3001:3001

## Bekannte Einschränkungen
- Login-Hintergrund wird nicht persistiert bei Container-Neustart (nur im Dateisystem)

## Migration von v1.17.3
1. Backup der Datenbank erstellen
2. Git-Pull ausführen
3. Docker-Container neu bilden:
   ```bash
   docker compose -f infra/docker-compose.yml build
   docker compose -f infra/docker-compose.yml up -d
   ```
4. Frontend-Build ausführen:
   ```bash
   cd src/frontend && npm run build
   ```

## API-Endpunkte

### Login-Hintergrund
- `GET /api/settings/login-background` - Aktuellen Hintergrund abrufen
- `POST /api/settings/login-background` - Neuen Hintergrund hochladen (multipart/form-data, Feld: 'background')
- `DELETE /api/settings/login-background` - Hintergrund entfernen

## Technische Details

### Netzwerk-Konfiguration
- Frontend (nginx): Port 80
- Backend (Node.js): Port 3001
- Datenbank (PostgreSQL): Port 5432 (intern)

### Datei-Upload
- Upload-Verzeichnis: `/app/uploads/backgrounds/`
- Max. Dateigröße: 10MB
- Unterstützte Formate: JPG, PNG, GIF

---
_Stand: 2026-05-06_
