export interface Collaboration {
  id: string;
  partner: string;
  partnerFull: string;
  partnerLogo: string;
  tagline: string;
  description: string;
  fullContent: string[];
  outcomes: string[];
  color: string;
}

export const COLLABORATIONS: Collaboration[] = [
  {
    id: 'ztp-krakow',
    partner: 'ZTP Kraków',
    partnerFull: 'Zarząd Transportu Publicznego w Krakowie',
    partnerLogo: '/assets/ztp-logo.webp',
    tagline: 'Optymalizacja sieci tramwajowej i rowerowej',
    description: 'Stworzyliśmy projekty z propozycjami wdrożeń optymalizacji sieci tramwajowej oraz rowerowej dla miasta Krakowa.',
    color: 'from-blue-500 to-cyan-600',
    fullContent: [
      'Współpraca AI Possibilities Lab z Zarządem Transportu Publicznego w Krakowie to jeden z naszych flagowych projektów łączących dane miejskie z nowoczesnymi metodami analizy i optymalizacji.',
      'W ramach AI Krak Hack nasi uczestnicy pracowali nad realnymi danymi z infrastruktury transportowej Krakowa, sieciami tramwajowymi, ścieżkami rowerowymi i danymi o ruchu.',
      'Zespoły stworzyły propozycje wdrożeń, które obejmowały optymalizację tras tramwajowych pod kątem przepustowości, analizę pokrycia miasta ścieżkami rowerowymi oraz modele predykcyjne dla natężenia ruchu.',
      // TODO: Rozwinąć o konkretne wyniki i metryki gdy będą dostępne
    ],
    outcomes: [
      'Propozycje optymalizacji sieci tramwajowej Krakowa',
      'Analiza i rekomendacje dla infrastruktury rowerowej',
      'Modele predykcyjne oparte na danych GIS',
      'Prezentacja wyników przed przedstawicielami ZTP Kraków',
      // TODO: Dodać więcej konkretnych wyników
    ],
  },
  {
    id: 'kyp',
    partner: 'KYP',
    partnerFull: 'KYP',
    partnerLogo: '/assets/kyp-logo.png',
    tagline: 'Przetwarzanie danych i automatyzacja procesów',
    description: 'W ramach hackathonu użytkownicy stworzyli wartość w obszarze przetwarzania danych, dostarczając innowacyjne rozwiązania.',
    color: 'from-purple-500 to-pink-600',
    fullContent: [
      'Współpraca z KYP w ramach AI Krak Hack skupiła się na wyzwaniach związanych z przetwarzaniem danych i automatyzacją procesów biznesowych.',
      'Uczestnicy hackathonu mieli dostęp do realnych danych i problemów firmy, tworząc rozwiązania, które mogą być bezpośrednio wdrożone w środowisku produkcyjnym.',
      // TODO: Rozwinąć o konkretny opis współpracy i wyników
    ],
    outcomes: [
      'Innowacyjne rozwiązania do przetwarzania danych',
      'Proof-of-concept gotowy do dalszego rozwoju',
      'Wartość biznesowa dostarczona w 24h hackathonu',
      // TODO: Dodać więcej konkretnych wyników
    ],
  },
  // ─── Placeholder: odkomentuj gdy pojawią się nowe współprace ───
  // {
  //   id: 'nowa-firma',
  //   partner: 'Nazwa firmy',
  //   partnerFull: 'Pełna nazwa firmy',
  //   partnerLogo: '/assets/firma-logo.png',
  //   tagline: 'Krótki opis współpracy',
  //   description: 'Opis współpracy widoczny na stronie O nas.',
  //   color: 'from-green-500 to-teal-600',
  //   fullContent: ['Pełny opis współpracy...'],
  //   outcomes: ['Wynik 1', 'Wynik 2'],
  // },
];

export function getCollaborationBySlug(slug: string): Collaboration | undefined {
  return COLLABORATIONS.find((c) => c.id === slug);
}
