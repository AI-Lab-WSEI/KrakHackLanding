# Aktor: Jury

Juror — osoba oceniająca projekty hackathonowe. Dostęp przez **magic link** emailowy, nie przez zwykły login.

Rola Keycloak: `jury` (przyznawana dla "ofi cjalnego" jurora; magic link sam w sobie daje dostęp do `/jury/:token`).

## Ścieżki jury

### A) Magic link (główna ścieżka)
- Admin `/panel/admin/wyniki` → tab "Jurorzy" → "Wygeneruj magic link" → email z `/jury/:token`
- Juror klik → `/jury/:token` (standalone, bez Keycloak)
- Widzi listę projektów edycji + formularze oceny per kategoria

### B) Zwykły login (fallback)
- Jeśli juror ma rolę Keycloak `jury` → może się zalogować przez `/login`
- `/panel` pokazuje card "Jesteś jurorem — użyj magic linka z emaila. Ten panel nie jest potrzebny do oceny."
- CTA "Poproś admina o nowy link" (mailto) + "Zobacz wyniki edycji"

## User stories

### US-JURY-01: Otrzymanie magic linka
**Akceptacja:** Juror dostaje email `Zaproszenie do oceny projektów — AI Krak Hack 2026` z linkiem `/jury/<token>`. Token ważny ~30 dni (expires_at w `jury_members`).
**Test:** Admin generuje → juror dostaje email.

### US-JURY-02: Ocenianie projektów
**Akceptacja:**
- `/jury/:token` → GET `/api/jury/verify` (sprawdza token) → pokazuje listę projektów + formularze
- Per projekt: kategorie scoringu (z `edition_config.scoring_categories`) + private_notes
- Submit → POST `/api/jury/scores` → zapis
- Można wrócić i zmienić swoje oceny (UPDATE)

**Test:**
1. Kliknąć link w emailu
2. Widzi wszystkie projekty edycji
3. Ocenia 1 projekt (5 kategorii np. innowacja / feasibility / prezentacja)
4. Submit → "zapisano"
5. Odświeżenie → oceny zachowane

### US-JURY-03: Private notes
**Akceptacja:** Oprócz scoringu jury może dodać swoje prywatne notatki (widziane tylko przez niego + admina)
**Test:** Edit project → dodaj notatki → save → reload → notatki zachowane.

### US-JURY-04: Jury loguje się przez /login (alternatywa)
**Akceptacja:**
- Login credentials → `/panel`
- Dashboard pokazuje jury card z instrukcją użycia magic linka
- Sidebar MÓJ OBSZAR: tylko Dashboard, Profil, Projekty (brak jury-specific w `/panel`)

**Test:**
1. Admin daje juror roli Keycloak + temp password
2. Juror login → `/panel` → widzi amber card "Jesteś jurorem"
3. Klik "Poproś admina o nowy link" → mailto otwarty
4. Nie ma w sidebarze żadnych jury-specific items (wszystko przez magic link)

## Blokady

- Magic link wygasły → `/jury/:token` shows "Link expired"
- Token sforgowany → 401
- Jury user próbuje z /panel wpaść na admin → 🚫 block
- Inny jury user próbuje wywołać POST `/api/jury/scores` bez verify → 401

## Edge cases

- Juror zgubił magic link → mailto admin + admin generuje nowy (poprzedni invalidate?)
- Juror chce rezygnować z oceny → feature nie istnieje (admin usuwa z `jury_members`)
- Projekt został usunięty z edycji po tym jak juror ocenił → oceny orphaned (FK behavior?)
