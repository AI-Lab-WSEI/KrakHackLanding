import { Edition } from '@/types/edition';
import { getGalleryImages } from '@/utils/galleryLoader';

export const edition2025: Edition = {
  gallery: getGalleryImages('2025'),
  year: '2025',
  status: 'archive',
  heroTitle: 'AI Krak Hack 2025',
  heroSubtitle: 'Szukamy pasjonat\u00f3w AI, student\u00f3w i entuzjast\u00f3w technologii gotowych do wsp\u00f3\u0142pracy w zespo\u0142ach (2-4 osoby). To niepowtarzalna okazja do nauki, networkingu i stworzenia czego\u015b znacz\u0105cego.',
  heroDate: '30-31 Maja 2025',
  ctaApplyUrl: '',
  categories: [
    {
      icon: 'Train',
      title: 'Wyzwanie 1: Zoptymalizuj Krakowsk\u0105 Sie\u0107 Tramwajow\u0105',
      description: 'Bardziej algorytmiczne i optymalizacyjne, kt\u00f3re pozwoli Ci zmierzy\u0107 si\u0119 z realnymi danymi miejskimi dotycz\u0105cymi transportu publicznego. To szansa na pog\u0142\u0119bienie wiedzy z analizy danych przestrzennych, algorytm\u00f3w grafowych i technik optymalizacji. Zapewniamy solidny, przemy\u015blany punkt startowy w postaci danych \u2013 reszta w Waszych r\u0119kach!',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: 'Theater',
      title: 'Wyzwanie 2: Zbuduj Inteligentnego Asystenta Kulturalnego Krakowa',
      description: 'Bardziej otwarte, skupione na interakcji cz\u0142owiek-AI i przetwarzaniu informacji, gdzie mo\u017cecie zbudowa\u0107 inteligentnego asystenta pomagaj\u0105cego odkrywa\u0107 kulturalne \u017cycie Krakowa. To pole do popisu dla umiej\u0119tno\u015bci z zakresu NLP, system\u00f3w rekomendacyjnych, web scrapingu i budowy aplikacji AI. Udost\u0119pniamy startowy zestaw danych z kalendarza wydarze\u0144 (ponad 700 pozycji!).',
      color: 'from-purple-500 to-pink-600',
    },
  ],
  timelineSteps: [
    {
      title: 'poniedzia\u0142ek 19.05, 16:00',
      dateRange: '19.05.2025',
      description: 'Udost\u0119pnienie materia\u0142\u00f3w przygotowawczych - b\u0119d\u0105 r\u00f3wnie\u017c wysy\u0142ane w p\u00f3\u017aniejszych terminach dla os\u00f3b kt\u00f3re do\u0142\u0105cz\u0105 do naszego eventu',
      color: 'cyan',
    },
    {
      title: 'pi\u0105tek 30.05, 18:00',
      dateRange: '30.05.2025',
      description: 'Udost\u0119pnienie zada\u0144 projektowych',
      color: 'pink',
    },
    {
      title: 'sobota 31.05, 9:00',
      dateRange: '31.05.2025',
      description: 'Rozpocz\u0119cie wydarzenia na uczelni',
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
      description: 'Prezentacje Fina\u0142owe (10 min / zesp\u00f3\u0142)',
      color: 'cyan',
    },
    {
      title: 'sobota 31.05, 19:00',
      dateRange: '31.05.2025',
      description: 'Prezentacje - Knowledge sharing zaproszonych go\u015bci',
      color: 'pink',
    },
    {
      title: 'sobota 31.05, 20:00',
      dateRange: '31.05.2025',
      description: 'Og\u0142oszenie Wynik\u00f3w i wr\u0119czenie nagr\u00f3d',
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
      title: 'Rozw\u00f3j Umiej\u0119tno\u015bci AI',
      description: 'Praktyczne zastosowanie sztucznej inteligencji w realnych projektach i rozwijanie kompetencji w zakresie machine learning, NLP i analizy danych',
    },
    {
      icon: 'Map',
      title: 'Realne Dane Miejskie',
      description: 'Dost\u0119p do autentycznych danych dotycz\u0105cych transportu i kultury w Krakowie. Tw\u00f3rz rozwi\u0105zania kt\u00f3re maj\u0105 rzeczywiste znaczenie dla miasta',
    },
    {
      icon: 'FolderOpen',
      title: 'Projekt do Portfolio',
      description: 'Stw\u00f3rz dzia\u0142aj\u0105cy prototyp, kt\u00f3ry mo\u017cesz pokaza\u0107 przysz\u0142ym pracodawcom. Co\u015b wi\u0119cej ni\u017c akademickie \u0107wiczenie \u2013 realne wyzwanie do CV',
    },
    {
      icon: 'Target',
      title: 'Realny Wp\u0142yw',
      description: 'Najlepsze projekty zostan\u0105 przedstawione decydentom w Krakowie. Twoje rozwi\u0105zanie mo\u017ce mie\u0107 szans\u0119 na realne wdro\u017cenie w mie\u015bcie',
    },
    {
      icon: 'Users',
      title: 'Networking',
      description: 'Poznaj innych pasjonat\u00f3w AI, mentor\u00f3w z bran\u017cy i potencjalnych pracodawc\u00f3w. Zbuduj warto\u015bciow\u0105 sie\u0107 kontakt\u00f3w w \u015bwiecie technologii',
    },
    {
      icon: 'Award',
      title: 'Nagrody',
      description: 'Zni\u017cki na czesne WSEI, nagrody rzeczowe od partner\u00f3w, vouchery i wiele wi\u0119cej. Walcz o atrakcyjne korzy\u015bci!',
    },
  ],
  program: {
    title: 'O Hackathonie',
    description: 'Cze\u015b\u0107! Jeste\u015bmy Ko\u0142em Naukowym AI Possibilities Lab z WSEI w Krakowie. Nasz\u0105 misj\u0105 jest eksploracja mo\u017cliwo\u015bci sztucznej inteligencji i przekuwanie jej potencja\u0142u w praktyczne rozwi\u0105zania. Wierzymy, \u017ce technologia mo\u017ce realnie przyczyni\u0107 si\u0119 do ulepszenia naszego miasta! AI Krak Hack to Twoja szansa, by wyj\u015b\u0107 poza teori\u0119 i zmierzy\u0107 si\u0119 z realnymi wyzwaniami Krakowa, wykorzystuj\u0105c najnowsze narz\u0119dzia AI. To nie tylko konkurs \u2013 to okazja do nauki, networkingu i stworzenia czego\u015b, co b\u0119dzie \u015bwietnie wygl\u0105da\u0107 w Twoim portfolio!',
    faqs: [
      {
        question: 'Czy musz\u0119 mie\u0107 do\u015bwiadczenie z AI?',
        answer: 'Nie! Przyjmujemy uczestnik\u00f3w na r\u00f3\u017cnych poziomach zaawansowania. Wa\u017cna jest ch\u0119\u0107 nauki i praca zespo\u0142owa. Przygotowujemy materia\u0142y pomocnicze, kt\u00f3re pomog\u0105 Ci si\u0119 przygotowa\u0107.',
      },
      {
        question: 'Ile os\u00f3b mo\u017ce by\u0107 w zespole?',
        answer: 'Zespo\u0142y mog\u0105 sk\u0142ada\u0107 si\u0119 z 2-4 os\u00f3b. Mo\u017cesz zg\u0142osi\u0107 si\u0119 z gotowym zespo\u0142em lub indywidualnie - pomo\u017cemy Ci znale\u017a\u0107 wsp\u00f3\u0142pracownik\u00f3w.',
      },
      {
        question: 'Ile kosztuje udzia\u0142?',
        answer: 'Udzia\u0142 w hackathonie jest ca\u0142kowicie darmowy! Zapewniamy jedzenie, napoje i dost\u0119p do wszystkich zasob\u00f3w.',
      },
      {
        question: 'Co powinienm ze sob\u0105 zabra\u0107?',
        answer: 'Laptop, \u0142adowark\u0119, dobre nastawienie i ch\u0119\u0107 do nauki. Reszt\u0119 zapewniamy my!',
      },
      {
        question: 'Gdzie b\u0119dzie odbywa\u0142 si\u0119 hackathon?',
        answer: 'Wydarzenie odby\u0142o si\u0119 na Wy\u017cszej Szkole Ekonomii i Innowacji (WSEI) w Krakowie w dniach 30-31 maja 2025.',
      },
      {
        question: 'Jakie technologie b\u0119d\u0119 m\u00f3g\u0142 wykorzysta\u0107?',
        answer: 'Python, GeoPandas, biblioteki do optymalizacji, NLP, web scraping, systemy rekomendacyjne - masz pe\u0142n\u0105 swobod\u0119 wyboru narz\u0119dzi AI, kt\u00f3re pomog\u0105 Ci rozwi\u0105za\u0107 wyzwanie.',
      },
    ],
  },
  stats: [
    { value: '30+', label: 'Uczestnik\u00f3w' },
    { value: '8', label: 'Zespo\u0142\u00f3w' },
    { value: '3', label: 'Mentor\u00f3w' },
    { value: '10', label: 'Projekt\u00f3w AI' },
    { value: '24h', label: 'Intensywnej Pracy' },
  ],

  // storyBlocks: [
  //   {
  //     title: 'Start hackathonu',
  //     text: 'Pierwsza edycja AI Krak Hack rozpocz\u0119\u0142a si\u0119 30 maja 2025. Ponad 50 uczestnik\u00f3w spotka\u0142o si\u0119 na WSEI w Krakowie, pe\u0142nych energii i gotowych do wyzwa\u0144. Ko\u0142o Naukowe AI Possibilities Lab przygotowa\u0142o dwa konkretne wyzwania zwi\u0105zane z Krakowem: optymalizacj\u0119 sieci tramwajowej oraz budow\u0119 inteligentnego asystenta kulturalnego. Po kr\u00f3tkim wprowadzeniu i prezentacji zada\u0144, zespo\u0142y zanurk\u0141y w intensywn\u0105 prac\u0119 nad projektami AI.',
  //   },
  //   {
  //     title: 'Praca zespo\u0142owa',
  //     text: 'Przez 24 godziny, 12 zespo\u0142\u00f3w pracowa\u0142o nad r\u00f3\u017cnorodnymi projektami wykorzystuj\u0105cymi realne dane miejskie. Jedne zespo\u0142y analizowa\u0142y dane transportowe i optymalizowa\u0142y trasy tramwajowe, inne budowa\u0142y inteligentnych asystent\u00f3w kulturalnych wykorzystuj\u0105c NLP i web scraping. Mentorzy byli dost\u0119pni przez ca\u0142y czas, pomagaj\u0105c rozwi\u0105zywa\u0107 problemy techniczne i rozwija\u0107 pomys\u0142y. Atmosfera by\u0142a niesamowita \u2013 po\u0142\u0105czenie koncentracji, wsp\u00f3\u0142pracy i pasji do AI.',
  //   },
  //   {
  //     title: 'Demo Day',
  //     text: 'Fina\u0142 by\u0142 pe\u0142en emocji. Ka\u017cdy zesp\u00f3\u0142 mia\u0142 10 minut na zaprezentowanie swojego projektu przed jury z\u0142o\u017conym z ekspert\u00f3w AI i przedstawicieli bran\u017cy. Po prezentacjach odby\u0142y si\u0119 sesje knowledge sharing z zaproszonymi go\u015b\u0107mi, kt\u00f3rzy dzielili si\u0119 swoim do\u015bwiadczeniem z przemys\u0142u. Poziom prezentacji i jako\u015b\u0107 rozwi\u0105za\u0144 przekroczy\u0142 nasze oczekiwania \u2013 od zaawansowanych algorytm\u00f3w optymalizacyjnych po inteligentne systemy rekomendacji kulturalnych.',
  //   },
  //   {
  //     title: 'Efekty i nagrody',
  //     text: 'Wszystkie 12 zespo\u0142\u00f3w uko\u0144czy\u0142o swoje projekty i zaprezentowa\u0142o dzia\u0142aj\u0105ce prototypy wykorzystuj\u0105ce realne dane Krakowa. Najlepsze projekty otrzyma\u0142y nagrody od partner\u00f3w: zni\u017cki na czesne WSEI, nagrody rzeczowe oraz vouchery. Co najwa\u017cniejsze, najlepsze rezultaty hackathonu zosta\u0142y przedstawione decydentom w Krakowie. Wszyscy uczestnik\u00f3w zdobyli cenne do\u015bwiadczenie, projekty do portfolio i kontakty w bran\u017cy AI. Kilka os\u00f3b otrzyma\u0142o oferty praktyk i wsp\u00f3\u0142pracy z partnerami hackathonu.',
  //   },
  // ],
  // successStory: {
  //   personNameOrAlias: 'Anna K.',
  //   role: 'Studentka Informatyki, AGH',
  //   whatDid: 'Uczestniczka AI Krak Hack 2025, cz\u0142onkini zespo\u0142u kt\u00f3ry stworzy\u0142 system rozpoznawania emocji w czasie rzeczywistym',
  //   outcome: 'Otrzyma\u0142a ofert\u0119 praktyk w firmie AI, a nast\u0119pnie sta\u0142\u0105 prac\u0119 jako Junior AI Engineer',
  //   quote: 'AI Krak Hack by\u0142 punktem zwrotnym w mojej karierze. Nie tylko nauczy\u0142am si\u0119 praktycznych umiej\u0119tno\u015bci AI, ale te\u017c pozna\u0142am ludzi, kt\u00f3rzy pomogli mi znale\u017a\u0107 wymarzon\u0105 prac\u0119. Hackathon pokaza\u0142 mi, \u017ce potrafi\u0119 tworzy\u0107 rzeczy, kt\u00f3re maj\u0105 realny wp\u0142yw.',
  //   links: [
  //     { label: 'LinkedIn', url: '#' },
  //   ],
  //   imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2dyYW1tZXJ8ZW58MXx8fHwxNzA4NzAwODAwfDA&ixlib=rb-4.1.0&q=80&w=400',
  // },
  partners: [
    { name: 'AI Possibilities Lab' },
    { name: 'WSEI' },
    { name: 'Uber' },
    { name: 'DataArt' },
  ],
};
