# ClickUp — lista zadań testowych

> **Target:** 6h testowania przez pretestera w 1-3 dni.
> **Format:** każdy task = jeden atomic scenario do wyklikania.
> **Struktura:** List "AI Krak Hack — pretest" → 4 sekcje odpowiadające 4 sesjom + bonus security.

Po kliknięciu w każdy task — acceptance criteria + expected result.

## Zadania do utworzenia w ClickUp

### Lista: Pretest — Sesja 1 (anonim + formularze)

#### 1. [PRET-01] Zgłoszenie do koła — happy path
**Priority:** High | **Est:** 15min
Wypełnij `/dolacz` — wszystkie 6 kroków, realistyczne dane. Submit, sprawdź potwierdzenie na ekranie + email w skrzynce.
- **Accept:** Confirmation screen widoczny; email od `no-reply@possibilitieslab.org` w inbox; admin zobaczy aplikację w `/panel/admin/aplikacje`.

#### 2. [PRET-02] Zgłoszenie do koła — walidacja
**Priority:** High | **Est:** 10min
Spróbuj: submit z pustym email, niepoprawnym formatem, za długim bio (>5000 znaków), polskimi znakami specjalnymi (ś, ż, em-dash z Worda).
- **Accept:** Backend odrzuca invalid → error message po polsku jasny; długi tekst → OK lub jasny komunikat o limicie.

#### 3. [PRET-03] Zgłoszenie do koła — draft persistence
**Priority:** Medium | **Est:** 5min
Wypełnij 2 kroki, zamknij kartę, otwórz ponownie → czy dane zachowane?
- **Accept:** Draft w localStorage, po F5 dane wracają.

#### 4. [PRET-04] Rejestracja hackathon — participant
**Priority:** High | **Est:** 15min
`/hackathon` → formularz uczestnika → submit.
- **Accept:** Email z `no-reply@krakhack.info`; admin widzi w `/panel/admin/rejestracje`.

#### 5. [PRET-05] Rejestracja hackathon — mentor / company
**Priority:** Medium | **Est:** 10min
Analogicznie dla roli mentora i firmy.

#### 6. [PRET-06] Login — happy path
**Priority:** High | **Est:** 5min
`/login` → email + hasło admina (z docs testing) → redirect `/panel`.

#### 7. [PRET-07] Login — błędne hasło
**Priority:** High | **Est:** 5min
Złe hasło → expected message w PL, password field się czyści.

#### 8. [PRET-08] Login — temp password flow
**Priority:** Critical | **Est:** 10min
Admin tworzy profil z aplikacji → pretester dostaje email → próbuje `/login` z temp → widzi amber "Przejdź do Keycloak" → klik → Keycloak UI → zmiana hasła → `/panel`.

#### 9. [PRET-09] Forgot password
**Priority:** High | **Est:** 10min
`/zapomniane-haslo` → podaj swój email → zawsze 200 → email z nowym temp → login z temp → Keycloak zmiana → `/panel`.

#### 10. [PRET-10] Forgot password — rate limit
**Priority:** Medium | **Est:** 5min
4 próby pod rząd w ciągu 1 min → 4ta odpowiedź nadal 200 ale email NIE doszedł (sprawdź Resend).

#### 11. [PRET-11] Publiczne widoki — nawigacja
**Priority:** Medium | **Est:** 15min
Kliknij po wszystkich publicznych stronach: `/uczestnicy`, `/wydarzenia`, `/projekty/:slug`, `/wyniki/3`, `/o-nas`.
- **Accept:** Wszystko się ładuje bez errorów console.

---

### Lista: Pretest — Sesja 2 (panel uczestnika + admin + moderator)

#### 12. [PRET-12] Participant (hackathon) — sidebar
**Priority:** Critical | **Est:** 10min
Login jako hackathon-participant. Sprawdź sidebar: Dashboard, Profil, Projekty, **Mój zespół, Moja obecność, Głosowanie**.
- **Accept:** Nie widać: Mój kompas, admin panel.

#### 13. [PRET-13] Participant (hackathon) — profil + Discord
**Priority:** High | **Est:** 10min
Edit bio, Discord, skills → save → refresh → zapisane.

#### 14. [PRET-14] Participant (hackathon) — team claim
**Priority:** High | **Est:** 15min
`/panel/moj-zespol` → wybierz swój zespół → claim → status pending.

#### 15. [PRET-15] Participant (hackathon) — attendance
**Priority:** High | **Est:** 5min
`/panel/moja-obecnosc` → zaznacz → submit → zobacz confirmed_at.

#### 16. [PRET-16] Participant — głosowanie
**Priority:** High | **Est:** 10min
`/panel/glosowanie` → wybierz projekt → vote → sukces. Próba 2giego vote → 409.

#### 17. [PRET-17] Participant (scienceclub) — sidebar + kompas
**Priority:** Critical | **Est:** 10min
Login jako scienceclub. Sprawdź sidebar: Mój kompas, Głosowanie; brak Mój zespół/Moja obecność. Otwórz `/panel/moj-kompas` → widzi slupki.

#### 18. [PRET-18] Admin — dashboard + KPIs
**Priority:** High | **Est:** 10min
Login jako admin. Dashboard: admin KPIs, Podgląd switcher (Admin/Hackathon/Koło/Jury), admin shortcut.

#### 19. [PRET-19] Admin — preview mode
**Priority:** High | **Est:** 10min
Klik "Hackathon" w Podgląd switcher → sidebar pokazuje Mój zespół, amber banner. Klik "Wyłącz" → wraca. Sprawdź `?preview=scienceclub` w URL → Mój kompas pojawia się.

#### 20. [PRET-20] Admin — utwórz profil z aplikacji
**Priority:** Critical | **Est:** 15min
`/panel/admin/aplikacje` → rozwiń aplikację → "Utwórz profil uczestnika" → modal → submit.
- **Accept:** Response: emailSent=true, tempPassword visible; aplikacja ma user_id, status przyjęty; sprawdź inbox że email poszedł.

#### 21. [PRET-21] Admin — create-profile idempotency
**Priority:** Medium | **Est:** 5min
2gi klik "Utwórz profil" na tej samej aplikacji → modal blocked lub 409.

#### 22. [PRET-22] Admin — bulk create-profile
**Priority:** High | **Est:** 15min
Zaznacz 3 aplikacje → "Utwórz profile (3)" → submit → stats (3 utworzono).

#### 23. [PRET-23] Admin — user management
**Priority:** High | **Est:** 15min
`/panel/admin/uzytkownicy`: edit user → zmień role → save; klik mail icon (reset password) → nowe temp hasło w modal; klik ban → user zawieszony.

#### 24. [PRET-24] Admin — request-fill Discord/ClickUp
**Priority:** Medium | **Est:** 10min
`/panel/admin/integracje` → filter "Bez Discord" → zaznacz 2 → "Wyślij do zaznaczonych" → email poszedł.

#### 25. [PRET-25] Moderator — sidebar scope
**Priority:** Critical | **Est:** 10min
Login jako moderator (konto test). Sidebar: Dashboard, Profil, Projekty (MÓJ OBSZAR); Rejestracje/Aplikacje/Users/Team claims (ADMIN). **Brak:** edycje, mailing, certyfikaty, attendance, wyniki.

#### 26. [PRET-26] Moderator — aplikacje (może tylko co wolno)
**Priority:** Critical | **Est:** 10min
`/panel/admin/aplikacje` → cyan banner "Jesteś moderatorem". Może: zmienić status, dodać notatkę, wysłać interview invite. **NIE widzi:** "Utwórz profil uczestnika", "Utwórz profile (N)" top button.

#### 27. [PRET-27] Moderator — direct URL blocked
**Priority:** Critical | **Est:** 5min
Wpisz ręcznie URL: `/panel/admin/krakhack/edycje`, `/panel/admin/mailing`, `/panel/moj-zespol` → 🚫 "Brak dostępu".

#### 28. [PRET-28] Moderator — users (edit limited)
**Priority:** High | **Est:** 10min
`/panel/admin/uzytkownicy` → cyan banner. Edit innego usera → modal BEZ role/ban/delete/reset password. Tylko displayName/bio/github/linkedin/skills edytowalne.

---

### Lista: Pretest — Sesja 3 (jury + email + security)

#### 29. [PRET-29] Jury — magic link flow
**Priority:** Critical | **Est:** 20min
Admin generuje magic link → email do jurora → klik → `/jury/:token` → lista projektów → ocena 1 projektu (5 kategorii) → submit → F5 oceny zachowane.

#### 30. [PRET-30] Jury — wygasły token
**Priority:** Medium | **Est:** 5min
Manipulate URL `/jury/invalidtoken` → "Link expired" lub 401.

#### 31. [PRET-31] Jury — login przez /login
**Priority:** Medium | **Est:** 10min
Juror ma rolę Keycloak jury → `/login` → `/panel` → widzi card "Jesteś jurorem — użyj magic linka" + CTA mailto.

#### 32. [PRET-32] Email sender — lab emails
**Priority:** Critical | **Est:** 15min
Po kolei wywołaj akcje i sprawdź `from` w emailu:
- Submit `/dolacz` → confirmation → `possibilitieslab.org` ✓
- Admin create-profile dla scienceclub → `possibilitieslab.org` ✓
- Forgot password jako admin → `possibilitieslab.org` ✓
- Request-fill → `possibilitieslab.org` ✓
- Welcome email (status przyjęty) → `possibilitieslab.org` ✓

#### 33. [PRET-33] Email sender — hackathon emails
**Priority:** Critical | **Est:** 15min
Analogicznie dla krakhack:
- Submit `/hackathon` → confirmation → `krakhack.info` ✓
- Admin create-profile dla hackathon-participant → `krakhack.info` ✓
- Certyfikat wysłany → `krakhack.info` ✓
- Team edit link → `krakhack.info` ✓
- Interview invite (od moderator) → domyślnie 'lab' context? (do sprawdzenia)

#### 34. [PRET-34] Security — XSS w bio
**Priority:** Critical | **Est:** 15min
W `/panel/profil` wpisz `<script>alert('xss')</script>` w bio → save. Sprawdź w `/uczestnicy/:slug` i w admin panel — script **NIE** odpala.

#### 35. [PRET-35] Security — rola escalation via DevTools
**Priority:** Critical | **Est:** 15min
Login jako moderator → otwórz DevTools → wywołaj `fetch('/api/panel/users/<ADMIN_UUID>', {method:'DELETE', headers:{'Authorization':'Bearer ' + sessionStorage.kc_access_token}})` → expect 403.

#### 36. [PRET-36] Security — preview mode bypass
**Priority:** High | **Est:** 5min
Login jako scienceclub → URL `?preview=admin` → nie daje admin dostępu (preview tylko dla adminów).

#### 37. [PRET-37] Security — IDOR
**Priority:** Critical | **Est:** 15min
Login jako hackathon-participant. `fetch('/api/panel/users')` → 403. `fetch('/api/panel/users/<UUID>')` → 403. `fetch('/api/membership-applications')` → 403.

#### 38. [PRET-38] Security — jury token bruteforce
**Priority:** Medium | **Est:** 15min
Spróbuj 20 prób `/api/jury/verify?token=random` → każda 401, brak hint czy token istnieje/nie.

#### 39. [PRET-39] Security — double vote
**Priority:** High | **Est:** 10min
Zagłosuj. Przez DevTools zmień vote_id. Wyślij POST. Expect 409.

#### 40. [PRET-40] UI — responsywność mobile
**Priority:** High | **Est:** 20min
iPhone 375px viewport (DevTools). Przejdź po: `/`, `/panel`, `/panel/admin/aplikacje`, `/dolacz`, `/login`. Sprawdź czy sidebar ma hamburger, czy modal się zamyka, czy przyciski klikalne.

#### 41. [PRET-41] UI — długie teksty
**Priority:** Medium | **Est:** 10min
Wpisz nick = 200 chars. Email = 200 chars. Bio = 5000 chars. Sprawdź: truncation ellipsis w liście userów, pełny widok w modal edycji.

#### 42. [PRET-42] UI — empty states
**Priority:** Medium | **Est:** 10min
Filtruj aplikacje po "odrzucony" (pewnie 0). Sidebar scienceclub (brak admin items). Oczekiwane: friendly empty state, nie blank screen.

#### 43. [PRET-43] UI — loading states
**Priority:** Medium | **Est:** 10min
Throttle network do slow 3G. Wykonaj bulk create-profile z 10 userami. Oczekiwane: spinner/progress, button disabled, brak duplicate submit.

#### 44. [PRET-44] UI — error handling
**Priority:** High | **Est:** 10min
Wyłącz network → spróbuj submit formularza. Oczekiwane: user-friendly error message, bez stack trace.

#### 45. [PRET-45] UI — polskie znaki
**Priority:** Medium | **Est:** 5min
Wypełnij formularz z Ł, ń, ś, ź, ż, ó. Sprawdź wyświetlanie w każdym widoku.

## Bonus (opcjonalne, +2h)

#### 46. [PRET-BONUS-01] Performance — lighthouse score
**Est:** 15min
Uruchom Lighthouse na `/`, `/panel`, `/dolacz`. Oczekiwane: Performance >70, Accessibility >85.

#### 47. [PRET-BONUS-02] Accessibility — keyboard nav
**Est:** 15min
Przejdź po aplikacji tylko klawiaturą (Tab/Shift-Tab/Enter/Escape). Czy każdy interaktywny element focusable? Czy focus visible?

#### 48. [PRET-BONUS-03] Accessibility — screen reader
**Est:** 20min
VoiceOver (Mac) / NVDA (Windows) na `/login`, `/dolacz`, `/panel`. Czy komunikaty są zrozumiałe?

#### 49. [PRET-BONUS-04] Data export
**Est:** 15min
Admin — czy można pobrać CSV userów, aplikacji? Nie wszędzie zrealizowane (check w AdminApplications — jest Download CSV).

#### 50. [PRET-BONUS-05] Real cross-browser
**Est:** 30min
Powtórz top flow (signup → login → claim team) na Chrome + Firefox + Safari. Wyłapuj różnice rendering.

## Priorytety dla testera

**Must complete (Critical):** 1, 8, 12, 17, 18, 20, 25, 26, 27, 29, 32, 33, 34, 35, 37
**High value:** 4, 7, 13, 14, 15, 16, 22, 23, 28, 39, 40, 44
**Nice to have:** reszta
