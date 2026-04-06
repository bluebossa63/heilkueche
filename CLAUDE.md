# CLAUDE.md — Heilküche

Dieses Dokument beschreibt die Zusammenarbeit zwischen Claude (KI-Entwicklerassistent) und dem Heilküche-Team.

---

## Zusammenarbeit & Kommunikation

**Franziska** ist die Projektbesitzerin. Sie gibt Inhalte, Ideen und Prioritäten vor.
**Daniele** (GitHub: bluebossa63) ist der technische Administrator.

**Wie Claude mit Franziska arbeitet:**
- Immer auf Deutsch, ohne Fachbegriffe
- Kurz erklären was geplant ist, dann auf Bestätigung warten
- Technische Umsetzung läuft im Hintergrund — keine Anweisungen an Franziska
- Nie nach Passwörtern fragen (alle Zugangsdaten sind in `~/.openclaw-secrets`)
- Vorschläge machen, Prioritäten von Franziska bestimmen lassen

---

## Businessziel

Heilküche ist eine **Ernährungs-App für Menschen mit gesundheitlichen Beschwerden**. Sie verbindet konkrete Gesundheitsthemen (Bluthochdruck, Diabetes, Cholesterin usw.) mit passenden Rezepten und Ernährungswissen.

**Kernversprechen:** Verstehe, was dein Körper braucht — und finde Rezepte die wirklich helfen.

**Zielgruppe:** Menschen aller Altersgruppen, die ihre Gesundheit durch Ernährung unterstützen möchten. Auch Angehörige, die für kranke Familienmitglieder kochen.

**Wichtiger Hinweis (immer sichtbar):** Die App ersetzt keine ärztliche Beratung. Dieser Disclaimer erscheint auf jeder relevanten Seite.

**Designsprache:** Ähnlich wie SpicyHealth, aber etwas ruhiger und sachlicher — vertrauenswürdig und medizinisch seriös wirkend, trotzdem warm und einladend.

---

## Features & Seiten

| Seite | Beschreibung |
|-------|-------------|
| `/` | Startseite mit 8 Gesundheitsthemen und Einführung |
| `/conditions` | Übersicht alle Gesundheitsthemen |
| `/conditions/detail` | Detailseite: Was essen / Was meiden / Tipps + passende Rezepte |
| `/recipes` | Rezeptbibliothek mit Gesundheits-Tags |
| `/meal-planner` | Wöchentlicher Mahlzeitenplaner |
| `/shopping-list` | Einkaufsliste aus dem Wochenplan |
| `/wissen` | Ernährungswissen-Artikel (ausklappbar) |
| `/mein-tag` | Wasser-Tracker, Stimmung, Energie, Notiz |
| `/fortschritt` | 30-Tage-Verlauf |
| `/profile` | Profil und Gesundheitsthemen-Auswahl |
| `/auth` | Login, Registrierung, Google OAuth |

---

## Gesundheitsthemen (in der Datenbank)

| ID | Name | Ernährungs-Tag |
|----|------|----------------|
| bluthochdruck | Bluthochdruck | herzfreundlich |
| diabetes-typ-2 | Diabetes Typ 2 | blutzuckerfreundlich |
| hohes-cholesterin | Hohes Cholesterin | cholesterinsenkend |
| verdauungsbeschwerden | Verdauungsbeschwerden | verdauungsfoerdernd |
| entzuendungen-arthrose | Entzündungen & Arthrose | entzuendungshemmend |
| eisenmangel | Eisenmangel | eisenreich |
| uebergewicht | Übergewicht | kalorienarm |
| migraene | Migräne | migraenefreundlich |

Rezepte erhalten `healthTags` die diesen Tags entsprechen → werden automatisch unter dem passenden Gesundheitsthema angezeigt.

---

## Wissen-Artikel (in der Datenbank)

8 Artikel vorhanden (Stand April 2026):
- Omega-3-Fettsäuren und Herzgesundheit
- Blutzucker im Griff: Was Sie wissen müssen
- Das Mikrobiom: Ihr zweites Gehirn
- Entzündungshemmende Ernährung: Die Anti-Aging-Diät
- Eisen aus der Nahrung: Aufnahme clever verbessern
- Superfoods: Mythos und Wahrheit
- Cholesterin verstehen: LDL, HDL und was wirklich zählt
- Nachhaltig abnehmen: Ohne Hunger, ohne Verbote

---

## Architektur

### Monorepo-Struktur
```
heilkueche/
├── apps/
│   ├── web/          → Next.js 14 Frontend (Static Export)
│   └── api/          → Express.js Backend API
└── packages/
    └── shared/       → Gemeinsame TypeScript-Typen (@heilkueche/shared)
```

### Frontend (apps/web)
- **Framework:** Next.js 14 mit Static Export
- **Hosting:** Azure Static Web Apps
- **API-URL (Produktion):** `https://heilkueche-api-prod.azurewebsites.net/api`
- Wird beim Build via `NEXT_PUBLIC_API_URL` in GitHub Actions gesetzt

### Backend (apps/api)
- **Framework:** Express.js mit TypeScript
- **Hosting:** Azure App Service (`heilkueche-api-prod`)
- **Port:** 8080 (wichtig — Azure erwartet 8080, nicht 3001)
- **Auth:** JWT + Google OIDC (identisch mit SpicyHealth)

### Datenbank & Speicher
- **Datenbank:** Azure Cosmos DB (`heilkueche`) — selber Cosmos-Account wie SpicyHealth
  - Container: `recipes`, `users`, `meal-plans`, `shopping-lists`, `daily-logs`, `comments`, `conditions`, `wissen`
  - Partition Keys: `conditions` → `/id`, `wissen` → `/id`, `recipes` → `/category`
- **Bilder:** Azure Blob Storage Container `heilkueche-media`

### Deployment
- **Trigger:** Push auf `main` → GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`
- **Besonderheit:** `@heilkueche/shared` wird manuell ins Deploy-Bundle kopiert (kein npm-Link in Prod)

---

## Zugangsdaten

Alle Keys in `~/.openclaw-secrets`. Teilen mit SpicyHealth:
- `COSMOS_ENDPOINT` + `COSMOS_KEY` — Azure Cosmos DB
- `OPENAI_API_KEY` — für DALL-E 3 Rezeptbilder (geteilt)
- `ANTHROPIC_API_KEY` — falls KI-Features geplant

Heilküche-spezifisch:
- Azure Publish Profile: `AZURE_API_PUBLISH_PROFILE` (GitHub Secret)
- Azure SWA Token: `AZURE_STATIC_WEB_APPS_TOKEN` (GitHub Secret)

Google OAuth Redirect URI (muss in Google Cloud Console stehen):
`https://heilkueche-api-prod.azurewebsites.net/api/auth/google/callback`

---

## Bekannte Eigenheiten

- Die Wissen-Seite zeigt API-Artikel + statische Fallback-Artikel (keine Duplikate dank ID-Deduplizierung)
- Artikel-Content nutzt Markdown (##, -, **fett**) — die Seite rendert das korrekt
- Seed-Script: `apps/api/seed-heilkueche.js` — für Datenbank-Initialisierung
- Fix-Script: `apps/api/fix-conditions-umlauts.js` — hat Umlaute korrigiert (April 2026)

---

## Stand April 2026

- ✅ Login (Email + Google) funktioniert
- ✅ 8 Gesundheitsthemen mit korrekten Umlauten
- ✅ 29 Rezepte mit healthTags
- ✅ 8 Wissen-Artikel
- ✅ Deployment stabil

---

## Nächste mögliche Schritte (Vorschläge)

- Mehr Rezepte mit Gesundheits-Tags und Bildern (Ziel: 50+ pro Thema)
- Eigene Domain (z.B. heilkueche.niceneasy.ch)
- Mehr Gesundheitsthemen: Schilddrüse, Nierensteine, Gicht, Osteoporose
- Profil: Nutzer wählt ihre Gesundheitsthemen → personalisierte Rezept-Startseite
- KI-Ernährungsberater (Chat, ähnlich wie Stilberaterin in SpicyHealth)
