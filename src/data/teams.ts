export interface TeamProject {
  id: string;
  name: string;
  placement?: number; // 1, 2, etc. or undefined for participation
  placementLabel?: string; // "1. miejsce", "2. miejsce"
  specialMention?: string; // "Wyróżnienie specjalne" etc.
  challenge: 'geospatial' | 'process-automation';
  members: string[];
  university?: string;
  projectName?: string;
  shortDescription: string;
  fullDescription: string[];
  keyFeatures: string[];
  technologies?: string[];
  images: TeamImage[];
  presentationSlides?: string[]; // URLs to slide screenshots
  presentationFile?: string; // URL to PDF/PPTX
}

export interface TeamImage {
  url: string; // Cloudinary URL or placeholder
  alt: string;
  caption?: string;
}

export const TEAMS: TeamProject[] = [
  {
    id: 'jakobiany',
    name: 'Jakobiany',
    placement: 1,
    placementLabel: '1. miejsce — Infrastructure',
    challenge: 'geospatial',
    members: ['Marlena Sadowska', 'Marcin Podyma', 'Adam Stajek'],
    projectName: 'System wspomagania decyzji — ścieżki rowerowe Krakowa',
    shortDescription: 'Dwumetodowy system analizy optymalnych lokalizacji dla nowych ścieżek rowerowych w Krakowie, łączący klasteryzację DBSCAN na heksagonach z algorytmem Dijkstry na grafie ulic.',
    fullDescription: [
      'Zespół Jakobiany zaprezentował system wspomagania decyzji dla urzędników miejskich w zakresie wytyczania nowych ścieżek rowerowych w Krakowie. Wyróżnikiem ich podejścia było zastosowanie dwóch komplementarnych metod analitycznych.',
      'Pierwsza metoda polegała na podziale obszaru Krakowa na ponad 4 tysiące heksagonów, dla każdego z których zebrano 10 parametrów środowiskowych i infrastrukturalnych: gęstość przystanków, odczyty z liczników rowerowych, gęstość stojaków rowerowych, dane o jakości powietrza z GIOŚ, bliskość terenów zielonych, gęstość zaludnienia oraz kluczowe punkty usługowe.',
      'Algorytm DBSCAN grupował heksagony w większe klastry bez konieczności z góry określonej liczby klastrów. Heksagony zbyt oddalone od skupisk były automatycznie odrzucane.',
      'Druga metoda operowała na grafie ulic Krakowa. Skrzyżowania stanowiły węzły, ulice krawędzie. Dla każdej krawędzi obliczano wagę zależną od 7 czynników, w tym hałasu, zanieczyszczenia powietrza i obecności istniejącej infrastruktury. Parametr blokujący zapewniał, że algorytm nie proponował tras tam, gdzie ścieżka już istnieje.',
    ],
    keyFeatures: [
      'Analiza heksagonalna z 10 parametrami środowiskowymi',
      'Klasteryzacja DBSCAN bez z góry określonej liczby klastrów',
      'Algorytm Dijkstry na grafie ulic z 7 czynnikami wagowymi',
      'Parametr blokujący — nie duplikuje istniejących ścieżek',
      'Podział na dzielnice (istotny administracyjnie)',
      'Łączenie istniejących tras w odległości poniżej 150m',
      'Porównanie Krakowa z innymi miastami pod kątem infrastruktury',
    ],
    technologies: ['Python', 'DBSCAN', 'Dijkstra', 'GIS', 'OpenStreetMap', 'GIOŚ'],
    images: [
      // TODO: Dodaj screeny z prezentacji
      // { url: 'https://res.cloudinary.com/...', alt: 'Mapa heksagonów Krakowa', caption: 'Podział na heksagony z parametrami' },
    ],
  },
  {
    id: 'databees',
    name: 'DataBees',
    challenge: 'geospatial',
    members: ['Bartłomiej Wieloch', 'Jakub Zydroń', 'Piotr Bacior', 'Konrad Podstawski'],
    projectName: 'Digital Twin — symulacja wieloagentowa sieci komunikacyjnej Krakowa',
    shortDescription: 'Cyfrowa kopia sieci komunikacyjnej Krakowa z pełną symulacją wieloagentową 36 000 rowerzystów w modelu MATSim, walidowana na 19 stacjach pomiarowych.',
    fullDescription: [
      'Zespół DataBees obrał najbardziej naukowo zaawansowane podejście — stworzyli cyfrowy bliźniak sieci komunikacyjnej Krakowa i przeprowadzili symulację wieloagentową z wykorzystaniem modelu MATSim.',
      'System bazował na danych z OpenStreetMap, Zarządu Transportu Publicznego Krakowa oraz z 19 stacji pomiarowych dostarczających dane dzienne z ostatnich 10 lat. Na podstawie dokumentów miejskich wyestymowano rozkład godzinowy ruchu.',
      'Sieć obejmowała trzy typy krawędzi: ścieżki rowerowe, chodniki (z obniżoną sztuczną prędkością odzwierciedlającą niższy komfort) oraz ulice. 36 000 agentów-rowerzystów generowano na podstawie gęstości zaludnienia z OpenStreetMap.',
      'Walidację przeprowadzono za pomocą metryki GEH na 19 punktach pomiarowych. Uzyskano zgodność na poziomie ok. 80%. Model wykazał, że wzrost ruchu nie powoduje liniowego wzrostu opóźnień.',
    ],
    keyFeatures: [
      'Cyfrowy bliźniak (digital twin) sieci komunikacyjnej',
      '36 000 agentów-rowerzystów w symulacji wieloagentowej',
      'Model MATSim z algorytmami genetycznymi (10 iteracji)',
      'Walidacja GEH na 19 stacjach pomiarowych — 80% zgodność',
      'Symulacja wzrostu ruchu o 50%',
      'Identyfikacja wąskich gardeł (chodniki, mosty)',
      'Dashboard z animacją godzinową przepustowości',
    ],
    technologies: ['Python', 'Java', 'MATSim', 'OpenStreetMap', 'GEH', 'GPR'],
    presentationFile: '/assets/presentations/databees.pdf',
    images: [],
  },
  {
    id: 'apex-velo',
    name: 'Apex Velo AI',
    challenge: 'geospatial',
    members: ['Marcin Pawłowski', 'Jakub Minorczyk', 'Paweł Wypych'],
    projectName: 'Nawigacja rowerowa z uwzględnieniem jakości powietrza',
    shortDescription: 'System nawigacji skupiony na zdrowiu rowerzystów — trasy omijające smog i hałas, z modułem dla urzędników do planowania nowej infrastruktury.',
    fullDescription: [
      'Apex Velo AI postawił na motyw zdrowotny i ekologiczny. Zespół rozpoczął od danych o zanieczyszczeniu powietrza w Krakowie — jednym z najbardziej zanieczyszczonych miast w Europie.',
      'Aplikacja miała dwa moduły: dla użytkowników indywidualnych (trasy omijające miejsca o wysokim stężeniu PM2.5/PM10) i dla decydentów miejskich (algorytm wskazujący, gdzie nowe drogi rowerowe są najbardziej potrzebne).',
      'Rozwiązanie bazowało na grafie, w którym węzły to skrzyżowania, a krawędzie to odcinki ulic z wagami uwzględniającymi zanieczyszczenie, hałas, bliskość terenów zielonych i bezpieczeństwo.',
    ],
    keyFeatures: [
      'Motywacja zdrowotna — ochrona przed ekspozycją na smog',
      'Dwa moduły: dla rowerzystów i dla decydentów miejskich',
      'Wagi uwzględniające PM2.5, PM10, hałas i zieleń',
      'Wybór między trasą szybszą a zdrowszą',
    ],
    technologies: ['Python', 'Graph algorithms', 'OpenStreetMap', 'GIOŚ'],
    presentationFile: '/assets/presentations/apex-velo.pdf',
    images: [],
  },
  {
    id: 'beznazwy',
    name: 'Beznazwy',
    challenge: 'geospatial',
    members: ['Szymon Adamczyk', 'Kamil Adamski', 'Patryk Chwalik'],
    projectName: 'Nawigacja multimodalna — rower + hulajnogi + pieszo',
    shortDescription: 'Aplikacja mobilna łącząca nawigację rowerową z integracją hulajnóg elektrycznych, oferująca trzy tryby tras: klasyczny, wygodny i cichy.',
    fullDescription: [
      'Zespół Beznazwy zaprojektował aplikację mobilną łączącą nawigację rowerową z integracją hulajnóg elektrycznych i mikromobilności (standard GBF-S, API firmy TOD).',
      'Trzy tryby tras: klasyczny (najkrótsza droga z OSM), wygodny (priorytet ścieżek rowerowych) i cichy (analiza natężenia hałasu, co przekłada się na bezpieczeństwo).',
      'System pobierał dane o lokalizacjach stojaków rowerowych z CEPP i automatycznie planował trasy multimodalne: pieszo do punktu odbioru hulajnogi, hulajnogą do punktu zwrotu, pieszo do celu.',
    ],
    keyFeatures: [
      'Zespół sformowany przypadkowo dzień przed hackathonem',
      'Trzy tryby tras: klasyczny, wygodny, cichy',
      'Integracja z hulajnogami (API TOD, standard GBF-S)',
      'Automatyczne planowanie trasy multimodalnej',
      'Priorytetyzacja: drogi rowerowe > pasy > kontrapasy',
      'Matematyka komfortu — system wag dla unikania dróg głównych',
    ],
    technologies: ['Python', 'NetworkX', 'FastAPI', 'OpenStreetMap', 'GBF-S API'],
    presentationFile: '/assets/presentations/beznazwy.pdf',
    images: [],
  },
  {
    id: 'bydgoskabears',
    name: 'BydgoskaBears — Prism',
    challenge: 'geospatial',
    members: ['Anand Chavan', 'Pratixan Sarmah', 'Ashutosh Pattnaik', 'Pooja Tanty'],
    projectName: 'Prism — personalizacja tras rowerowych',
    shortDescription: 'System personalizacji tras jak pryzmat rozszczepiający światło — różne optymalizowane trasy w zależności od profilu użytkownika (shortest, nature, tourist, mixed, custom).',
    fullDescription: [
      'Międzynarodowy zespół BydgoskaBears zaprezentował Prism — system personalizacji tras rowerowych. Jak pryzmat rozdziela światło na kolory, tak Prism oferuje różne zoptymalizowane trasy.',
      '4 predefiniowane profile plus profil niestandardowy: shortest (najkrótsza), nature (przez tereny zielone), tourist (muzea, galerie, toalety, bankomaty), mixed (kompromis) i custom (pełna personalizacja wag).',
      'Scoring opierał się na wielowymiarowej ocenie każdego odcinka: bezpieczeństwo, hałas, bliskość natury, dostęp do infrastruktury turystycznej.',
    ],
    keyFeatures: [
      'Zespół międzynarodowy',
      '5 profili tras: shortest, nature, tourist, mixed, custom',
      'Wielowymiarowy scoring odcinków',
      'Wizja: transfer wiedzy z miast o rozwiniętej infrastrukturze (Amsterdam)',
    ],
    technologies: ['Python', 'Graph algorithms', 'Scoring model'],
    images: [],
  },
  {
    id: 'mpz',
    name: 'MPZ',
    placement: 2,
    placementLabel: '2. miejsce — Infrastructure',
    challenge: 'geospatial',
    members: ['Emilia Masiak', 'Łukasz Jęcek', 'Alicja Świercz'],
    university: 'Politechnika Łódzka',
    projectName: 'NLP-driven nawigacja rowerowa + dashboard analityczny',
    shortDescription: 'Dwumodułowy system z przetwarzaniem języka naturalnego — rowerzysta opisuje potrzeby po polsku, a system wydobywa parametry trasy i generuje optymalne przejazdy.',
    fullDescription: [
      'MPZ zaprezentowało dwumodułowy system, w którym kluczową rolę odgrywa NLP. Użytkownik-rowerzysta komunikuje się z systemem po polsku, opisując swoje potrzeby naturalnym językiem.',
      'Warstwa NLP (LLM) wydobywała strukturyzowane dane z zapytania użytkownika i zamieniała na Structured Output. Zespół jasno podkreślił: LLM nie wyznacza trasy, służy wyłącznie do komunikacji.',
      'Silnik geoanalizy przetwarzał infrastrukturę liniową Krakowa jako graf ważony, gdzie kosztem krawędzi była autorska funkcja uwzględniająca długość trasy, bliskość terenów zielonych i poziom hałasu.',
      'Moduł analityczny dla urzędników oferował dashboard z mapą, preferencjami użytkowników, heat mapą punktów startowych/docelowych i rankingiem niebezpiecznych miejsc.',
    ],
    keyFeatures: [
      'Komunikacja naturalnym językiem polskim z LLM',
      'Jasne rozgraniczenie: LLM = komunikacja, nie routing',
      'Autorska funkcja kosztu na grafie ważonym',
      'Dashboard urzędnika: preferencje, heat mapy, ranking miejsc',
      'Demo na żywo z dwoma zapytaniami',
      'Wizja: trasy wielopunktowe, Karta Mieszkańca, dane live',
    ],
    technologies: ['Python', 'LLM', 'Structured Output', 'OpenStreetMap', 'ZTP Kraków'],
    presentationFile: '/assets/presentations/mpz.pdf',
    images: [],
  },
  {
    id: 'vibecoders',
    name: 'VibeCoders (Bikeholders)',
    placement: 1,
    placementLabel: '1. miejsce — Process Mining',
    challenge: 'process-automation',
    members: ['Mateusz Caputa', 'Marcin Pałys', 'Kacper Smaga'],
    projectName: 'Dashboard analityczny process mining',
    shortDescription: 'Kompleksowy dashboard analityczny generujący raporty z logów CSV, identyfikujący wąskie gardła i proponujący automatyzację procesów z wykorzystaniem AI.',
    fullDescription: [
      'VibeCoders stworzyli kompleksowy dashboard analityczny, który na podstawie załadowanych logów CSV generuje raporty, identyfikuje wąskie gardła i proponuje automatyzację procesów.',
      'Rozbudowane zakładki: Overview (przegląd), User Learning (analiza pracowników), Bottlenecks (zatory), Process Paths (warianty sekwencji), Live Monitoring (symulacja real-time), Automatyzacja (propozycje AI).',
      'Każda zawiła metryka miała przycisk generujący wyjaśnienie AI, co czyniło aplikację przyjazną dla nowych użytkowników.',
      'Kluczowe odkrycie z danych: średni przestój ok. 4 godzin, 452 tysiące operacji kopiowania, 25 aplikacji używanych przez pracowników.',
    ],
    keyFeatures: [
      'Dashboard z 6 zakładkami analitycznymi',
      'AI wyjaśnienia dla każdej zawiłej metryki',
      'Porównywanie efektywności pracowników',
      'Symulacja automatyzacji z rankingiem opłacalności',
      'Live monitoring z aktywnościami na żywo',
      'Identyfikacja: 4h przestoju, 452k operacji kopiowania',
    ],
    technologies: ['React', 'Python', 'AI/LLM', 'CSV processing', 'Process Mining'],
    presentationFile: '/assets/presentations/vibecoders.pdf',
    images: [],
  },
  {
    id: 'the-boys',
    name: 'The Boys',
    challenge: 'geospatial',
    members: ['Tymon Szyler', 'Mikołaj Klima', 'Miłosz Nowak', 'Michał Mróz'],
    university: 'AGH',
    projectName: 'SMART BIKE — nawigacja rowerowa',
    shortDescription: 'System nawigacji rowerowej z algorytmami optymalizacji tras, uwzględniający bezpieczeństwo i komfort jazdy na podstawie danych infrastrukturalnych Krakowa.',
    fullDescription: [
      'The Boys stworzyli Autonomous Compilot — system AI do automatycznej analizy procesów biznesowych. Rozwiązanie celowało w problem, który normalnie zajmuje konsultantom 3-6 tygodni.',
      'Pipeline obejmował: reprodukcję wariantów procesowych, wykrywanie opóźnień i wąskich gardeł, analizę behawioralną (click, copy-paste patterns), klasyfikację przez AI i generowanie raportu z diagramem BPMN.',
      'System łączył się z internetem w celu wyszukiwania najnowszych rozwiązań optymalizacyjnych, oferował automatyczny ranking procesów według potencjału oszczędności.',
    ],
    keyFeatures: [
      'Redukcja czasu analizy z 3-6 tygodni do minut',
      'Pipeline: reprodukcja, detekcja, klasyfikacja, rekomendacje',
      'Analiza behawioralna: click, copy-paste patterns',
      'Automatyczny ranking procesów wg potencjału oszczędności',
      'Generowanie raportów BPMN',
      'Zastosowanie: finanse, ochrona zdrowia, produkcja, e-commerce',
    ],
    technologies: ['Python', 'AI/LLM', 'BPMN', 'Process Mining'],
    presentationFile: '/assets/presentations/the-boys-slides.pdf',
    images: [],
  },
  {
    id: 'konrad-podstawski',
    name: 'Konrad Podstawski (solo)',
    placement: 3,
    placementLabel: '3. miejsce — Infrastructure',
    specialMention: 'Wyróżnienie specjalne — jedyny solowy uczestnik',
    challenge: 'geospatial',
    members: ['Konrad Podstawski'],
    projectName: 'By Your Trip — codzienna przygoda na rowerze',
    shortDescription: 'Jedyny solowy uczestnik — aplikacja odchodząca od "z A do B najszybciej" na rzecz urozmaicania codziennych dojazdów przez wybór "vibe\'ów" trasy.',
    fullDescription: [
      'Konrad Podstawski, jedyny solowy uczestnik hackathonu, zaprezentował By Your Trip — aplikację, która odchodzi od tradycyjnego podejścia na rzecz urozmaicania codziennych dojazdów.',
      'Użytkownik wybiera "vibe" — kierunek, w którym chce przesunąć trasę: zdrowotny (najlepsza jakość powietrza), miejski (tętniące życiem ulice), a nawet POS APO — celowo najgorsza trasa.',
      'Suwak regulował bliskość wybranego vibe\'u vs najkrótszej trasy. Architektura w pełni modularna — nowe moduły danych można dodawać bez przebudowy, system automatycznie balansuje wagi.',
    ],
    keyFeatures: [
      'Jedyny solowy uczestnik hackathonu',
      'Koncepcja "vibe\'ów" — kierunków urozmaicenia trasy',
      'Tryb POS APO — celowo najgorsza trasa',
      'Suwak regulacji bliskości vibe vs najkrótsza trasa',
      'W pełni modularna architektura',
      'Wizja: scraper + LLM do automatycznego wzbogacania danych',
    ],
    technologies: ['React', 'Heksagonalna siatka danych', 'Modular architecture'],
    images: [],
  },
];

export function getTeamBySlug(slug: string): TeamProject | undefined {
  return TEAMS.find((t) => t.id === slug);
}

export const WINNERS = TEAMS.filter((t) => t.placement !== undefined).sort((a, b) => (a.placement || 99) - (b.placement || 99));
export const SPECIAL_MENTIONS = TEAMS.filter((t) => t.specialMention !== undefined);
export const GEOSPATIAL_TEAMS = TEAMS.filter((t) => t.challenge === 'geospatial');
export const PROCESS_TEAMS = TEAMS.filter((t) => t.challenge === 'process-automation');
