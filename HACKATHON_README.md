# AI Krak Hack Landing Page

Landing page dla cyklicznego hackathonu AI z pełną obsługą wielu edycji i możliwością ponownego wykorzystania komponentów w materiałach drukowanych.

## 🎯 Główne funkcje

- **Edycja 2026 (Aktualna)**: Pełna strona rekrutacyjna z formularzem zgłoszeniowym
- **Edycja 2025 (Archiwum)**: Historia wydarzenia z galerią, statystykami i success story
- **Edition Switcher**: Łatwe przełączanie między edycjami w nagłówku
- **Modułowe komponenty**: Wszystkie sekcje zaprojektowane do ponownego użycia w materiałach drukowanych (A5/A3/roll-up/email)

## 📂 Struktura projektu

```
src/
├── app/
│   ├── components/           # Komponenty wielokrotnego użytku
│   │   ├── Header.tsx        # Nawigacja + Edition Switcher
│   │   ├── Hero.tsx          # Sekcja hero z CTA
│   │   ├── Timeline.tsx      # Harmonogram wydarzeń (⭐ core component)
│   │   ├── ValueCards.tsx    # Karty wartości/benefitów
│   │   ├── Program.tsx       # Opis programu + FAQ
│   │   ├── RegistrationForm.tsx  # Formularz zgłoszeniowy
│   │   ├── Stats.tsx         # Statystyki w liczbach
│   │   ├── Gallery.tsx       # Galeria z lightbox
│   │   ├── StoryBlocks.tsx   # Historia narracyjna wydarzenia
│   │   ├── SuccessStory.tsx  # Case study uczestnika
│   │   ├── CTABlock.tsx      # Call-to-action (konwersja)
│   │   └── Footer.tsx        # Stopka z kontaktem
│   │
│   ├── pages/
│   │   ├── Edition2026.tsx   # Strona aktualnej edycji
│   │   └── Edition2025.tsx   # Strona archiwum
│   │
│   ├── Layout.tsx            # Layout z header
│   ├── routes.ts             # Routing (react-router)
│   └── App.tsx               # Entry point
│
├── data/
│   └── editions.ts           # ⭐ Dane wszystkich edycji
│
└── types/
    └── edition.ts            # TypeScript types

```

## 🔧 Jak dodać nową edycję?

### 1. Dodaj dane nowej edycji w `/src/data/editions.ts`:

```typescript
export const editions: Record<string, Edition> = {
  '2027': {
    year: '2027',
    status: 'active',
    heroTitle: 'AI Krak Hack 2027',
    heroSubtitle: 'Opis wydarzenia...',
    heroDate: 'Maj 2027',
    ctaApplyUrl: '#formularz',
    timelineSteps: [...],
    highlights: [...],
    // ... pozostałe dane
  },
  // ... poprzednie edycje
};
```

### 2. Stwórz stronę dla nowej edycji w `/src/app/pages/Edition2027.tsx`:

Skopiuj i dostosuj `Edition2026.tsx` lub `Edition2025.tsx` w zależności od statusu (aktualna/archiwum).

### 3. Dodaj routing w `/src/app/routes.ts`:

```typescript
{
  path: '2027',
  Component: Edition2027,
}
```

### 4. Zaktualizuj Edition Switcher w `/src/app/components/Header.tsx`:

Dodaj nową opcję w dropdown menu.

## 📋 Kluczowe komponenty

### Timeline (⭐ Core Component)
Uniwersalny komponent harmonogramu, używany zarówno na stronie głównej jak i w archiwum:

```tsx
<Timeline 
  steps={edition.timelineSteps} 
  title="Harmonogram wydarzeń" 
/>
```

**Idealny do materiałów drukowanych**: może być wyrenderowany jako statyczny HTML i użyty w ulotkach A5/A3/roll-up.

### Hero
Sekcja początkowa z głównym CTA:
```tsx
<Hero
  title="AI Krak Hack 2026"
  subtitle="Opis..."
  date="Data: TBA"
  ctaUrl="#formularz"
  isArchive={false}
/>
```

### Gallery
Galeria z lightbox (używa `yet-another-react-lightbox`):
```tsx
<Gallery images={edition.gallery} />
```

### RegistrationForm
Formularz zgłoszeniowy (obecnie placeholder - wymaga podłączenia do prawdziwego API):
```tsx
<RegistrationForm />
```

## 🎨 Wykorzystanie w materiałach drukowanych

Wszystkie komponenty są zaprojektowane modularnie i mogą być wykorzystane w:

### Ulotka A5
- Hero (tytuł + CTA)
- 3 ValueCards
- Skrócony Timeline
- QR kod do strony

### Plakat A3
- Hero
- Pełny Timeline
- Stats (jeśli archiwum)
- Zdjęcie z galerii
- QR kod

### Roll-up
- Hero
- 1 grafika tła
- 1 główny CTA
- QR kod

### Email Template
- Header
- Hero (krótszy)
- Tekst + CTA
- Footer

**Proces**: Każdy komponent może być wyrenderowany jako statyczny HTML/React i wyeksportowany do narzędzi graficznych (Figma, Adobe) lub użyty w email templates.

## 📊 Model danych (Edition)

Każda edycja zawiera:

```typescript
interface Edition {
  year: string;
  status: 'upcoming' | 'active' | 'archive';
  heroTitle: string;
  heroSubtitle: string;
  heroDate?: string;
  ctaApplyUrl: string;
  timelineSteps: TimelineStep[];      // Harmonogram
  highlights: ValueCard[];             // Benefity/wartości
  program?: {                          // Program + FAQ
    title: string;
    description: string;
    faqs?: FAQ[];
  };
  stats?: Stat[];                      // Statystyki (tylko archiwum)
  gallery?: GalleryImage[];            // Galeria (tylko archiwum)
  // storyBlocks?: StoryBlock[];          // Historia wydarzenia
  successStory?: SuccessStory;         // Case study
  partners?: Partner[];                // Partnerzy/sponsorzy
}
```

**Sekcje opcjonalne** (np. `stats`, `gallery`, `successStory`) są automatycznie ukrywane, jeśli nie ma danych.

## 🔗 Nawigacja między edycjami

- **Domyślna strona**: `/` → Edycja 2026 (aktualna)
- **Archiwum**: `/2025` → Edycja 2025
- **Edition Switcher**: Dropdown w header pozwala przełączać się między edycjami

## ✅ Checklist przed publikacją

### Aktualna edycja (2026):
- [ ] Zaktualizuj daty w `timelineSteps`
- [ ] Podaj link do formularza w `ctaApplyUrl`
- [ ] Sprawdź czy wszystkie sekcje mają poprawne teksty
- [ ] Przetestuj działanie formularza (obecnie placeholder)

### Archiwum (2025):
- [ ] Dodaj zdjęcia z wydarzenia do `gallery` (z zgodami na publikację!)
- [ ] Wypełnij `storyBlocks` z historią wydarzenia
- [ ] Dodaj `successStory` (z zgodą uczestnika!)
- [ ] Uzupełnij `stats` (liczby rzeczywiste, nie szacowane)
- [ ] Dodaj logotypy partnerów

### Ogólne:
- [ ] Sprawdź responsive design (mobile/tablet/desktop)
- [ ] Przetestuj lightbox w galerii
- [ ] Sprawdź smooth scroll do sekcji
- [ ] Zweryfikuj wszystkie linki
- [ ] SEO: meta tags, og:image (do dodania w `index.html`)

## 🎨 Design System

Kolory (zgodne z dołączonymi obrazami Figma):
- **Primary Cyan**: `#06B6D4` (cyan-500)
- **Primary Pink**: `#EC4899` (pink-500)
- **Background**: Black (`#000000`) + Gray-900
- **Text**: White + Gray-300/400

Czcionki:
- Główna: System fonts (domyślnie)
- Nagłówki: Bold
- Tekst: Regular/Medium

## 🚀 Uruchomienie

```bash
# Instalacja zależności (już zainstalowane)
pnpm install

# Uruchomienie dev server
pnpm dev

# Build produkcyjny
pnpm build
```

## 📦 Wykorzystane biblioteki

- **react-router**: Routing między edycjami
- **motion/react**: Animacje (delikatne fade-in, slide-in)
- **yet-another-react-lightbox**: Lightbox dla galerii
- **lucide-react**: Ikony
- **tailwindcss**: Styling

## 🔮 Przyszłe ulepszenia (Nice-to-have)

1. **Backend integration**: Podłącz formularz do prawdziwego API/bazy danych
2. **CMS**: Dodaj CMS (np. Strapi, Sanity) do zarządzania treścią bez edycji kodu
3. **Newsletter**: Integracja z Mailchimp/SendGrid
4. **Analytics**: Google Analytics / Plausible do śledzenia konwersji
5. **A/B Testing**: Testowanie różnych wersji CTA
6. **Więcej animacji**: Parallax, scroll-triggered animations
7. **Blog/Aktualności**: Sekcja z wpisami o wydarzeniu

## 📝 Zgody i RODO

**WAŻNE**: Przed publikacją zdjęć, nazwisk i cytatów upewnij się, że masz:
- ✅ Zgodę na publikację wizerunku (zdjęcia osób)
- ✅ Zgodę na publikację nazwiska/danych osobowych
- ✅ Zgodę na publikację cytatu/opinii

W razie braku zgody:
- Użyj inicjałów zamiast pełnych nazwisk
- Anonimizuj success story
- Nie publikuj zdjęć z rozpoznawalnymi twarzami

## 📞 Kontakt dla zespołu

Jeśli masz pytania dotyczące struktury kodu lub potrzebujesz pomocy:
- Sprawdź komentarze w kodzie
- Zobacz typy TypeScript w `/src/types/edition.ts`
- Wszystkie komponenty mają wyraźne props interface

---

**Status projektu**: ✅ MVP gotowe  
**Data ostatniej aktualizacji**: Luty 2026
