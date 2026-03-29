import { Edition } from '@/types/edition';
import { getRandomGalleryImages } from '@/utils/galleryLoader';

export const edition2026: Edition = {
  year: '2026',
  status: 'active',
  heroTitle: 'AI Krak Hack 2026',
  heroSubtitle: 'Zmierzmy si\u0119 po raz kolejny z wyzwaniami naszego miejskiego otoczenia, wykorzystuj\u0105c potencja\u0142 optymalizacji, uczenia maszynowego i sztucznej inteligencji!',
  heroDate: '27-28 Marca 2026',
  ctaApplyUrl: '/forms',
  categories: [
    {
      icon: 'MapPin',
      title: 'Analiza Geosprzestrzenna',
      description: 'GIS & Modelowanie',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: 'Database',
      title: 'Process Mining & AI',
      description: 'Automatyzacja Workflow',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: 'Brain',
      title: 'Machine Learning',
      description: 'Algorytmy Predykcyjne',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: 'Workflow',
      title: 'Automatyzacja Proces\u00f3w',
      description: 'BPMN & Integracje',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: 'Map',
      title: 'Infrastruktura & IoT',
      description: 'Smart City Solutions',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: 'Zap',
      title: 'Real-time Analytics',
      description: 'Przetwarzanie Strumieniowe',
      color: 'from-purple-500 to-indigo-600',
    },
  ],
  challenges: [
    {
      id: 'geospatial',
      title: 'Smart Infrastructure Challenge',
      subtitle: 'Infrastruktura przysz\u0142o\u015bci oparta na danych',
      icon: 'MapPin',
      color: 'from-blue-500 to-cyan-600',
      technologies: ['GIS', 'Python', 'PostGIS', 'Machine Learning', 'Optimization', 'Geospatial Analysis'],
      shortDescription: 'Zaprojektuj inteligentn\u0105 infrastruktur\u0119 lokaln\u0105 wykorzystuj\u0105c analiz\u0119 danych geoprzestrzennych, optymalizacj\u0119 tras i modelowanie przestrzenne.',
      fullDescription: `To wyzwanie dotyczy opracowania koncepcji nowej infrastruktury o lokalnym zasi\u0119gu w oparciu o analiz\u0119 danych geoprzestrzennych. Zadanie ma otwarty i eksploracyjny charakter, z wyra\u017anym naciskiem na podej\u015bcie programistyczne i analityczne. Do dyspozycji b\u0119d\u0105 m.in. informacje o istniej\u0105cej infrastrukturze, ukszta\u0142towaniu terenu, terenach zielonych oraz nat\u0119\u017ceniu ruchu. Sugerowane jest wykorzystanie metod takich jak optymalizacja, modelowanie, uczenie maszynowe lub zaawansowana analiza danych. Celem jest zaproponowanie rozwi\u0105zania, kt\u00f3re odpowiada na potrzeby u\u017cytkownik\u00f3w i realia przestrzenne regionu.`,
      deliverables: [
        'Analiza istniej\u0105cej infrastruktury',
        'Model optymalizacyjny nowej infrastruktury',
        'Wizualizacja geosprzestrzenna rozwi\u0105zania',
        'Symulacja wp\u0142ywu na ruch i u\u017cytkownik\u00f3w',
        'Rekomendacje implementacyjne'
      ]
    },
    {
      id: 'process-automation',
      title: 'Process-to-Automation Copilot',
      subtitle: 'Od danych procesowych do automatyzacji',
      icon: 'Workflow',
      color: 'from-purple-500 to-pink-600',
      technologies: ['Process Mining', 'BPMN', 'AI Agents', 'Workflow Engines', 'Python', 'Camunda'],
      shortDescription: 'Zbuduj inteligentnego asystenta, kt\u00f3ry przekszta\u0142ca dane o procesach biznesowych w gotow\u0105 automatyzacj\u0119 workflow. Wykorzystaj process mining, AI agents i workflow engines.',
      fullDescription: `Wyzwanie polega na opracowaniu prototypu rozwi\u0105zania typu Process-to-Automation Copilot, kt\u00f3re skraca drog\u0119 od \u201ejak naprawd\u0119 dzia\u0142a proces w firmie\u201d do wdro\u017conej automatyzacji.

**Pipeline produktowy obejmuje:**
1. **Odkrywanie procesu** - analiza danych operacyjnych (event logs, process mining)
2. **Agentowe wnioskowanie** - AI wybiera najlepsze miejsca na automatyzacj\u0119
3. **Generowanie definicji** - formalna definicja procesu (BPMN) gotowa do workflow engine
4. **Artefakty wdro\u017ceniowe** - formularze, zmienne, regu\u0142y decyzyjne dla demonstracji

**Dost\u0119pne dane:**
1. Logi zdarze\u0144 procesowych z atrybutami przypadk\u00f3w
2. Czasy trwania i op\u00f3\u017anienia
3. Wariantowo\u015b\u0107 proces\u00f3w M\u015aP
4. R\u0119czne kroki i braki w danych

**Oczekiwany rezultat:**
Dzia\u0142aj\u0105cy prototyp (API/serwis/UI/CLI), kt\u00f3ry potrafi zobrazowa\u0107 przebieg procesu, wskaza\u0107 w\u0105skie gard\u0142a, zasugerowa\u0107 automatyzacj\u0119 i wygenerowa\u0107 definicj\u0119 workflow gotow\u0105 do uruchomienia.`,
      deliverables: [
        'Analiza i wizualizacja wariant\u00f3w procesu',
        'Identyfikacja w\u0105skich garde\u0142 i strat',
        'Rekomendacje automatyzacji z uzasadnieniem',
        'Wygenerowana definicja BPMN + zmienne',
        'Demo dzia\u0142aj\u0105cej automatyzacji'
      ]
    },
  ],
  timelineSteps: [
    {
      title: 'Rekrutacja',
      dateRange: 'Luty - Marzec 2026',
      description: 'Otwarte zg\u0142oszenia dla wszystkich zainteresowanych uczestnik\u00f3w',
      color: 'cyan',
    },
    {
      title: 'pi\u0105tek 20.03, 18:00',
      dateRange: '20.03.2026',
      description: 'Udost\u0119pnienie materia\u0142\u00f3w przygotowawczych - sprawd\u017a baz\u0119 wiedzy!',
      color: 'cyan',
    },
    {
      title: 'pi\u0105tek 27.03, 18:00',
      dateRange: '27.03.2026',
      description: 'Start hackathonu - Udost\u0119pnienie zada\u0144 i rozpocz\u0119cie pracy nad projektami AI',
      color: 'pink',
    },
    {
      title: 'sobota 28.03, 09:00',
      dateRange: '28.03.2026',
      description: 'Praca na uczelni - Intensywna praca zespo\u0142owa z wsparciem mentor\u00f3w',
      color: 'pink',
    },
    {
      title: 'sobota 28.03, 13:00',
      dateRange: '28.03.2026',
      description: 'Przerwa na obiad i sesje mentoringowe. PIZZA!',
      color: 'cyan',
    },
    {
      title: 'sobota 28.03, 17:30',
      dateRange: '28.03.2026',
      description: 'Demo & Fina\u0142 - Prezentacje projekt\u00f3w przed jury i og\u0142oszenie wynik\u00f3w',
      color: 'pink',
    },
    {
      title: 'sobota 28.03, 19:00',
      dateRange: '28.03.2026',
      description: 'Knowledge sharing - Wyst\u0105pienia zaproszonych go\u015bci',
      color: 'cyan',
    },
    {
      title: 'sobota 28.03, 20:00',
      dateRange: '28.03.2026',
      description: 'Og\u0142oszenie wynik\u00f3w i wr\u0119czenie nagr\u00f3d',
      color: 'pink',
    },
    {
      title: 'sobota 28.03, 21:00',
      dateRange: '28.03.2026',
      description: 'Afterparty & Integracja uczestnik\u00f3w',
      color: 'cyan',
    },
  ],
  highlights: [
    {
      icon: 'Brain',
      title: 'Kompetencje Przysz\u0142o\u015bci',
      description: 'Praktyczne zastosowanie najnowszych osi\u0105gni\u0119\u0107 machine learning i deep learning w realnych scenariuszach projektowych',
    },
    {
      icon: 'Database',
      title: 'Realne Zbiory Danych',
      description: 'Dost\u0119p do autentycznych informacji geoprzestrzennych i procesowych pozwalaj\u0105cy zmierzy\u0107 si\u0119 z prawdziwymi wyzwaniami',
    },
    {
      icon: 'FolderOpen',
      title: 'Budowa Portfolio',
      description: 'Stw\u00f3rz dzia\u0142aj\u0105cy prototyp, kt\u00f3ry wyr\u00f3\u017cni Twoje kompetencje na rynku pracy i w procesach rekrutacyjnych',
    },
    {
      icon: 'Target',
      title: 'Realny Wp\u0142yw',
      description: 'Twoje rozwi\u0105zania mog\u0105 zosta\u0107 wdro\u017cone w rzeczywistych systemach i wp\u0142yn\u0105\u0107 na \u017cycie mieszka\u0144c\u00f3w Krakowa',
    },
    {
      icon: 'Users',
      title: 'Networking & Mentoring',
      description: 'Poznaj ekspert\u00f3w AI, potencjalnych pracodawc\u00f3w i zbuduj warto\u015bciow\u0105 sie\u0107 kontakt\u00f3w w bran\u017cy',
    },
    {
      icon: 'Zap',
      title: 'Nauka w Praktyce',
      description: 'Szybkie przyswajanie wiedzy przez dzia\u0142anie, praca w zespole i rozwi\u0105zywanie problem\u00f3w pod presj\u0105 czasu',
    },
  ],
  program: {
    title: 'Jak to dzia\u0142a?',
    description: 'AI Krak Hack to intensywny hackathon, w kt\u00f3rym zespo\u0142y pracuj\u0105 przez 24 godziny nad projektami AI. Otrzymujesz wsparcie mentor\u00f3w, dost\u0119p do danych i infrastruktury, a na koniec prezentujesz sw\u00f3j projekt przed jury.',
    faqs: [
      {
        question: 'Czy ka\u017cdy mo\u017ce wzi\u0105\u0107 udzia\u0142?',
        answer: 'Ka\u017cdy student z dowolnej uczelni. Je\u015bli jeste\u015b bardziej do\u015bwiadczon\u0105 osob\u0105, a chcia\u0142by\u015b wzi\u0105\u0107 udzia\u0142, gor\u0105co Ci\u0119 zapraszamy jako mentora, ewentualnie mo\u017cesz poprowadzi\u0107 sekcj\u0119 knowledge sharing, je\u015bli masz na to jaki\u015b pomys\u0142. Najlepiej skontaktuj si\u0119 z nami przez maila.',
      },
      {
        question: 'Czy musz\u0119 mie\u0107 do\u015bwiadczenie z AI?',
        answer: 'Nie! Przyjmujemy uczestnik\u00f3w na r\u00f3\u017cnych poziomach zaawansowania. Wa\u017cna jest ch\u0119\u0107 nauki i praca zespo\u0142owa.',
      },
      {
        question: 'Czy musz\u0119 mie\u0107 sw\u00f3j zesp\u00f3\u0142?',
        answer: 'Nie musisz! Mo\u017cesz zg\u0142osi\u0107 si\u0119 indywidualnie, a my pomo\u017cemy Ci znale\u017a\u0107 zesp\u00f3\u0142 z osobami o podobnych zainteresowaniach.',
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
        answer: 'Wydarzenie odb\u0119dzie si\u0119 w Krakowie, szczeg\u00f3\u0142y lokalizacji zostan\u0105 podane po rekrutacji.',
      },
    ],
  },
  partners: [
    { name: 'AI Possibilities Lab' },
    { name: 'AGH UST' },
  ],
  gallery: getRandomGalleryImages(6, '2025'), // Using 2025 images for 2026 preview
};
