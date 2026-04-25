# Architektur Event-ERP

## Tech-Stack

| Schicht | Technologie | Begründung |
|---------|-------------|------------|
| Frontend | React 18 + TypeScript + Vite | Modern, performant, gutes Tooling |
| UI-Library | Material-UI oder Tailwind + Headless UI | Schnelle Entwicklung |
| State-Management | React Query + Zustand | Server-State + Client-State getrennt |
| Backend | Node.js + Express + TypeScript | Einfach, performant, großes Ökosystem |
| ORM | Prisma | Type-safe, gute Migrationen |
| Datenbank | PostgreSQL 15+ | Robust, ACID, JSON-Support |
| Auth | JWT + bcrypt | Stateles, skalierbar |
| API | REST (evtl. später GraphQL) | Einfach zu debuggen |
| Container | Docker + Docker Compose | Lokale Entwicklung + Deployment |
| Reverse-Proxy | Nginx | SSL-Terminierung, Static-Files |

## Ordnerstruktur Backend

```
backend/
├── src/
│   ├── config/         # DB, Auth, Env
│   ├── modules/        # Feature-Module (CRM, Events, etc.)
│   │   ├── customers/
│   │   ├── events/
│   │   ├── staff/
│   │   ├── inventory/
│   │   ├── billing/
│   │   └── reports/
│   ├── routes/         # API-Routen
│   ├── middleware/     # Auth, Error-Handling, Validation
│   ├── services/       # Business-Logik
│   └── utils/          # Helper-Funktionen
├── prisma/
│   └── schema.prisma   # Datenbank-Schema
├── tests/
└── Dockerfile
```

## Ordnerstruktur Frontend

```
frontend/
├── src/
│   ├── components/     # Wiederverwendbare Komponenten
│   ├── pages/          # Seiten/Routen
│   ├── hooks/          # Custom React Hooks
│   ├── services/       # API-Clients
│   ├── stores/         # State-Management
│   ├── types/          # TypeScript-Interfaces
│   └── utils/          # Helper
├── public/
└── Dockerfile
```

## Datenbank-Entwurf (Erste Ideen)

```prisma
// Noch zu verfeinern – wird nach Anforderungen angepasst
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // gehasht
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
}

model Customer {
  id          String   @id @default(uuid())
  name        String
  email       String?
  phone       String?
  address     String?
  events      Event[]
}

model Event {
  id          String   @id @default(uuid())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  location    String?
  status      EventStatus @default(PLANNING)
  customer    Customer @relation(fields: [customerId], references: [id])
  customerId  String
}

// ... weitere Models folgen
```

## Deployment-Architektur

```
┌─────────────────┐
│   Nginx         │  SSL, Static-Files, Reverse-Proxy
│   (Port 443)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────┐
│React  │  │Express│
│(Build)│  │API    │
└───────┘  └──┬────┘
              │
         ┌────▼────┐
         │PostgreSQL│
         │(Docker) │
         └─────────┘
```

## Nächste Schritte

1. [ ] Schema finalisieren
2. [ ] Docker-Compose für lokale Entwicklung
3. [ ] Grundgerüst Backend (Auth, Health-Check)
4. [ ] Grundgerüst Frontend (Login, Routing)

---
_Wird mit Anforderungen weiterentwickelt_
