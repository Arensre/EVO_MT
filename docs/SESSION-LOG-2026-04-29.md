# EVO_MT Entwicklungstag - 2026-04-29

**Dauer:** 06:00 - 10:46 (4,5 Stunden)  
**Entwickler:** René Arens + R2 (AI Assistant)  
**Fokus:** UserManagement Fixes, Layout, Version Tracking

---

## 🎯 Ziele des Tages

1. UserManagement Layout fixen (volle Breite, Slide-in Effekt)
2. Vorname/Nachname speichern reparieren
3. Versionsanzeige für einfaches Deployment-Tracking
4. Alle Split-Views konsistent machen

---

## ✅ Erledigt

### UserManagement Layout
- [x] **Split-View** jetzt mit `w-1/2` statt `flex-1` (gleicher Effekt wie Kunden/Lieferanten)
- [x] **Volle Breite** - kein weißer Rand mehr rechts
- [x] **Slide-in Animation** - Detail-Ansicht gleitet von rechts herein
- [x] **Konsistent** mit CustomerView und SupplierView

### Backend Fixes
- [x] **Vorname/Nachname speichern** - Backend akzeptiert jetzt `first_name`/`last_name` (snake_case)
- [x] **Backend gibt snake_case zurück** - Frontend und Backend konsistent
- [x] **Berechtigungen speichern** - Funktioniert über separaten Endpoint

### Frontend Verbesserungen
- [x] **Version Tracking** - `APP_VERSION` in Sidebar.tsx
- [x] **Version wird angezeigt** - Unten in der Sidebar: `v1.0.4-2026-04-29-1024`
- [x] **Einfaches Debugging** - Sofort sehen ob Deployment angekommen

### CreateUser Modal
- [x] **Formular** - Username, Email, Vorname, Nachname, Passwort, Rolle
- [x] **Keine Berechtigungen** - Werden automatisch mit `defaultPermissions` gesetzt
- [x] **Inline Rendering** - Keine Arrow Function (kein State-Verlust)

---

## 🔧 Technische Details

### Versions-Schema
```typescript
const APP_VERSION = '1.0.4-2026-04-29-1024';
// Format: Major.Minor-Patch-Datum-Uhrzeit
```

### Layout-Struktur (alle Views gleich)
```tsx
<div className="flex h-full">
  {/* Linke Seite */}
  <div className={`${selected ? 'w-1/2' : 'w-full'} ...`}>
    <ListComponent />
  </div>

  {/* Rechte Seite (Detail) */}
  {selected && (
    <div className="w-1/2 border-l ...">
      <DetailComponent />
    </div>
  )}
</div>
```

### Backend API (snake_case)
```javascript
// Request (Frontend sendet)
{ first_name: 'Max', last_name: 'Mustermann' }

// Response (Backend gibt zurück)
{ first_name: 'Max', last_name: 'Mustermann' }
```

---

## 🐛 Bekannte Probleme (Gelöst)

### Docker Cache Problem
**Symptom:** Neue Version wird nicht angezeigt  
**Lösung:** 
```bash
docker rmi -f evo_mt-frontend
docker system prune -af --volumes
docker compose up -d
```

### API Format Inkonsistenz
**Symptom:** Vorname/Nachname werden nicht gespeichert  
**Ursache:** Frontend sendet `first_name`, Backend erwartete `firstName`  
**Lösung:** Backend akzeptiert jetzt beide Formate, gibt snake_case zurück

---

## 📝 Code-Änderungen

### GitHub Commits
- `743ca8b` - UserManagement: Fix split-view layout, add version tracking, fix name/permissions saving
- `f3792c3` - Add session log for 2026-04-28 - UserManagement redesign day

### Geänderte Dateien
- `src/backend/src/routes/users.js` - snake_case support
- `src/frontend/src/MainApp.tsx` - Layout fixes
- `src/frontend/src/components/Sidebar.tsx` - Version tracking
- `src/frontend/src/components/UserManagement.tsx` - Layout + Modal fixes

---

## 🔗 Ressourcen

**Zugriff:**
- Frontend: http://172.16.0.125
- Backend API: http://172.16.0.125:3001
- Login: admin / admin123
- Version: `v1.0.4-2026-04-29-1024`

**SSH:**
- Host: 172.16.0.125
- User: openclaw
- Projekt: ~/EVO_MT/

---

## 🚀 Nächste Schritte

1. **Lieferantenverwaltung** vervollständigen
2. **Materialverwaltung** starten
3. **Tests** durchführen

---

## 💡 Erkenntnisse

### Versions-Tracking
- Unbedingt notwendig für Docker Deployments
- Zeigt sofort ob Cache-Problem vorliegt
- Format: `Major.Minor-Patch-Datum-Uhrzeit`

### Layout-Konsistenz
- Alle Split-Views sollten gleiche CSS-Klassen nutzen
- `w-1/2` gibt klaren Übergang (besser als `flex-1`)
- `transition-all duration-300` für Animation

---

**Erstellt:** 2026-04-29 10:46 UTC  
**Version:** 1.0.4
