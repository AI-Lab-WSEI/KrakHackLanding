import { Edition } from '@/types/edition';
import { getGalleryImages, getRandomGalleryImages } from '@/utils/galleryLoader';

export const editions: Record<string, Edition> = {
  '2026': {
    year: '2026',
    status: 'active',
    heroTitle: 'AI Krak Hack 2026',
    heroSubtitle: 'Najlepszy hackathon AI w Krakowie. Dołącz do koła naukowego AI&SE i rozwijaj swoje umiejętności w sztucznej inteligencji!',
    heroDate: 'Data: TBA',
    ctaApplyUrl: '#formularz',
    categories: [
      {
        icon: 'Brain',
        title: 'AI & Machine Learning',
        description: 'Twórz zaawansowane modele uczenia maszynowego, sieci neuronowe i systemy predykcyjne wykorzystujące najnowsze technologie AI',
        color: 'from-cyan-500 to-blue-600',
      },
      {
        icon: 'Sparkles',
        title: 'Computer Vision',
        description: 'Rozpoznawanie obrazów, analiza wideo, detekcja obiektów i przetwarzanie wizualne przy użyciu deep learning',
        color: 'from-purple-500 to-pink-600',
      },
      {
        icon: 'Shield',
        title: 'NLP & ChatBots',
        description: 'Przetwarzanie języka naturalnego, chatboty, analiza sentymentu i inteligentne asystenty konwersacyjne',
        color: 'from-green-500 to-emerald-600',
      },
      {
        icon: 'Palette',
        title: 'Generative AI',
        description: 'Generowanie treści, obrazów i muzyki z wykorzystaniem AI. Eksperymentuj z DALL-E, Stable Diffusion i GPT',
        color: 'from-orange-500 to-red-600',
      },
    ],
    timelineSteps: [
      {
        title: 'Rekrutacja',
        dateRange: 'Luty - Marzec 2026',
        description: 'Otwarte zgłoszenia dla wszystkich zainteresowanych uczestników',
        color: 'cyan',
      },
      {
        title: 'Ogłoszenie zespołów',
        dateRange: 'Marzec 2026',
        description: 'Formowanie zespołów i dobór mentorów',
        color: 'pink',
      },
      {
        title: 'Start hackathonu',
        dateRange: 'TBA',
        description: 'Rozpoczęcie pracy nad projektami AI',
        color: 'cyan',
      },
      {
        title: 'Praca nad prototypem',
        dateRange: '24 godziny',
        description: 'Intensywna praca zespołowa z wsparciem mentorów',
        color: 'pink',
      },
      {
        title: 'Demo Day & Finał',
        dateRange: 'TBA',
        description: 'Prezentacje projektów przed jury i ogłoszenie wyników',
        color: 'cyan',
      },
      {
        title: 'Ogłoszenie wyników',
        dateRange: 'TBA',
        description: 'Prezentacja zwycięzców i nagrody',
        color: 'pink',
      },
    ],
    highlights: [
      {
        icon: 'Users',
        title: 'Rozwój Umiejętności AI',
        description: 'Praktyczne zastosowanie sztucznej inteligencji w realnych projektach',
      },
      {
        icon: 'Database',
        title: 'Praca na danych',
        description: 'Dostęp do realnych zbiorów danych i infrastruktury',
      },
      {
        icon: 'Lightbulb',
        title: 'Projekt do portfolio',
        description: 'Stwórz działający prototyp, który możesz pokazać przyszłym pracodawcom',
      },
      {
        icon: 'Code',
        title: 'Realny wpływ',
        description: 'Rozwiązuj prawdziwe problemy z wykorzystaniem AI',
      },
      {
        icon: 'Network',
        title: 'Networking',
        description: 'Poznaj innych pasjonatów AI, mentorów i potencjalnych pracodawców',
      },
      {
        icon: 'Trophy',
        title: 'Konkursy',
        description: 'Walcz o atrakcyjne nagrody i możliwości rozwoju',
      },
    ],
    program: {
      title: 'Jak to działa?',
      description: 'AI Krak Hack to intensywny hackathon, w którym zespoły pracują przez 24 godziny nad projektami AI. Otrzymujesz wsparcie mentorów, dostęp do danych i infrastruktury, a na koniec prezentujesz swój projekt przed jury.',
      faqs: [
        {
          question: 'Czy muszę mieć doświadczenie z AI?',
          answer: 'Nie! Przyjmujemy uczestników na różnych poziomach zaawansowania. Ważna jest chęć nauki i praca zespołowa.',
        },
        {
          question: 'Czy muszę mieć swój zespół?',
          answer: 'Nie musisz! Możesz zgłosić się indywidualnie, a my pomożemy Ci znaleźć zespół z osobami o podobnych zainteresowaniach.',
        },
        {
          question: 'Ile kosztuje udział?',
          answer: 'Udział w hackathonie jest całkowicie darmowy! Zapewniamy jedzenie, napoje i dostęp do wszystkich zasobów.',
        },
        {
          question: 'Co powinienm ze sobą zabrać?',
          answer: 'Laptop, ładowarkę, dobre nastawienie i chęć do nauki. Resztę zapewniamy my!',
        },
        {
          question: 'Gdzie będzie odbywał się hackathon?',
          answer: 'Wydarzenie odbędzie się w Krakowie, szczegóły lokalizacji zostaną podane po rekrutacji.',
        },
      ],
    },
    partners: [
      { name: 'AI Possibilities Lab' },
      { name: 'AGH UST' },
    ],
    gallery: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1638202677704-b74690bb8fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjB0ZWFtJTIwY29kaW5nfGVufDF8fHx8MTc3MDA1NjM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Zespół podczas hackathonu',
        caption: 'Zespoły pracują nad projektami AI',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1573165706511-3ffde6ef1fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXJzJTIwd29ya2luZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc3MDA1NjM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Developerzy współpracują',
        caption: 'Współpraca i wymiana wiedzy',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1632910121591-29e2484c0259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHRlYW13b3JrfGVufDF8fHx8MTc3MDA1NjM2OXww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Programowanie zespołowe',
        caption: 'Intensywna praca zespołowa',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1750056393356-d1de9d222a29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwcHJlc2VudGF0aW9uJTIwZGVtb3xlbnwxfHx8fDE3NzAwNTYzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Prezentacja techniczna',
        caption: 'Demo Day - prezentacje projektów',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1540058404349-2e5fabf32d75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjB3b3Jrc2hvcCUyMHN0dWRlbnRzfGVufDF8fHx8MTc3MDA1NjM3MHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Workshop programowania',
        caption: 'Wspólna nauka i rozwój',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1766766464419-ea9d60543aee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwbmV0d29ya2luZyUyMGV2ZW50fGVufDF8fHx8MTc3MDA1NjM3MHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Networking tech',
        caption: 'Networking i wymiana doświadczeń',
      },
    ],
  },
  '2025': {
    year: '2025',
    status: 'archive',
    heroTitle: 'AI Krak Hack 2025',
    heroSubtitle: 'Szukamy pasjonatów AI, studentów i entuzjastów technologii gotowych do współpracy w zespołach (2-4 osoby). To niepowtarzalna okazja do nauki, networkingu i stworzenia czegoś znaczącego.',
    heroDate: '30-31 Maja 2025',
    ctaApplyUrl: '',
    categories: [
      {
        icon: 'Train',
        title: 'Wyzwanie 1: Zoptymalizuj Krakowską Sieć Tramwajową',
        description: 'Bardziej algorytmiczne i optymalizacyjne, które pozwoli Ci zmierzyć się z realnymi danymi miejskimi dotyczącymi transportu publicznego. To szansa na pogłębienie wiedzy z analizy danych przestrzennych, algorytmów grafowych i technik optymalizacji. Zapewniamy solidny, przemyślany punkt startowy w postaci danych – reszta w Waszych rękach!',
        color: 'from-blue-500 to-cyan-600',
      },
      {
        icon: 'Theater',
        title: 'Wyzwanie 2: Zbuduj Inteligentnego Asystenta Kulturalnego Krakowa',
        description: 'Bardziej otwarte, skupione na interakcji człowiek-AI i przetwarzaniu informacji, gdzie możecie zbudować inteligentnego asystenta pomagającego odkrywać kulturalne życie Krakowa. To pole do popisu dla umiejętności z zakresu NLP, systemów rekomendacyjnych, web scrapingu i budowy aplikacji AI. Udostępniamy startowy zestaw danych z kalendarza wydarzeń (ponad 700 pozycji!).',
        color: 'from-purple-500 to-pink-600',
      },
    ],
    timelineSteps: [
      {
        title: 'poniedziałek 19.05, 16:00',
        dateRange: '19.05.2025',
        description: 'Udostępnienie materiałów przygotowawczych - będą również wysyłane w późniejszych terminach dla osób które dołączą do naszego eventu',
        color: 'cyan',
      },
      {
        title: 'piątek 30.05, 18:00',
        dateRange: '30.05.2025',
        description: 'Udostępnienie zadań projektowych',
        color: 'pink',
      },
      {
        title: 'sobota 31.05, 9:00',
        dateRange: '31.05.2025',
        description: 'Rozpoczęcie wydarzenia na uczelni',
        color: 'cyan',
      },
      {
        title: 'sobota 31.05, 13:00',
        dateRange: '31.05.2025',
        description: 'Przerwa na obiad',
        color: 'pink',
      },
      {
        title: 'sobota 31.05, 17:30',
        dateRange: '31.05.2025',
        description: 'Prezentacje Finałowe (10 min / zespół)',
        color: 'cyan',
      },
      {
        title: 'sobota 31.05, 19:00',
        dateRange: '31.05.2025',
        description: 'Prezentacje - Knowledge sharing zaproszonych gości',
        color: 'pink',
      },
      {
        title: 'sobota 31.05, 20:00',
        dateRange: '31.05.2025',
        description: 'Ogłoszenie Wyników i wręczenie nagród',
        color: 'cyan',
      },
      {
        title: 'sobota 31.05, 21:00',
        dateRange: '31.05.2025',
        description: 'Afterparty & Integracja',
        color: 'pink',
      },
    ],
    highlights: [
      {
        icon: 'Brain',
        title: 'Rozwój Umiejętności AI',
        description: 'Praktyczne zastosowanie sztucznej inteligencji w realnych projektach i rozwijanie kompetencji w zakresie machine learning, NLP i analizy danych',
      },
      {
        icon: 'Map',
        title: 'Realne Dane Miejskie',
        description: 'Dostęp do autentycznych danych dotyczących transportu i kultury w Krakowie. Twórz rozwiązania które mają rzeczywiste znaczenie dla miasta',
      },
      {
        icon: 'FolderOpen',
        title: 'Projekt do Portfolio',
        description: 'Stwórz działający prototyp, który możesz pokazać przyszłym pracodawcom. Coś więcej niż akademickie ćwiczenie – realne wyzwanie do CV',
      },
      {
        icon: 'Target',
        title: 'Realny Wpływ',
        description: 'Najlepsze projekty zostaną przedstawione decydentom w Krakowie. Twoje rozwiązanie może mieć szansę na realne wdrożenie w mieście',
      },
      {
        icon: 'Users',
        title: 'Networking',
        description: 'Poznaj innych pasjonatów AI, mentorów z branży i potencjalnych pracodawców. Zbuduj wartościową sieć kontaktów w świecie technologii',
      },
      {
        icon: 'Award',
        title: 'Nagrody',
        description: 'Zniżki na czesne WSEI, nagrody rzeczowe od partnerów, vouchery i wiele więcej. Walcz o atrakcyjne korzyści!',
      },
    ],
    program: {
      title: 'O Hackathonie',
      description: 'Cześć! Jesteśmy Kołem Naukowym AI Possibilities Lab z WSEI w Krakowie. Naszą misją jest eksploracja możliwości sztucznej inteligencji i przekuwanie jej potencjału w praktyczne rozwiązania. Wierzymy, że technologia może realnie przyczynić się do ulepszenia naszego miasta! AI Krak Hack to Twoja szansa, by wyjść poza teorię i zmierzyć się z realnymi wyzwaniami Krakowa, wykorzystując najnowsze narzędzia AI. To nie tylko konkurs – to okazja do nauki, networkingu i stworzenia czegoś, co będzie świetnie wyglądać w Twoim portfolio!',
      faqs: [
        {
          question: 'Czy muszę mieć doświadczenie z AI?',
          answer: 'Nie! Przyjmujemy uczestników na różnych poziomach zaawansowania. Ważna jest chęć nauki i praca zespołowa. Przygotowujemy materiały pomocnicze, które pomogą Ci się przygotować.',
        },
        {
          question: 'Ile osób może być w zespole?',
          answer: 'Zespoły mogą składać się z 2-4 osób. Możesz zgłosić się z gotowym zespołem lub indywidualnie - pomożemy Ci znaleźć współpracowników.',
        },
        {
          question: 'Ile kosztuje udział?',
          answer: 'Udział w hackathonie jest całkowicie darmowy! Zapewniamy jedzenie, napoje i dostęp do wszystkich zasobów.',
        },
        {
          question: 'Co powinienm ze sobą zabrać?',
          answer: 'Laptop, ładowarkę, dobre nastawienie i chęć do nauki. Resztę zapewniamy my!',
        },
        {
          question: 'Gdzie będzie odbywał się hackathon?',
          answer: 'Wydarzenie odbyło się na Wyższej Szkole Ekonomii i Innowacji (WSEI) w Krakowie w dniach 30-31 maja 2025.',
        },
        {
          question: 'Jakie technologie będę mógł wykorzystać?',
          answer: 'Python, GeoPandas, biblioteki do optymalizacji, NLP, web scraping, systemy rekomendacyjne - masz pełną swobodę wyboru narzędzi AI, które pomogą Ci rozwiązać wyzwanie.',
        },
      ],
    },
    stats: [
      { value: '50+', label: 'Uczestników' },
      { value: '12', label: 'Zespołów' },
      { value: '8', label: 'Mentorów' },
      { value: '12', label: 'Projektów AI' },
      { value: '24h', label: 'Intensywnej Pracy' },
    ],
    gallery: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1638202677704-b74690bb8fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjB0ZWFtJTIwY29kaW5nfGVufDF8fHx8MTc3MDA1NjM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Zespół podczas hackathonu',
        caption: 'Zespoły pracują nad projektami AI',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1573165706511-3ffde6ef1fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXJzJTIwd29ya2luZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc3MDA1NjM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Developerzy współpracują',
        caption: 'Współpraca i wymiana wiedzy',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1632910121591-29e2484c0259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHRlYW13b3JrfGVufDF8fHx8MTc3MDA1NjM2OXww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Programowanie zespołowe',
        caption: 'Intensywna praca zespołowa',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1750056393356-d1de9d222a29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwcHJlc2VudGF0aW9uJTIwZGVtb3xlbnwxfHx8fDE3NzAwNTYzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Prezentacja techniczna',
        caption: 'Demo Day - prezentacje projektów',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1540058404349-2e5fabf32d75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjB3b3Jrc2hvcCUyMHN0dWRlbnRzfGVufDF8fHx8MTc3MDA1NjM3MHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Workshop programowania',
        caption: 'Wspólna nauka i rozwój',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1766766464419-ea9d60543aee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwbmV0d29ya2luZyUyMGV2ZW50fGVufDF8fHx8MTc3MDA1NjM3MHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Networking tech',
        caption: 'Networking i wymiana doświadczeń',
      },
    ],
    storyBlocks: [
      {
        title: 'Start hackathonu',
        text: 'Pierwsza edycja AI Krak Hack rozpoczęła się 30 maja 2025. Ponad 50 uczestników spotkało się na WSEI w Krakowie, pełnych energii i gotowych do wyzwań. Koło Naukowe AI Possibilities Lab przygotowało dwa konkretne wyzwania związane z Krakowem: optymalizację sieci tramwajowej oraz budowę inteligentnego asystenta kulturalnego. Po krótkim wprowadzeniu i prezentacji zadań, zespoły zanurkały w intensywną pracę nad projektami AI.',
      },
      {
        title: 'Praca zespołowa',
        text: 'Przez 24 godziny, 12 zespołów pracowało nad różnorodnymi projektami wykorzystującymi realne dane miejskie. Jedne zespoły analizowały dane transportowe i optymalizowały trasy tramwajowe, inne budowały inteligentnych asystentów kulturalnych wykorzystując NLP i web scraping. Mentorzy byli dostępni przez cały czas, pomagając rozwiązywać problemy techniczne i rozwijać pomysły. Atmosfera była niesamowita – połączenie koncentracji, współpracy i pasji do AI.',
      },
      {
        title: 'Demo Day',
        text: 'Finał był pełen emocji. Każdy zespół miał 10 minut na zaprezentowanie swojego projektu przed jury złożonym z ekspertów AI i przedstawicieli branży. Po prezentacjach odbyły się sesje knowledge sharing z zaproszonymi gośćmi, którzy dzielili się swoim doświadczeniem z przemysłu. Poziom prezentacji i jakość rozwiązań przekroczył nasze oczekiwania – od zaawansowanych algorytmów optymalizacyjnych po inteligentne systemy rekomendacji kulturalnych.',
      },
      {
        title: 'Efekty i nagrody',
        text: 'Wszystkie 12 zespołów ukończyło swoje projekty i zaprezentowało działające prototypy wykorzystujące realne dane Krakowa. Najlepsze projekty otrzymały nagrody od partnerów: zniżki na czesne WSEI, nagrody rzeczowe oraz vouchery. Co najważniejsze, najlepsze rezultaty hackathonu zostały przedstawione decydentom w Krakowie. Wszyscy uczestników zdobyli cenne doświadczenie, projekty do portfolio i kontakty w branży AI. Kilka osób otrzymało oferty praktyk i współpracy z partnerami hackathonu.',
      },
    ],
    successStory: {
      personNameOrAlias: 'Anna K.',
      role: 'Studentka Informatyki, AGH',
      whatDid: 'Uczestniczka AI Krak Hack 2025, członkini zespołu który stworzył system rozpoznawania emocji w czasie rzeczywistym',
      outcome: 'Otrzymała ofertę praktyk w firmie AI, a następnie stałą pracę jako Junior AI Engineer',
      quote: 'AI Krak Hack był punktem zwrotnym w mojej karierze. Nie tylko nauczyłam się praktycznych umiejętności AI, ale też poznałam ludzi, którzy pomogli mi znaleźć wymarzoną pracę. Hackathon pokazał mi, że potrafię tworzyć rzeczy, które mają realny wpływ.',
      links: [
        { label: 'LinkedIn', url: '#' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2dyYW1tZXJ8ZW58MXx8fHwxNzA4NzAwODAwfDA&ixlib=rb-4.1.0&q=80&w=400',
    },
    partners: [
      { name: 'AI Possibilities Lab' },
      { name: 'WSEI' },
      { name: 'Uber' },
      { name: 'DataArt' },
    ],
  },
};