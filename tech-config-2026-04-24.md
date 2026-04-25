# Technische Anpassungen & Konfigurationen

## Datum: 2026-04-24

---

## 1. Traum-Konstellation (Talk → Memory → Dreaming)

### Problem
Die Dreaming-Sessions verarbeiteten bisher nur den "main" Chat, nicht die Gruppenchats aus Nextcloud Talk.

### Lösung
Cronjobs eingerichtet, die täglich Nextcloud Talk Nachrichten exportieren:

```
Nextcloud Talk → Cron-Job (02:30) → memory/YYYY-MM-DD.md
                                          ↓
                                    Dreaming (03:00)
                                          ↓
                                    MEMORY.md (Langzeit)
```

### Konfiguration

**Script:** `/root/.openclaw/workspace/scripts/talk-to-memory.sh`
- Findet automatisch die aktuellste Session
- Exportiert User- und Assistant-Nachrichten der letzten 24h
- Speichert in `/root/.openclaw/agents/main/memory/`

**Cronjobs:**
```bash
# Talk-to-Memory Export - täglich um 02:30
30 2 * * * /root/.openclaw/workspace/scripts/talk-to-memory.sh >> /var/log/talk-to-memory.log 2>&1

# Memory Cleanup - monatlich am 1. um 03:00
0 3 1 * * /root/.openclaw/workspace/scripts/cleanup-old-memory.sh >> /var/log/memory-cleanup.log 2>&1
```

### Status
✅ Aktiv seit: 2026-04-24 07:10 UTC

---

## 2. GitHub Integration

### Installation
**Tool:** GitHub CLI (`gh`)
**Version:** 2.45.0
**Installationsmethode:** apt (Ubuntu)

```bash
apt-get install gh
```

### Authentifizierung
- Token-basierte Authentifizierung eingerichtet
- Account: Arensre
- Protocol: HTTPS
- Konfiguration: `/root/.config/gh/hosts.yml`

### Verwendung
- Skill `github` verfügbar für PRs, Issues, CI, API-Queries
- Skill `gh-issues` verfügbar für automatisierte Issue-Verarbeitung

### Status
✅ Konfiguriert seit: 2026-04-24 07:10 UTC

---

## 3. Projekt: EVO_MT (Eventorganisation Management Tool)

### Beschreibung
ERP-System für die Eventbranche als Web-Anwendung.

### Tech-Stack
| Layer | Technologie |
|-------|-------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Datenbank | PostgreSQL 15 |
| ORM | Prisma |
| Deployment | Docker + Docker Compose |

### Projektstruktur
```
/root/.openclaw/workspace/projects/EVO_MT/
├── README.md                 # Projekt-Übersicht
├── REQUIREMENTS.md           # Anforderungen
├── ARCHITECTURE.md           # Tech-Design
├── TODO.md                   # Tasks & Status
├── docs/                     # Dokumentation
├── src/
│   ├── frontend/             # React App
│   │   └── Dockerfile
│   └── backend/              # Express API
│       └── Dockerfile
├── infra/
│   └── docker-compose.yml    # Lokale Entwicklung
├── scripts/                  # Hilfsskripte
└── memory/
    └── PROJECT.md            # Projekt-Memory
```

### Docker-Compose Services
| Service | Port | Beschreibung |
|---------|------|--------------|
| db | 5432 | PostgreSQL |
| backend | 3000 | Express API |
| frontend | 5173 | React Dev Server |

### Status
🚧 In Planung – warte auf Ubuntu Server + SSH-Zugang

---

## 4. Websuche Problem & Lösung

### Problem
`web_search` funktionierte nicht – Provider auf "ollama" konfiguriert, aber Ollama bietet keinen Search-Endpoint.

### Analyse
```
Konfiguriert: tools.web.search.provider: "ollama"
Problem: /api/search existiert nicht bei Ollama
Alternative: Tavily (API-Key benötigt, verbraucht Tokens)
```

### Status
⏸️ Offen – René bevorzugt kostenlose Lösung ohne Token-Verbrauch
Option: Lokalen Search-Provider (SearXNG) oder DuckDuckGo-Scraper evaluieren

---

## Dateien in diesem Dokument

| Datei | Beschreibung |
|-------|--------------|
| `tech-config-2026-04-24.md` | Diese Datei – alle technischen Anpassungen |
| `EVO_MT/` | Projektdokumentation (README, Architektur, etc.) |

---

_Zuletzt aktualisiert: 2026-04-24 07:15 UTC_
