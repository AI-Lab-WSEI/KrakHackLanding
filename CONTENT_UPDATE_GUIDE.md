# Przewodnik aktualizacji treści - AI Krak Hack

Ten dokument pokazuje jak łatwo zaktualizować treści na stronie **bez znajomości programowania**.

## 📝 Gdzie znajdują się treści?

Wszystkie teksty, daty, zdjęcia i inne treści znajdują się w jednym pliku:

```
/src/data/editions.ts
```

## 🔄 Jak zaktualizować treści dla edycji 2026?

Otwórz plik `/src/data/editions.ts` i znajdź sekcję `'2026'`. Poniżej znajdziesz co możesz zmienić:

### 1. Tytuł i opis główny (Hero)

```typescript
heroTitle: 'AI Krak Hack 2026',
heroSubtitle: 'Najlepszy hackathon AI w Krakowie...',  // ← ZMIEŃ TEN TEKST
heroDate: 'Data: TBA',  // ← ZMIEŃ NA KONKRETNĄ DATĘ, np. '15-16 Maja 2026'
```

### 2. Link do formularza zgłoszeniowego

```typescript
ctaApplyUrl: '#formularz',  // ← ZMIEŃ NA LINK DO PRAWDZIWEGO FORMULARZA
// Przykład: 'https://forms.google.com/twoj-formularz'
```

### 3. Harmonogram (Timeline)

```typescript
timelineSteps: [
  {
    title: 'Rekrutacja',
    dateRange: 'Luty - Marzec 2026',  // ← ZMIEŃ DATY
    description: 'Otwarte zgłoszenia...',  // ← ZMIEŃ OPIS
    color: 'cyan',  // cyan lub pink
  },
  // ... dodaj więcej etapów lub edytuj istniejące
]
```

**Jak dodać nowy etap?**
Skopiuj cały blok { ... } i dodaj kolejny przed lub po istniejącym:

```typescript
{
  title: 'Workshop przygotowawczy',
  dateRange: '10 Maja 2026',
  description: 'Wprowadzenie do technologii AI',
  color: 'pink',
},
```

### 4. Benefity (Value Cards)

```typescript
highlights: [
  {
    icon: 'Users',  // Nazwa ikony (lista poniżej)
    title: 'Rozwój Umiejętności AI',
    description: 'Praktyczne zastosowanie...',  // ← ZMIEŃ TEKST
  },
  // ... edytuj lub dodaj kolejne
]
```

**Dostępne ikony**: Users, Database, Lightbulb, Code, Network, Trophy, Award, Star, Zap, Target, TrendingUp, CheckCircle

### 5. Program i FAQ

```typescript
program: {
  title: 'Jak to działa?',
  description: 'AI Krak Hack to intensywny hackathon...',  // ← ZMIEŃ OPIS
  faqs: [
    {
      question: 'Czy muszę mieć doświadczenie z AI?',  // ← ZMIEŃ PYTANIE
      answer: 'Nie! Przyjmujemy uczestników...',  // ← ZMIEŃ ODPOWIEDŹ
    },
    // ... dodaj więcej pytań
  ]
}
```

### 6. Partnerzy

```typescript
partners: [
  { name: 'AI Possibilities Lab' },
  { name: 'AGH UST' },
  { name: 'Nazwa Twojego Partnera' },  // ← DODAJ NOWEGO PARTNERA
]
```

## 📸 Jak dodać zdjęcia do archiwum (edycja 2025)?

### Po zakończeniu wydarzenia:

1. **Przygotuj zdjęcia**:
   - Upewnij się, że masz zgodę na publikację
   - Zdjęcia powinny być odpowiedniej jakości (min. 1080px szerokości)
   - Prześlij zdjęcia do serwisu typu Unsplash, Imgur lub własnego serwera

2. **Zaktualizuj galerię w pliku** `/src/data/editions.ts`:

```typescript
gallery: [
  {
    imageUrl: 'https://twoja-strona.com/zdjecie1.jpg',  // ← LINK DO ZDJĘCIA
    alt: 'Zespół podczas hackathonu',  // ← OPIS ALTERNATYWNY
    caption: 'Zespoły pracują nad projektami AI',  // ← OPCJONALNY PODPIS
  },
  // ... dodaj więcej zdjęć (10-30 zdjęć)
]
```

## 📊 Jak dodać statystyki (po wydarzeniu)?

```typescript
stats: [
  { value: '50+', label: 'Uczestników' },  // ← ZMIEŃ LICZBY NA PRAWDZIWE
  { value: '12', label: 'Zespołów' },
  { value: '8', label: 'Mentorów' },
  // ... edytuj lub dodaj nowe statystyki
]
```

## 💬 Jak dodać Success Story?

**WAŻNE**: Musisz mieć zgodę uczestnika na publikację!

```typescript
successStory: {
  personNameOrAlias: 'Anna K.',  // ← IMIĘ LUB INICJAŁY
  role: 'Studentka Informatyki, AGH',  // ← ROLA/STATUS
  whatDid: 'Uczestniczka AI Krak Hack 2025...',  // ← CO ZROBIŁA
  outcome: 'Otrzymała ofertę praktyk...',  // ← EFEKT/REZULTAT
  quote: 'AI Krak Hack był punktem zwrotnym...',  // ← CYTAT
  links: [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/...' },  // ← OPCJONALNE LINKI
  ],
  imageUrl: 'https://link-do-zdjecia.jpg',  // ← ZDJĘCIE (opcjonalne)
}
```

## 📖 Jak dodać historię wydarzenia (Story Blocks)?

```typescript
storyBlocks: [
  {
    title: 'Start hackathonu',  // ← TYTUŁ BLOKU
    text: 'Pierwsza edycja AI Krak Hack...',  // ← TREŚĆ (4-6 zdań)
  },
  {
    title: 'Praca zespołowa',
    text: 'Przez 24 godziny, 12 zespołów...',
  },
  // ... dodaj 4-6 bloków opisujących przebieg wydarzenia
]
```

## ✅ Checklist przed publikacją

### Przed wydarzeniem (edycja 2026):
- [ ] Zaktualizuj daty w `heroDate`
- [ ] Zaktualizuj wszystkie etapy w `timelineSteps`
- [ ] Dodaj link do formularza w `ctaApplyUrl`
- [ ] Sprawdź teksty w `highlights` i `program`
- [ ] Dodaj partnerów w `partners`

### Po wydarzeniu (przygotowanie archiwum 2025):
- [ ] Dodaj prawdziwe zdjęcia do `gallery` (z zgodami!)
- [ ] Uzupełnij prawdziwe liczby w `stats`
- [ ] Napisz historię wydarzenia w `storyBlocks`
- [ ] Dodaj `successStory` (z zgodą uczestnika!)
- [ ] Zaktualizuj listę partnerów

## 🚨 Częste błędy do uniknięcia

❌ **NIE usuwaj** przecinków między elementami:
```typescript
{ name: 'Partner 1' },  // ← TO PRZECINEK JEST WAŻNY
{ name: 'Partner 2' }   // ← ostatni element BEZ przecinka
```

❌ **NIE usuwaj** nawiasów `[ ]` i `{ }`:
```typescript
gallery: [  // ← TO MUSI BYĆ
  { ... },  // ← TO MUSI BYĆ
]  // ← TO MUSI BYĆ
```

✅ **Zawsze** używaj cudzysłowów dla tekstu:
```typescript
title: 'Mój tytuł',  // ← DOBRZE
title: Mój tytuł,    // ← ŹLE (brakuje cudzysłowów)
```

## 🆘 Pomoc

Jeśli coś pójdzie nie tak:
1. Sprawdź czy nie usunąłeś przypadkiem przecinka lub nawiasu
2. Upewnij się, że wszystkie teksty są w cudzysłowach `' '`
3. Możesz zawsze cofnąć zmiany w Git (jeśli używasz)

## 📞 Kontakt techniczny

Jeśli masz problemy z aktualizacją treści, skontaktuj się z osobą techniczną w zespole.

---

**Pamiętaj**: Każda zmiana w pliku `editions.ts` automatycznie zaktualizuje stronę po przebudowaniu!
