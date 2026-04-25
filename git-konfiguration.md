# Git & GitHub Konfiguration

## Datum: 2026-04-24

---

## Installierte Tools

### GitHub CLI (`gh`)

**Version:** 2.45.0

**Installationsmethode:**
```bash
apt-get install gh
```

**Authentifizierung:**
- Token-basiert via `gh auth login`
- Account: Arensre
- Protocol: HTTPS
- Konfiguration: `/root/.config/gh/hosts.yml`

**Verwendung:**
- Zugriff auf GitHub API
- PRs, Issues, CI-Workflows verwalten
- Repository-Operationen

**Skills:**
- `github` – Basis-Skill für GitHub-Operationen
- `gh-issues` – Erweitert für automatisierte Issue-Verarbeitung

---

## Verwendungszweck

Primär für:
- **Issue-Tracking** – Feature Requests, Bugs, Aufgaben dokumentieren
- **Versionierung** – Code-Versionen, Releases, Historie

GitHub Web-Interface wird genutzt für:
- Issues erstellen und verwalten
- Projekt-Board (Kanban) für Task-Management
- Milestones und Releases

Entwicklungs-Workflow:
- Feature-Branches für neue Funktionen
- Commits mit Issue-Referenzen (z.B. `Fixes #123`)
- Main-Branch als stabile Version
- Tags für Releases

---

_Zuletzt aktualisiert: 2026-04-24 07:20 UTC_
