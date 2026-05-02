# EVO_MT - Eventorganisation Management Tool

Ein ERP-System für Vereine, Firmen und Event-Organisationen als Web-Anwendung.

## Tech-Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Datenbank | PostgreSQL |
| Deployment | Docker Compose |

## Features

### ✅ Implementiert

**Kundenverwaltung (ERP)**
- Kunden anlegen, bearbeiten, löschen
- Unternehmenstypen: Firma, Verein, Privat
- Ansprechpartner pro Kunde

**Lieferantenverwaltung**
- Lieferanten anlegen, bearbeiten, löschen
- Kategorien und Kontaktdaten

**Mitgliederverwaltung** 🆕
- Zwei-Tab-Layout: Allgemein + Mitgliedschaft
- Funktionsverwaltung mit Zeitraum (Von/Bis)
- Mitgliedsarten (Vollmitglied, Fördermitglied, etc.)
- Filterung nach Name, Art, Status

**Benutzerverwaltung mit Berechtigungen**
- Rollen: Admin, Benutzer
- Modul-Berechtigungen:
  - Kunden (Lesen/Bearbeiten/Löschen)
  - Lieferanten (Lesen/Bearbeiten/Löschen)
  - Mitglieder (Lesen/Bearbeiten/Löschen)

**Stammdaten**
- Mitgliedsarten verwalten
- Funktionen verwalten
- Einstellungen

### 🚧 In Planung

- Materialverwaltung mit Lagerbestand
- Event-Planung und -Verwaltung
- Finanzmodul (Rechnungen, Ausgaben)
- Berichte und Statistiken

## Schnellstart

```bash
# Repository klonen
git clone [repository-url]
cd EVO_MT

# Umgebungsvariablen kopieren
cp .env.example .env
# .env anpassen

# Docker-Container starten
docker compose up -d

# Frontend-Build (Entwicklung)
cd src/frontend && npm install && npm run dev

# Backend (Entwicklung)
cd src/backend && npm install && npm run dev
```

## Zugriff

Nach dem Start:
- **Frontend:** http://172.16.0.125:80
- **Backend API:** http://172.16.0.125:3001/api

Default Login:
- Benutzername: `admin`
- Passwort: `admin123` (bei erstem Login ändern!)

## Projektstruktur

```
EVO_MT/
├── docs/                    # Dokumentation & Session-Logs
│   ├── DESIGN-GUIDE.md
│   ├── SESSION-LOG-*.md
│   └── ...
├── src/
│   ├── frontend/           # React + TypeScript
│   │   ├── src/
│   │   │   ├── components/   # UI-Komponenten
│   │   │   ├── hooks/          # Custom Hooks (usePermissions, etc.)
│   │   │   ├── contexts/       # React Contexts (Auth, etc.)
│   │   │   └── types.ts        # TypeScript Interfaces
│   │   └── ...
│   └── backend/            # Node.js + Express
│       └── src/
│           ├── routes/        # API-Routen
│           ├── middleware/      # Auth, etc.
│           └── server.js
├── docker-compose.yml      # Docker-Setup
└── README.md
```

## Versionshistorie

| Version | Datum | Highlights |
|---------|-------|------------|
| 1.4.0 | 2026-05-02 | Berechtigungsmodule Kunden/Lieferanten/Mitglieder |
| 1.3.0 | 2026-05-02 | Zwei-Tab Mitgliederverwaltung |
| 1.2.x | 2026-05-02 | Filter Fix, Datums-Handling, Error-Logging |
| 1.1.0 | 2026-04-30 | Lieferantenverwaltung |
| 1.0.0 | 2026-04-24 | Initial Setup, Kundenverwaltung, Auth |

## Dokumentation

- [Design Guide](./docs/DESIGN-GUIDE.md) - UI/UX Konventionen
- [Session Logs](./docs/) - Entwicklungsprotokolle
- [Architektur](./ARCHITECTURE.md) - System-Architektur

## Mitwirkende

- René Arens - Projektleitung, Anforderungen
- R2 (AI Assistant) - Entwicklung

---
_Projekt gestartet: 2026-04-24_
_Projektname: EVO_MT (Eventorganisation Management Tool)_
_Stand: 2026-05-02 - In aktiver Entwicklung_
