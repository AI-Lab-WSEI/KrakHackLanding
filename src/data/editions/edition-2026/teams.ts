export interface TeamProject {
  id: string;
  name: string;
  placement?: number; // 1, 2, etc. or undefined for participation
  placementLabel?: string; // "1. miejsce", "2. miejsce"
  specialMention?: string; // "Wyr\u00f3\u017cnienie specjalne" etc.
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
    placementLabel: '1. miejsce \u2014 Infrastructure',
    challenge: 'geospatial',
    members: ['Marlena Sadowska', 'Marcin Podyma', 'Adam Stajek'],
    projectName: 'System wspomagania decyzji \u2014 \u015bcie\u017cki rowerowe Krakowa',
    shortDescription: 'Dwumetodowy system analizy optymalnych lokalizacji dla nowych \u015bcie\u017cek rowerowych w Krakowie, \u0142\u0105cz\u0105cy klasteryzacj\u0119 DBSCAN na heksagonach z algorytmem Dijkstry na grafie ulic.',
    fullDescription: [
      'Zesp\u00f3\u0142 Jakobiany zaprezentowa\u0142 system wspomagania decyzji dla urz\u0119dnik\u00f3w miejskich w zakresie wytyczania nowych \u015bcie\u017cek rowerowych w Krakowie. Wyr\u00f3\u017cnikiem ich podej\u015bcia by\u0142o zastosowanie dw\u00f3ch komplementarnych metod analitycznych.',
      'Pierwsza metoda polega\u0142a na podziale obszaru Krakowa na ponad 4 tysi\u0105ce heksagon\u00f3w, dla ka\u017cdego z kt\u00f3rych zebrano 10 parametr\u00f3w \u015brodowiskowych i infrastrukturalnych: g\u0119sto\u015b\u0107 przystank\u00f3w, odczyty z licznik\u00f3w rowerowych, g\u0119sto\u015b\u0107 stojak\u00f3w rowerowych, dane o jako\u015bci powietrza z GIO\u015a, blisko\u015b\u0107 teren\u00f3w zielonych, g\u0119sto\u015b\u0107 zaludnienia oraz kluczowe punkty us\u0142ugowe.',
      'Algorytm DBSCAN grupowa\u0142 heksagony w wi\u0119ksze klastry bez konieczno\u015bci z g\u00f3ry okre\u015blonej liczby klastr\u00f3w. Heksagony zbyt oddalone od skupisk by\u0142y automatycznie odrzucane.',
      'Druga metoda operowa\u0142a na grafie ulic Krakowa. Skrzy\u017cowania stanowi\u0142y w\u0119z\u0142y, ulice kraw\u0119dzie. Dla ka\u017cdej kraw\u0119dzi obliczano wag\u0119 zale\u017cn\u0105 od 7 czynnik\u00f3w, w tym ha\u0142asu, zanieczyszczenia powietrza i obecno\u015bci istniej\u0105cej infrastruktury. Parametr blokuj\u0105cy zapewnia\u0142, \u017ce algorytm nie proponowa\u0142 tras tam, gdzie \u015bcie\u017cka ju\u017c istnieje.',
    ],
    keyFeatures: [
      'Analiza heksagonalna z 10 parametrami \u015brodowiskowymi',
      'Klasteryzacja DBSCAN bez z g\u00f3ry okre\u015blonej liczby klastr\u00f3w',
      'Algorytm Dijkstry na grafie ulic z 7 czynnikami wagowymi',
      'Parametr blokuj\u0105cy \u2014 nie duplikuje istniej\u0105cych \u015bcie\u017cek',
      'Podzia\u0142 na dzielnice (istotny administracyjnie)',
      '\u0141\u0105czenie istniej\u0105cych tras w odleg\u0142o\u015bci poni\u017cej 150m',
      'Por\u00f3wnanie Krakowa z innymi miastami pod k\u0105tem infrastruktury',
    ],
    technologies: ['Python', 'DBSCAN', 'Dijkstra', 'GIS', 'OpenStreetMap', 'GIO\u015a'],
    images: [
      // TODO: Dodaj screeny z prezentacji
      // { url: 'https://res.cloudinary.com/...', alt: 'Mapa heksagon\u00f3w Krakowa', caption: 'Podzia\u0142 na heksagony z parametrami' },
    ],
  },
  {
    id: 'databees',
    name: 'DataBees',
    challenge: 'geospatial',
    members: ['Bart\u0142omiej Wieloch', 'Jakub Zydro\u0144', 'Piotr Bacior', 'Konrad Podstawski'],
    projectName: 'Digital Twin \u2014 symulacja wieloagentowa sieci komunikacyjnej Krakowa',
    shortDescription: 'Cyfrowa kopia sieci komunikacyjnej Krakowa z pe\u0142n\u0105 symulacj\u0105 wieloagentow\u0105 36 000 rowerzyst\u00f3w w modelu MATSim, walidowana na 19 stacjach pomiarowych.',
    fullDescription: [
      'Zesp\u00f3\u0142 DataBees obra\u0142 najbardziej naukowo zaawansowane podej\u015bcie \u2014 stworzyli cyfrowy bli\u017aniak sieci komunikacyjnej Krakowa i przeprowadzili symulacj\u0119 wieloagentow\u0105 z wykorzystaniem modelu MATSim.',
      'System bazowa\u0142 na danych z OpenStreetMap, Zarz\u0105du Transportu Publicznego Krakowa oraz z 19 stacji pomiarowych dostarczaj\u0105cych dane dzienne z ostatnich 10 lat. Na podstawie dokument\u00f3w miejskich wyestymowano rozk\u0142ad godzinowy ruchu.',
      'Sie\u0107 obejmowa\u0142a trzy typy kraw\u0119dzi: \u015bcie\u017cki rowerowe, chodniki (z obni\u017con\u0105 sztuczn\u0105 pr\u0119dko\u015bci\u0105 odzwierciedlaj\u0105c\u0105 ni\u017cszy komfort) oraz ulice. 36 000 agent\u00f3w-rowerzyst\u00f3w generowano na podstawie g\u0119sto\u015bci zaludnienia z OpenStreetMap.',
      'Walidacj\u0119 przeprowadzono za pomoc\u0105 metryki GEH na 19 punktach pomiarowych. Uzyskano zgodno\u015b\u0107 na poziomie ok. 80%. Model wykaza\u0142, \u017ce wzrost ruchu nie powoduje liniowego wzrostu op\u00f3\u017anie\u0144.',
    ],
    keyFeatures: [
      'Cyfrowy bli\u017aniak (digital twin) sieci komunikacyjnej',
      '36 000 agent\u00f3w-rowerzyst\u00f3w w symulacji wieloagentowej',
      'Model MATSim z algorytmami genetycznymi (10 iteracji)',
      'Walidacja GEH na 19 stacjach pomiarowych \u2014 80% zgodno\u015b\u0107',
      'Symulacja wzrostu ruchu o 50%',
      'Identyfikacja w\u0105skich garde\u0142 (chodniki, mosty)',
      'Dashboard z animacj\u0105 godzinow\u0105 przepustowo\u015bci',
    ],
    technologies: ['Python', 'Java', 'MATSim', 'OpenStreetMap', 'GEH', 'GPR'],
    presentationFile: '/assets/presentations/databees.pdf',
    images: [],
  },
  {
    id: 'apex-velo',
    name: 'Apex Velo AI',
    challenge: 'geospatial',
    members: ['Marcin Paw\u0142owski', 'Jakub Minorczyk', 'Pawe\u0142 Wypych'],
    projectName: 'Nawigacja rowerowa z uwzgl\u0119dnieniem jako\u015bci powietrza',
    shortDescription: 'System nawigacji skupiony na zdrowiu rowerzyst\u00f3w \u2014 trasy omijaj\u0105ce smog i ha\u0142as, z modu\u0142em dla urz\u0119dnik\u00f3w do planowania nowej infrastruktury.',
    fullDescription: [
      'Apex Velo AI postawi\u0142 na motyw zdrowotny i ekologiczny. Zesp\u00f3\u0142 rozpocz\u0105\u0142 od danych o zanieczyszczeniu powietrza w Krakowie \u2014 jednym z najbardziej zanieczyszczonych miast w Europie.',
      'Aplikacja mia\u0142a dwa modu\u0142y: dla u\u017cytkownik\u00f3w indywidualnych (trasy omijaj\u0105ce miejsca o wysokim st\u0119\u017ceniu PM2.5/PM10) i dla decydent\u00f3w miejskich (algorytm wskazuj\u0105cy, gdzie nowe drogi rowerowe s\u0105 najbardziej potrzebne).',
      'Rozwi\u0105zanie bazowa\u0142o na grafie, w kt\u00f3rym w\u0119z\u0142y to skrzy\u017cowania, a kraw\u0119dzie to odcinki ulic z wagami uwzgl\u0119dniaj\u0105cymi zanieczyszczenie, ha\u0142as, blisko\u015b\u0107 teren\u00f3w zielonych i bezpiecze\u0144stwo.',
    ],
    keyFeatures: [
      'Motywacja zdrowotna \u2014 ochrona przed ekspozycj\u0105 na smog',
      'Dwa modu\u0142y: dla rowerzyst\u00f3w i dla decydent\u00f3w miejskich',
      'Wagi uwzgl\u0119dniaj\u0105ce PM2.5, PM10, ha\u0142as i ziele\u0144',
      'Wyb\u00f3r mi\u0119dzy tras\u0105 szybsz\u0105 a zdrowsz\u0105',
    ],
    technologies: ['Python', 'Graph algorithms', 'OpenStreetMap', 'GIO\u015a'],
    presentationFile: '/assets/presentations/apex-velo.pdf',
    images: [],
  },
  {
    id: 'beznazwy',
    name: 'Beznazwy',
    challenge: 'process-automation',
    members: ['Szymon Adamczyk', 'Kamil Adamski', 'Patryk Chwalik'],
    projectName: 'Nawigacja multimodalna \u2014 rower + hulajnogi + pieszo',
    shortDescription: 'Aplikacja mobilna \u0142\u0105cz\u0105ca nawigacj\u0119 rowerow\u0105 z integracj\u0105 hulajn\u00f3g elektrycznych, oferuj\u0105ca trzy tryby tras: klasyczny, wygodny i cichy.',
    fullDescription: [
      'Zesp\u00f3\u0142 Beznazwy zaprojektowa\u0142 aplikacj\u0119 mobiln\u0105 \u0142\u0105cz\u0105c\u0105 nawigacj\u0119 rowerow\u0105 z integracj\u0105 hulajn\u00f3g elektrycznych i mikromobilno\u015bci (standard GBF-S, API firmy TOD).',
      'Trzy tryby tras: klasyczny (najkr\u00f3tsza droga z OSM), wygodny (priorytet \u015bcie\u017cek rowerowych) i cichy (analiza nat\u0119\u017cenia ha\u0142asu, co przek\u0142ada si\u0119 na bezpiecze\u0144stwo).',
      'System pobiera\u0142 dane o lokalizacjach stojak\u00f3w rowerowych z CEPP i automatycznie planowa\u0142 trasy multimodalne: pieszo do punktu odbioru hulajnogi, hulajnog\u0105 do punktu zwrotu, pieszo do celu.',
    ],
    keyFeatures: [
      'Zesp\u00f3\u0142 sformowany przypadkowo dzie\u0144 przed hackathonem',
      'Trzy tryby tras: klasyczny, wygodny, cichy',
      'Integracja z hulajnogami (API TOD, standard GBF-S)',
      'Automatyczne planowanie trasy multimodalnej',
      'Priorytetyzacja: drogi rowerowe > pasy > kontrapasy',
      'Matematyka komfortu \u2014 system wag dla unikania dr\u00f3g g\u0142\u00f3wnych',
    ],
    technologies: ['Python', 'NetworkX', 'FastAPI', 'OpenStreetMap', 'GBF-S API'],
    presentationFile: '/assets/presentations/beznazwy.pdf',
    images: [],
  },
  {
    id: 'bydgoskabears',
    name: 'BydgoskaBears \u2014 Prism',
    challenge: 'geospatial',
    members: ['Anand Chavan', 'Pratixan Sarmah', 'Ashutosh Pattnaik', 'Pooja Tanty'],
    projectName: 'Prism \u2014 personalizacja tras rowerowych',
    shortDescription: 'System personalizacji tras jak pryzmat rozszczepiaj\u0105cy \u015bwiat\u0142o \u2014 r\u00f3\u017cne optymalizowane trasy w zale\u017cno\u015bci od profilu u\u017cytkownika (shortest, nature, tourist, mixed, custom).',
    fullDescription: [
      'Mi\u0119dzynarodowy zesp\u00f3\u0142 BydgoskaBears zaprezentowa\u0142 Prism \u2014 system personalizacji tras rowerowych. Jak pryzmat rozdziela \u015bwiat\u0142o na kolory, tak Prism oferuje r\u00f3\u017cne zoptymalizowane trasy.',
      '4 predefiniowane profile plus profil niestandardowy: shortest (najkr\u00f3tsza), nature (przez tereny zielone), tourist (muzea, galerie, toalety, bankomaty), mixed (kompromis) i custom (pe\u0142na personalizacja wag).',
      'Scoring opiera\u0142 si\u0119 na wielowymiarowej ocenie ka\u017cdego odcinka: bezpiecze\u0144stwo, ha\u0142as, blisko\u015b\u0107 natury, dost\u0119p do infrastruktury turystycznej.',
    ],
    keyFeatures: [
      'Zesp\u00f3\u0142 mi\u0119dzynarodowy',
      '5 profili tras: shortest, nature, tourist, mixed, custom',
      'Wielowymiarowy scoring odcink\u00f3w',
      'Wizja: transfer wiedzy z miast o rozwini\u0119tej infrastrukturze (Amsterdam)',
    ],
    technologies: ['Python', 'Graph algorithms', 'Scoring model'],
    images: [],
  },
  {
    id: 'mpz',
    name: 'MPZ',
    placement: 2,
    placementLabel: '2. miejsce \u2014 Infrastructure',
    challenge: 'geospatial',
    members: ['Emilia Masiak', '\u0141ukasz J\u0119cek', 'Alicja \u015awiercz'],
    university: 'Politechnika \u0141\u00f3dzka',
    projectName: 'NLP-driven nawigacja rowerowa + dashboard analityczny',
    shortDescription: 'Dwumodu\u0142owy system z przetwarzaniem j\u0119zyka naturalnego \u2014 rowerzysta opisuje potrzeby po polsku, a system wydobywa parametry trasy i generuje optymalne przejazdy.',
    fullDescription: [
      'MPZ zaprezentowa\u0142o dwumodu\u0142owy system, w kt\u00f3rym kluczow\u0105 rol\u0119 odgrywa NLP. U\u017cytkownik-rowerzysta komunikuje si\u0119 z systemem po polsku, opisuj\u0105c swoje potrzeby naturalnym j\u0119zykiem.',
      'Warstwa NLP (LLM) wydobywa\u0142a strukturyzowane dane z zapytania u\u017cytkownika i zamienia\u0142a na Structured Output. Zesp\u00f3\u0142 jasno podkre\u015bli\u0142: LLM nie wyznacza trasy, s\u0142u\u017cy wy\u0142\u0105cznie do komunikacji.',
      'Silnik geoanalizy przetwarza\u0142 infrastruktur\u0119 liniow\u0105 Krakowa jako graf wa\u017cony, gdzie kosztem kraw\u0119dzi by\u0142a autorska funkcja uwzgl\u0119dniaj\u0105ca d\u0142ugo\u015b\u0107 trasy, blisko\u015b\u0107 teren\u00f3w zielonych i poziom ha\u0142asu.',
      'Modu\u0142 analityczny dla urz\u0119dnik\u00f3w oferowa\u0142 dashboard z map\u0105, preferencjami u\u017cytkownik\u00f3w, heat map\u0105 punkt\u00f3w startowych/docelowych i rankingiem niebezpiecznych miejsc.',
    ],
    keyFeatures: [
      'Komunikacja naturalnym j\u0119zykiem polskim z LLM',
      'Jasne rozgraniczenie: LLM = komunikacja, nie routing',
      'Autorska funkcja kosztu na grafie wa\u017conym',
      'Dashboard urz\u0119dnika: preferencje, heat mapy, ranking miejsc',
      'Demo na \u017cywo z dwoma zapytaniami',
      'Wizja: trasy wielopunktowe, Karta Mieszka\u0144ca, dane live',
    ],
    technologies: ['Python', 'LLM', 'Structured Output', 'OpenStreetMap', 'ZTP Krak\u00f3w'],
    presentationFile: '/assets/presentations/mpz.pdf',
    images: [],
  },
  {
    id: 'vibecoders',
    name: 'VibeCoders (WorkTrace)',
    placement: 1,
    placementLabel: '1. miejsce \u2014 Process Mining',
    challenge: 'process-automation',
    members: ['Mateusz Caputa', 'Marcin Pa\u0142ys', 'Kacper Smaga'],
    projectName: 'Dashboard analityczny process mining',
    shortDescription: 'Kompleksowy dashboard analityczny generuj\u0105cy raporty z log\u00f3w CSV, identyfikuj\u0105cy w\u0105skie gard\u0142a i proponuj\u0105cy automatyzacj\u0119 proces\u00f3w z wykorzystaniem AI.',
    fullDescription: [
      'VibeCoders stworzyli kompleksowy dashboard analityczny, kt\u00f3ry na podstawie za\u0142adowanych log\u00f3w CSV generuje raporty, identyfikuje w\u0105skie gard\u0142a i proponuje automatyzacj\u0119 proces\u00f3w.',
      'Rozbudowane zak\u0142adki: Overview (przegl\u0105d), User Learning (analiza pracownik\u00f3w), Bottlenecks (zatory), Process Paths (warianty sekwencji), Live Monitoring (symulacja real-time), Automatyzacja (propozycje AI).',
      'Ka\u017cda zawi\u0142a metryka mia\u0142a przycisk generuj\u0105cy wyja\u015bnienie AI, co czyni\u0142o aplikacj\u0119 przyjazn\u0105 dla nowych u\u017cytkownik\u00f3w.',
      'Kluczowe odkrycie z danych: \u015bredni przest\u00f3j ok. 4 godzin, 452 tysi\u0105ce operacji kopiowania, 25 aplikacji u\u017cywanych przez pracownik\u00f3w.',
    ],
    keyFeatures: [
      'Dashboard z 6 zak\u0142adkami analitycznymi',
      'AI wyja\u015bnienia dla ka\u017cdej zawi\u0142ej metryki',
      'Por\u00f3wnywanie efektywno\u015bci pracownik\u00f3w',
      'Symulacja automatyzacji z rankingiem op\u0142acalno\u015bci',
      'Live monitoring z aktywno\u015bciami na \u017cywo',
      'Identyfikacja: 4h przestoju, 452k operacji kopiowania',
    ],
    technologies: ['React', 'Python', 'AI/LLM', 'CSV processing', 'Process Mining'],
    presentationFile: '/assets/presentations/vibecoders.pdf',
    images: [
      { url: '/assets/teams/vibecoders/1_dashboard.png', alt: 'WorkTrace Dashboard', caption: 'Dashboard \u2014 przegl\u0105d procesu z kluczowymi metrykami i analiz\u0105 koszt\u00f3w' },
      { url: '/assets/teams/vibecoders/2_userjourney.png', alt: 'WorkTrace User Journey', caption: 'User Journey \u2014 timeline aktywno\u015bci u\u017cytkownik\u00f3w z analiz\u0105 sekwencji' },
      { url: '/assets/teams/vibecoders/3_overview.png', alt: 'WorkTrace Overview', caption: 'Overview \u2014 statystyki procesu, health score i kategorie pracy' },
      { url: '/assets/teams/vibecoders/4_businessimpact.png', alt: 'WorkTrace Business Impact', caption: 'Business Impact \u2014 analiza koszt\u00f3w, waste breakdown i efektywno\u015b\u0107 per user' },
      { url: '/assets/teams/vibecoders/5_bottlenecks.png', alt: 'WorkTrace Bottlenecks', caption: 'Bottlenecks \u2014 identyfikacja w\u0105skich garde\u0142 z AI-generowan\u0105 analiz\u0105' },
      { url: '/assets/teams/vibecoders/6_processpaths.png', alt: 'WorkTrace Process Paths', caption: 'Process Paths \u2014 warianty sekwencji procesowych z czasami wykonania' },
      { url: '/assets/teams/vibecoders/7_aianalysis.png', alt: 'WorkTrace AI Analysis', caption: 'AI Analysis \u2014 rekomendacje automatyzacji z matryc\u0105 gotowo\u015bci' },
      { url: '/assets/teams/vibecoders/8_aianalysis.png', alt: 'WorkTrace AI Analysis Detail', caption: 'AI Analysis \u2014 szczeg\u00f3\u0142owa analiza z Automation Readiness Matrix' },
      { url: '/assets/teams/vibecoders/9_livemonitor.png', alt: 'WorkTrace Live Monitor', caption: 'Live Monitor \u2014 monitoring aktywno\u015bci w czasie rzeczywistym' },
    ],
  },
  {
    id: 'process-refactor',
    name: 'ProcessRefactor',
    placement: 2,
    placementLabel: '2. miejsce \u2014 Process Mining',
    challenge: 'process-automation',
    members: ['Daniel Szarek', 'Jakub Zborowski', 'Bartosz Szyd\u0142ak', 'Liliana Ucher'],
    university: 'AGH',
    projectName: 'Autonomous Copilot \u2014 automatyczna analiza proces\u00f3w',
    shortDescription: 'System AI do automatycznej analizy proces\u00f3w biznesowych, redukuj\u0105cy czas analizy z 3-6 tygodni do minut. Pipeline: reprodukcja wariant\u00f3w, wykrywanie w\u0105skich garde\u0142, klasyfikacja i generowanie BPMN.',
    fullDescription: [
      'ProcessRefactor stworzyli Autonomous Copilot \u2014 system AI do automatycznej analizy proces\u00f3w biznesowych. Rozwi\u0105zanie celowa\u0142o w problem, kt\u00f3ry normalnie zajmuje konsultantom 3-6 tygodni.',
      'Pipeline obejmowa\u0142: reprodukcj\u0119 wariant\u00f3w procesowych, wykrywanie op\u00f3\u017anie\u0144 i w\u0105skich garde\u0142, analiz\u0119 behawioraln\u0105 (click, copy-paste patterns), klasyfikacj\u0119 przez AI i generowanie raportu z diagramem BPMN.',
      'System \u0142\u0105czy\u0142 si\u0119 z internetem w celu wyszukiwania najnowszych rozwi\u0105za\u0144 optymalizacyjnych, oferowa\u0142 automatyczny ranking proces\u00f3w wed\u0142ug potencja\u0142u oszcz\u0119dno\u015bci.',
    ],
    keyFeatures: [
      'Redukcja czasu analizy z 3-6 tygodni do minut',
      'Pipeline: reprodukcja, detekcja, klasyfikacja, rekomendacje',
      'Analiza behawioralna: click, copy-paste patterns',
      'Automatyczny ranking proces\u00f3w wg potencja\u0142u oszcz\u0119dno\u015bci',
      'Generowanie raport\u00f3w BPMN',
      'Zastosowanie: finanse, ochrona zdrowia, produkcja, e-commerce',
    ],
    technologies: ['Python', 'AI/LLM', 'BPMN', 'Process Mining'],
    images: [],
  },
  {
    id: 'the-boys',
    name: 'The Boys',
    challenge: 'geospatial',
    members: ['Tymon Szyler', 'Miko\u0142aj Klima', 'Mi\u0142osz Nowak', 'Micha\u0142 Mr\u00f3z'],
    university: 'AGH',
    projectName: 'SMART BIKE \u2014 nawigacja rowerowa',
    shortDescription: 'System nawigacji rowerowej z algorytmami optymalizacji tras, uwzgl\u0119dniaj\u0105cy bezpiecze\u0144stwo i komfort jazdy na podstawie danych infrastrukturalnych Krakowa.',
    fullDescription: [
      'The Boys stworzyli SMART BIKE \u2014 system nawigacji rowerowej z algorytmami optymalizacji tras.',
      'Rozwi\u0105zanie uwzgl\u0119dnia bezpiecze\u0144stwo i komfort jazdy na podstawie danych infrastrukturalnych Krakowa.',
    ],
    keyFeatures: [
      'Algorytmy optymalizacji tras rowerowych',
      'Uwzgl\u0119dnienie bezpiecze\u0144stwa i komfortu jazdy',
      'Analiza danych infrastrukturalnych Krakowa',
    ],
    technologies: ['Python', 'GIS', 'OpenStreetMap'],
    presentationFile: '/assets/presentations/the-boys-slides.pdf',
    images: [],
  },
  {
    id: 'konrad-podstawski',
    name: 'Konrad Podstawski (solo)',
    specialMention: 'Wyr\u00f3\u017cnienie specjalne \u2014 jedyny solowy uczestnik, 67/80',
    challenge: 'geospatial',
    members: ['Konrad Podstawski'],
    projectName: 'By Your Trip \u2014 codzienna przygoda na rowerze',
    shortDescription: 'Jedyny solowy uczestnik \u2014 aplikacja odchodz\u0105ca od "z A do B najszybciej" na rzecz urozmaicania codziennych dojazd\u00f3w przez wyb\u00f3r "vibe\'\u00f3w" trasy.',
    fullDescription: [
      'Konrad Podstawski, jedyny solowy uczestnik hackathonu, zaprezentowa\u0142 By Your Trip \u2014 aplikacj\u0119, kt\u00f3ra odchodzi od tradycyjnego podej\u015bcia na rzecz urozmaicania codziennych dojazd\u00f3w.',
      'U\u017cytkownik wybiera "vibe" \u2014 kierunek, w kt\u00f3rym chce przesun\u0105\u0107 tras\u0119: zdrowotny (najlepsza jako\u015b\u0107 powietrza), miejski (t\u0119tni\u0105ce \u017cyciem ulice), a nawet POS APO \u2014 celowo najgorsza trasa.',
      'Suwak regulowa\u0142 blisko\u015b\u0107 wybranego vibe\'u vs najkr\u00f3tszej trasy. Architektura w pe\u0142ni modularna \u2014 nowe modu\u0142y danych mo\u017cna dodawa\u0107 bez przebudowy, system automatycznie balansuje wagi.',
    ],
    keyFeatures: [
      'Jedyny solowy uczestnik hackathonu',
      'Koncepcja "vibe\'\u00f3w" \u2014 kierunk\u00f3w urozmaicenia trasy',
      'Tryb POS APO \u2014 celowo najgorsza trasa',
      'Suwak regulacji blisko\u015bci vibe vs najkr\u00f3tsza trasa',
      'W pe\u0142ni modularna architektura',
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
