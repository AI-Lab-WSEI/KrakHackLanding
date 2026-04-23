# Aktor: Członek koła (scienceclub-participant)

Członek AI Possibilities Lab. Przyjęty przez admina z aplikacji `/dolacz`.

Rola Keycloak: `scienceclub-participant`.

## Co widzi

**Sidebar MÓJ OBSZAR:**
- Dashboard, Profil, Projekty
- **Mój kompas**, **Głosowanie**

**Brak:** admin, Mój zespół, Moja obecność.

**Dashboard:**
- Badge emerald `scienceclub-participant`
- Missing integrations banner (Discord + ClickUp jeśli brak)
- Quick links: Profil, Projekty, Mój kompas, Głosowanie, Wydarzenia

## User stories

### US-SC-01: Pierwsza wizyta po create-profile
**Akceptacja:** email od `no-reply@possibilitieslab.org` z temp hasłem → login → Keycloak change password → `/panel`, bio/skills już uzupełnione (z aplikacji), kompas pokazuje "potrzebujemy więcej userów żeby wyliczyć średnią"

**Test:**
1. Admin akceptuje aplikację, robi create-profile
2. User klika link w emailu → Keycloak → hasło
3. `/panel` — sidebar ma Mój kompas, Dashboard ma emerald badge
4. `/panel/profil` — widzi swoje bio (markdown z 3 sekcji aplikacji), skills (kompetencje ≥5 + engagement types)

### US-SC-02: Kompas kompetencji
**Akceptacja:** `/panel/moj-kompas` → pokazuje własne skille + średnią koła + top skills w kole
**Test:** Login → Mój kompas → widzi slupki per kompetencja, porównanie do avg koła.

### US-SC-03: Uzupełnienie Discord + ClickUp
**Akceptacja:** Na `/panel/profil` dwa pola w sekcji Integracje. Save → PATCH `/api/panel/me` z `discordUsername` + `clickupEmail`.
**Test:** Profile → fill Discord + ClickUp → Save → refresh → nowe wartości.

### US-SC-04: Missing-integrations request email
**Akceptacja:** Admin wysyła request-fill do członków bez Discord → user dostaje email z listą pól + link do `/panel/profil`.
**Test:** Admin robi bulk request → user dostaje email od `no-reply@possibilitieslab.org` z treścią per brakujące pole.

## Blokady

- `/panel/moj-zespol` → 🚫 (hackathon-only)
- `/panel/moja-obecnosc` → 🚫
- `/panel/admin/*` → 🚫

## Dodatkowe role

Członek koła może być też uczestnikiem hackathonu (role overlap). Wtedy widzi union: Mój zespół + Mój kompas + Głosowanie.
