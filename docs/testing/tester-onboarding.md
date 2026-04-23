# Onboarding pretestera — wiadomość + Loom script

> Skopiuj wiadomość poniżej, wyślij pretesterowi + nagraj Loom wg script'u. Credentials przekaż osobno (1Password / Signal / bezpieczny kanał).

## Wiadomość do pretestera

### Wariant A: pełny brief (email / Slack długi)

```
Cześć [IMIĘ]!

Dzięki, że weźmiesz się za pretest mojego panelu przed startem
AI Krak Hack 2026 / AI Possibilities Lab. Poniżej wszystko czego potrzebujesz.

## Co testujesz

Panel admina + panel uczestnika dla dwóch nurtów:
  • AI Krak Hack — hackathon (uczestnicy, jury, certyfikaty)
  • AI Possibilities Lab — koło naukowe (członkowie, kompas kompetencji)

System rozpoznaje role użytkowników (admin, moderator, uczestnik hackathonu,
członek koła, jury, anonim) i pokazuje inny widok dla każdej.

## Czas

Zaplanowane: 6h w 1-3 dniach (~2h dziennie). Nie musisz robić wszystkiego —
priorytet: tasks oznaczone jako "Critical".

## Gdzie jest dokumentacja

Repo GitHub:        https://github.com/AI-Lab-WSEI/KrakHackLanding
Docs root:          /docs/README.md
Plan testowy:       /docs/testing/test-plan.md  ← czytać pierwsze!
ClickUp taski:      /docs/testing/clickup-tasks.md  (już są w ClickUp Listach)
Bug template:       /docs/testing/bug-report-template.md
Security checklist: /docs/testing/security-checklist.md

## Konta do testów

Przekażę osobno (Signal / 1Password):
  • Admin              (michalmadejski2@gmail.com)
  • Moderator          (pretest-moderator@...)
  • Uczestnik hack.    (pretest-hackathon@...)
  • Członek koła       (pretest-club@...)
  • Juror              (pretest-jury@...)
  • No-role            (pretest-norole@...)

Loguj się na https://www.krakhack.info/login

## Jak zgłaszać

Dla każdego buga / UX issue / security concern — użyj template z
/docs/testing/bug-report-template.md, dodaj jako task w ClickUp Liście
"Pretest bugs" albo wrzuć mi na maila/Signala.

Format: severity (Critical/High/Medium/Low) + kroki do reprodukcji +
expected vs actual + screenshot/HAR jeśli network-related.

## Priorytety

1. CRITICAL bugi (zwłaszcza security: role escalation, XSS, IDOR) — zgłoś NATYCHMIAST
2. High priority — zgłoś w ramach sesji
3. Medium / Low — batch na końcu dnia

## Environment

Test robisz bezpośrednio na produkcji (https://www.krakhack.info).
Dane testowe są izolowane (konta z domeną @test.krakhack.info) — nie
zaszkodzisz nic realnym userom. Po pretest wyczyszczę konta.

## Co NIE jest bugiem

Zobacz sekcję "Znane ograniczenia" w /docs/testing/test-plan.md.

Powodzenia! W razie pytań — napisz do mnie na WhatsApp / Signal.

Michał
```

---

### Wariant B: krótki brief (SMS / Discord DM)

```
Cześć! Prosiłbym o pretest panelu przed hackathonem (6h rozłożone na
1-3 dni). Wszystko tu: https://github.com/AI-Lab-WSEI/KrakHackLanding/
blob/main/docs/README.md  Start od docs/testing/test-plan.md.
Konta + hasła przekażę osobno. Dzięki! 🙏
```

---

## Loom script (Video orientation — 5 min)

Script na nagranie orientacji wizualnej. Tempo naturalne, opowiadaj przy pokazywaniu.

### 0:00 — Intro (30s)
> "Cześć [imię], tu Michał. Krótki walkthrough co zobaczysz w panelu i na co zwrócić szczególną uwagę podczas testu."

### 0:30 — Kontekst i cel (45s)
> "To jest panel admina + uczestnika dla dwóch rzeczy: AI Krak Hack i naszego koła naukowego. System ma sześć ról i każda widzi inny widok. Moim głównym zmartwieniem jest że role mogą wyciekać uprawnienia — np. moderator widzi coś admin-only — więc security to #1 priorytet."

### 1:15 — Pokazuję admin panel (60s)
> "Zaloguj się jako admin, pokażę Ci Dashboard, sidebar, ContextSwitcher (KRAK HACK / AI LAB / SYSTEM), preview mode (segmented control)."
>
> Klikać: `/panel` → show KPIs → switch `?preview=hackathon` → show amber banner.
>
> "Zwróć uwagę na preview mode — admin powinien móc podglądać jak uczestnik, ale URL ?preview=hackathon dla nie-admina musi być zignorowany — testuj to."

### 2:15 — Pokazuję moderator (45s)
> "Moderator jest nową rolą — sidebar ma tylko 4 sekcje: Rejestracje, Aplikacje koła, Users, Team claims. Wszystko admin-only dla moderatora powinno być zablokowane."
>
> Login jako moderator, show sidebar, klik /panel/admin/krakhack/edycje → `🚫 Brak dostępu`.

### 3:00 — Panel uczestnika (45s)
> "Uczestnik hackathonu widzi Mój zespół, Moja obecność, Głosowanie. Uczestnik koła widzi Mój kompas. Nie przecinają się."
>
> Pokazać oba logowania, różnicę w sidebar.

### 3:45 — Flow create-profile (45s)
> "Najważniejszy admin flow: w Aplikacjach koła rozwijam wiersz, klikam Utwórz profil uczestnika. Modal pokazuje preview tego co będzie skopiowane z aplikacji — bio z 3 sekcji, skills z kompetencji ≥5. Email z hasłem powinien lecieć."

### 4:30 — Co na pewno sprawdź (30s)
> "Priorytety: (1) moderator nie może wywołać admin-only endpointu, nawet przez DevTools; (2) XSS w bio nie odpala `<script>`; (3) preview mode nie działa dla nie-adminów; (4) email lab vs hackathon — krakhack.info dla hacku, possibilitieslab.org dla koła."

### 5:00 — Outro
> "Pytania → DM. Bugi → ClickUp + template. Dzięki że się za to wzięłaś/wziąłeś!"

---

## Checklist for admin przed pretest

- [ ] Utwórz 5 test kont (skrypt w test-accounts.md)
- [ ] Wygeneruj magic link dla jury test account
- [ ] Prześlij pretesterowi wiadomość + credentials (bezpiecznym kanałem)
- [ ] Nagraj Loom (5 min) wg scriptu powyżej
- [ ] Utwórz w ClickUp Listę "Pretest bugs" (albo użyj Issues GH)
- [ ] Przypomnij: docs/testing/ jest Source of Truth — read first
- [ ] Ustal deadline (np. "do piątku end of day")

## Po pretest — follow-up

- [ ] Review wszystkich zgłoszonych bugów, przypisz priorytet
- [ ] Fix Critical i High w kolejnej sesji
- [ ] Medium / Low — backlog
- [ ] Thank you message + podziękowanie publiczne (credits w docs?)
- [ ] Cleanup test kont (DELETE cascaduje Keycloak + DB)
