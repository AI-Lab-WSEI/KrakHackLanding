# AI Possibilities Lab / KrakHack — dokumentacja V1

> **Status:** living document — aktualizowany co release.
> **Audience:** członkowie kola, kolejni deweloperzy, niezależni testerzy/audytorzy, studenci.

Panel administracyjny + strona wydarzeń dla AI Possibilities Lab (koło naukowe WSEI) oraz AI Krak Hack (coroczny hackathon organizowany przez koło).

## Szybka nawigacja

| Dokument | Zakres |
|---|---|
| [architecture/overview.md](architecture/overview.md) | Architektura systemu, usługi, przepływ danych |
| [architecture/roles.md](architecture/roles.md) | Role w systemie i ich uprawnienia (admin, moderator, uczestnicy, jury) |
| [architecture/data-model.md](architecture/data-model.md) | Model danych — tabele, relacje, migracje |
| [architecture/email.md](architecture/email.md) | Sender split (krakhack.info vs possibilitieslab.org), szablony, Resend |
| [user-stories/README.md](user-stories/README.md) | Wszystkie user stories — co kto ma mieć możliwość zrobić |
| [testing/test-plan.md](testing/test-plan.md) | Plan testów manualnych (6h coverage, 1-3 dni) |
| [testing/security-checklist.md](testing/security-checklist.md) | Lista rzeczy do sprawdzenia przez audytora bezpieczeństwa |

## Stack (streszczenie)

- **Frontend:** React 18 + TypeScript + Vite + React Router 7 + Tailwind CSS
- **Backend:** Node.js + Express (`server.js`, monolit ~8k linii)
- **Baza:** PostgreSQL (Railway)
- **Auth:** Keycloak (SSO PKCE + ROPC fallback, realm `krakhack`)
- **Email:** Resend (2 zweryfikowane domeny: `krakhack.info` dla hackathonu, `possibilitieslab.org` dla koła)
- **Integracje:** Discord (nazwa użytkownika tylko), ClickUp (email zaproszenia), Cloudinary (galeria), SMSAPI (SMS)
- **Hosting:** Railway (2 serwisy: `KrakHackLanding` + `keycloak-production-b6e2`)
- **Frontend domeny:** `www.krakhack.info` (SPA), fallback `possibilitieslab.org`

## Domeny biznesowe

Aplikacja obsługuje **dwa nurty** — organizacyjnie powiązane, technicznie współdzielą infrastrukturę:

1. **AI Krak Hack** — coroczny hackathon (~60-120 uczestników, jury, certyfikaty, zespoły z projektami, głosowanie)
2. **AI Possibilities Lab** — koło naukowe (członkowie regularni, kompas kompetencji, współprace z firmami, Discord/ClickUp workspace)

System rozpoznaje kontekst użytkownika poprzez **role Keycloak** (szczegóły: [architecture/roles.md](architecture/roles.md)) i pokazuje tylko te funkcje, które są sensowne dla danej osoby.

## Jak uruchomić lokalnie

```bash
npm install
npm run dev          # vite dev server :5173
node server.js       # backend :3000 (wymaga DATABASE_URL + KEYCLOAK_* env vars)
```

Env vars wymagane: zobacz `server.js` startup lub `.env.example` (jeśli istnieje).

## Deployment

Push do `main` → Railway rebuild → produkcja live w ~2 min.

Bundle frontendowy serwowany przez Express (SPA fallback w `server.js`), backend Railway wystawia `PORT=8080`.

## Dla testerów — start tutaj

→ [testing/test-plan.md](testing/test-plan.md) — scenariusze manualne
→ [testing/security-checklist.md](testing/security-checklist.md) — co sprawdzać pod kątem bezpieczeństwa
→ [user-stories/README.md](user-stories/README.md) — akceptacja per user story
