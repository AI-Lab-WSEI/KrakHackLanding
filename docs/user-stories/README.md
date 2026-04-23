# User Stories — mapa funkcjonalna

Podzielone po aktorze. Format:

> **Jako** [rola] **chcę** [co] **żeby** [dlaczego].
> **Akceptacja:** [zachowanie systemu]
> **Ścieżka testowa:** [kroki UI]

## Aktorzy

1. [Anonim](anonymous.md) (niezalogowany, przegląda stronę, składa formularze)
2. [Kandydat na członka koła](candidate.md) (wypełnił `/dolacz`, czeka na odpowiedź)
3. [Uczestnik hackathonu](hackathon-participant.md)
4. [Członek koła](scienceclub-participant.md)
5. [Juror](jury.md) (magic link access)
6. [Moderator](moderator.md) (proxy-admin, ograniczony)
7. [Admin](admin.md) (pełny dostęp)

## Przeglądaj per flow

- [Rejestracja na hackathon](flows/hackathon-registration.md)
- [Aplikacja do koła](flows/club-application.md)
- [Onboarding nowego użytkownika](flows/onboarding.md)
- [Ocena projektów przez jury](flows/jury-scoring.md)
- [Reset hasła (self-service)](flows/forgot-password.md)
- [Discord/ClickUp request-fill](flows/integrations-request-fill.md)

## Kluczowe user stories (top 20 do testów)

### Priorytet 1 (must work dla go-live)

| # | Aktor | Story | Sekcja docs |
|---|---|---|---|
| 1 | Anonim | Zgłoszenie do koła przez `/dolacz` wizard (6 kroków) | [anonymous.md](anonymous.md) |
| 2 | Anonim | Rejestracja uczestnika hackathonu przez `/hackathon` formularze | [anonymous.md](anonymous.md) |
| 3 | Admin | Zalogowanie się do panelu i widzi wszystkie sekcje | [admin.md](admin.md) |
| 4 | Admin | Stworzenie profilu uczestnika z aplikacji do koła (1-click) | [flows/onboarding.md](flows/onboarding.md) |
| 5 | Admin | Bulk invite (utworzenie wielu profili naraz) | [admin.md](admin.md) |
| 6 | Admin | Rozgraniczenie emaili: hackathon → krakhack.info, koło → possibilitieslab.org | [flows/onboarding.md](flows/onboarding.md) |
| 7 | Moderator | Zalogowany widzi TYLKO swoje sekcje (Aplikacje, Users, Team claims, Rejestracje). Nie widzi edycji/mailingu/certów. | [moderator.md](moderator.md) |
| 8 | Nowy user (z temp hasłem) | Login z temp hasła → Keycloak wymusza zmianę → poprawnie ląduje w panelu | [flows/onboarding.md](flows/onboarding.md) |
| 9 | Hackathon-participant | Widzi "Mój zespół", może claim'ować zespół | [hackathon-participant.md](hackathon-participant.md) |
| 10 | Hackathon-participant | Potwierdza swoją obecność na hackathonie (attendance_confirmations) | [hackathon-participant.md](hackathon-participant.md) |
| 11 | Scienceclub-participant | Widzi "Mój kompas", NIE widzi "Mój zespół" | [scienceclub-participant.md](scienceclub-participant.md) |
| 12 | Jury | Loguje się przez magic link z emaila, ocenia projekty | [flows/jury-scoring.md](flows/jury-scoring.md) |
| 13 | Anyone | Zapomniałem hasła → forgot-password → dostaje nowe temp hasło mailem | [flows/forgot-password.md](flows/forgot-password.md) |
| 14 | Admin | Wysyła prośbę o uzupełnienie Discord/ClickUp do userów bez integracji | [flows/integrations-request-fill.md](flows/integrations-request-fill.md) |
| 15 | Admin | Przy pomocy "Podgląd jako..." widzi panel jak uczestnik koła bez zmiany ról | [admin.md](admin.md) |

### Priorytet 2 (nice-to-have, post-launch OK)

| # | Aktor | Story |
|---|---|---|
| 16 | Admin | Dodaje nową edycję hackathonu (CRUD edycji) |
| 17 | Admin | Generuje certyfikaty dla uczestników |
| 18 | Admin | Wysyła masowy mailing do uczestników |
| 19 | Admin | Wydarzenie dodane przez bot webhook (`/api/events/bot`) |
| 20 | Moderator | Zmienia status aplikacji koła bez adminki |

## Niespójności do weryfikacji

(to-do po self-audit w Fazie C)

- [ ] Czy po wejściu adminem na `/panel/moj-zespol` (preview=hackathon) akcja "Claim team" wykonuje się jako admin (a nie jako pseudo-participant)?
- [ ] Czy moderator, który otrzymał rolę ale nie jest uczestnikiem, ma dobrą UX po loginie (nie widzi dead-endów typu "Mój zespół" pusto)?
- [ ] Czy po utworzeniu profilu z aplikacji (create-profile) + failed email user ma jakąś ścieżkę do aktywacji konta? (obecnie: admin kopiuje temp hasło z UI i przekazuje offline)
- [ ] Czy UI w locie pokazuje poprawne context sender dla emaila? (np. membership confirmation z possibilitieslab.org, certyfikat z krakhack.info)
