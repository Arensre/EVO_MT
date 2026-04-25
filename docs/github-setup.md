# Event-ERP GitHub Repository

Repository: `github.com/Arensre/event-erp` (angenommen, bitte korrigieren)

## Einrichtung

### 1. Lokale Entwicklung

```bash
# Repo klonen
git clone https://github.com/Arensre/event-erp.git
cd event-erp

# Environment einrichten
cp .env.example .env
# .env anpassen mit DB-Passwort, JWT-Secret, etc.

# Docker starten
docker-compose -f infra/docker-compose.yml up -d
```

### 2. Services

| Service | URL | Beschreibung |
|---------|-----|--------------|
| Frontend | http://localhost:5173 | React App |
| Backend API | http://localhost:3000 | Express API |
| Datenbank | localhost:5432 | PostgreSQL |

### 3. Datenbank-Migrationen

```bash
docker-compose -f infra/docker-compose.yml exec backend npx prisma migrate dev
```

## Deployment

Siehe `infra/deployment.md` für Produktions-Deployment.

---
_Für Entwicklung siehe `docs/development.md`_
