-- Faza 11.2: seed przykładowych danych dla kalendarza.
-- Wstrzykuje ~15 przykładowych entries różnych kategorii w nadchodzących
-- 60 dniach — demonstruje działanie filtrów i kolorystyki w UI.
-- Bezpieczne do re-run: wszystkie wpisy mają unikalne title+starts_at (UPSERT
-- via NOT EXISTS).

DO $$
BEGIN
  -- Cotygodniowe spotkania koła (pn 18:00)
  FOR i IN 0..7 LOOP
    INSERT INTO calendar_entries (title, description, category, starts_at, ends_at, location, visibility)
    SELECT
      'Spotkanie koła AI Lab #' || (i+1),
      'Cotygodniowe spotkanie — prezentacje projektów, dyskusje, planowanie.',
      'meeting',
      date_trunc('week', NOW()) + (i * INTERVAL '7 days') + INTERVAL '18 hours',
      date_trunc('week', NOW()) + (i * INTERVAL '7 days') + INTERVAL '20 hours',
      'WSEI Kraków, sala A2.3',
      'members_only'
    WHERE NOT EXISTS (
      SELECT 1 FROM calendar_entries
      WHERE title = 'Spotkanie koła AI Lab #' || (i+1)
    );
  END LOOP;

  -- Deadline rekrutacja
  INSERT INTO calendar_entries (title, description, category, starts_at, all_day, visibility)
  SELECT 'Deadline: rekrutacja wiosenna 2026', 'Ostatni dzień na wysłanie aplikacji do AI Possibilities Lab.',
         'deadline', (NOW() + INTERVAL '21 days')::date, true, 'public'
  WHERE NOT EXISTS (SELECT 1 FROM calendar_entries WHERE title = 'Deadline: rekrutacja wiosenna 2026');

  -- Konferencja AI
  INSERT INTO calendar_entries (title, description, category, starts_at, ends_at, location, url, visibility)
  SELECT 'AI Summit Kraków 2026', 'Konferencja AI — zapraszamy członków koła, bilety dla 5 osób.',
         'conference', (NOW() + INTERVAL '14 days')::date + INTERVAL '9 hours',
         (NOW() + INTERVAL '14 days')::date + INTERVAL '18 hours',
         'ICE Kraków', 'https://aisummit.pl', 'public'
  WHERE NOT EXISTS (SELECT 1 FROM calendar_entries WHERE title = 'AI Summit Kraków 2026');

  -- Warsztat LangChain
  INSERT INTO calendar_entries (title, description, category, starts_at, ends_at, location, visibility)
  SELECT 'Warsztat: LangChain + RAG od zera', 'Hands-on warsztat — zbudujemy prosty RAG pipeline. Wymagany laptop, Python 3.11+.',
         'workshop', (NOW() + INTERVAL '9 days')::date + INTERVAL '17 hours',
         (NOW() + INTERVAL '9 days')::date + INTERVAL '21 hours',
         'WSEI Kraków, lab 1.8', 'members_only'
  WHERE NOT EXISTS (SELECT 1 FROM calendar_entries WHERE title = 'Warsztat: LangChain + RAG od zera');

  -- Hackathon 2026 day
  INSERT INTO calendar_entries (title, description, category, starts_at, ends_at, location, url, visibility)
  SELECT 'AI Krak Hack 2026 — Main Day', '24-godzinny hackathon, 3 challenge areas. Rejestracja do 2026-04-30.',
         'hackathon', '2026-05-17 08:00:00+00'::timestamptz, '2026-05-18 20:00:00+00'::timestamptz,
         'WSEI Kraków', 'https://krakhack.info', 'public'
  WHERE NOT EXISTS (SELECT 1 FROM calendar_entries WHERE title = 'AI Krak Hack 2026 — Main Day');

  -- Wewnętrzny plan sprintowy
  INSERT INTO calendar_entries (title, description, category, starts_at, all_day, visibility)
  SELECT 'Sprint planning: Q2 roadmap', 'Wewnętrzne planowanie projektów koła na Q2.',
         'internal', (NOW() + INTERVAL '3 days')::date, true, 'admin_only'
  WHERE NOT EXISTS (SELECT 1 FROM calendar_entries WHERE title = 'Sprint planning: Q2 roadmap');

  -- Other
  INSERT INTO calendar_entries (title, description, category, starts_at, location, visibility)
  SELECT 'Wyjście integracyjne koła', 'Kręgle + pizza po semestralnym projekcie.',
         'other', (NOW() + INTERVAL '28 days')::date + INTERVAL '19 hours',
         'Kręgielnia Galeria Plaza', 'members_only'
  WHERE NOT EXISTS (SELECT 1 FROM calendar_entries WHERE title = 'Wyjście integracyjne koła');
END $$;
