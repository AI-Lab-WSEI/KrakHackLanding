import { GraduationCap, FlaskConical, MessageCircle, Building2, Handshake, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ValueCompany {
  name: string;
  value: string;
  // logo?: string; // URL — do dodania w przyszłości
}

export interface ValueItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  fullContent: string[];
  linkLeft: { label: string; description: string };
  linkRight: { label: string; description: string };
  color: string;
  highlights?: string[];
  companies?: ValueCompany[];
  externalLink?: { url: string; label: string };
}

export const VALUES: ValueItem[] = [
  {
    id: 'praca-dyplomowa',
    icon: GraduationCap,
    title: 'Pomysł na pracę dyplomową',
    description: 'Nie masz tematu na inżynierkę lub magisterkę? Mamy bazę pomysłów i mentorów z doświadczeniem, którzy pomogą Ci wybrać i zrealizować temat.',
    color: 'from-cyan-500 to-blue-600',
    linkLeft: {
      label: 'Student',
      description: 'Szukasz tematu, który ma sens i da Ci przewagę na rynku pracy',
    },
    linkRight: {
      label: 'Uczelnia',
      description: 'Zyskuje realne projekty wdrożeniowe i zaangażowanych studentów',
    },
    fullContent: [
      'Pisanie pracy dyplomowej to jedno z największych wyzwań na studiach — zwłaszcza gdy nie wiesz, od czego zacząć. W AI Possibilities Lab mamy bazę pomysłów na prace inżynierskie i magisterskie, które są osadzone w realnych problemach i wykorzystują najnowsze technologie AI.',
      'Nasi mentorzy — zarówno członkowie koła z doświadczeniem, jak i współpracujący eksperci z branży — pomogą Ci wybrać temat, zaplanować pracę i przejść przez cały proces od researchu po obronę.',
      'Uczelnia zyskuje na tym równie dużo — realne projekty wdrożeniowe, zaangażowani studenci, którzy piszą prace na tematy istotne dla partnerów biznesowych. To sytuacja win-win.',
    ],
    highlights: [
      'Baza pomysłów na prace dyplomowe z obszaru AI/ML',
      'Mentoring od doświadczonych członków i ekspertów',
      'Realne dane i problemy biznesowe jako podstawa pracy',
      'Pomoc w planowaniu, pisaniu i przygotowaniu do obrony',
      'Możliwość kontynuacji projektu po obronie',
    ],
  },
  {
    id: 'sciezka-naukowa',
    icon: FlaskConical,
    title: 'Ścieżka naukowa',
    description: 'Konferencje, publikacje, badania — bridgujemy Twoją ścieżkę akademicką z realnym światem AI. Pokażemy Ci jak zacząć.',
    color: 'from-blue-500 to-indigo-600',
    linkLeft: {
      label: 'Młody badacz',
      description: 'Chcesz publikować, jeździć na konferencje, robić badania',
    },
    linkRight: {
      label: 'Konferencje i organizacje',
      description: 'Szukają świeżej perspektywy i innowacyjnych badań',
    },
    fullContent: [
      'Ścieżka naukowa nie musi być samotna droga. W AI Possibilities Lab tworzymy środowisko, gdzie młodzi badacze mogą rozwijać się w otoczeniu ludzi z podobnymi ambicjami.',
      'Współpracujemy z Zeszytami Naukowymi WSEI — pomagamy członkom koła w przygotowaniu artykułów naukowych, które mogą zostać opublikowane w recenzowanym czasopiśmie uczelni. To realny wpis do dorobku naukowego już na etapie studiów.',
      'Organizujemy paper reading groups, wspólnie analizujemy najnowsze publikacje i trendy w AI. Bridgujemy drogę między uczelnią a konferencjami branżowymi — takimi jak AINOW czy inne wydarzenia w ekosystemie AI w Polsce i Europie.',
      'Współpracujemy z władzami uczelni WSEI, żeby ścieżka naukowa naszych członków była wspierana instytucjonalnie. Budujemy most między studentami a światem badań.',
    ],
    highlights: [
      'Publikacje w Zeszytach Naukowych WSEI — recenzowane czasopismo uczelniane',
      'Paper reading groups — wspólna analiza najnowszych badań AI',
      'Pomoc w przygotowaniu artykułów naukowych i abstraktów',
      'Bridging do konferencji branżowych (AINOW i inne)',
      'Współpraca z władzami uczelni WSEI',
      'Wspólne projekty badawcze z mentorami akademickimi',
    ],
  },
  {
    id: 'community',
    icon: MessageCircle,
    title: 'Community na Discordzie',
    description: 'Dołącz do naszego Discorda — wymieniaj się doświadczeniami, projektami i kontaktami z innymi pasjonatami AI.',
    color: 'from-indigo-500 to-purple-600',
    linkLeft: {
      label: 'Pasjonat AI',
      description: 'Chcesz się uczyć, dzielić doświadczeniami, realizować projekty',
    },
    linkRight: {
      label: 'Społeczność',
      description: 'Otwarte spotkania, wymiana wiedzy, projekty w wolnym czasie',
    },
    fullContent: [
      'Nasza społeczność na Discordzie to otwarta przestrzeń dla wszystkich, którzy interesują się sztuczną inteligencją — niezależnie od uczelni, miasta czy poziomu doświadczenia.',
      'Niektóre spotkania koła są wewnętrzne (tylko dla członków WSEI), ale wiele z nich jest otwartych dla całej społeczności. Warsztaty, prezentacje, dyskusje — każdy może dołączyć i wnieść swoją perspektywę.',
      'Community to też miejsce, gdzie ludzie z branży — developerzy, data scientists, product managerowie — spotykają się z młodymi talentami. Naturalne połączenie między uczącymi się a doświadczonymi.',
    ],
    highlights: [
      'Otwarta przestrzeń na Discordzie — zero barier wejścia',
      'Spotkania otwarte i wewnętrzne (WSEI)',
      'Projekty realizowane w wolnym czasie ze społecznością',
      'Wymiana doświadczeń z ludźmi z branży',
      'Networking w naturalny, nieformalny sposób',
    ],
  },
  {
    id: 'firmy-rekruterzy',
    icon: Building2,
    title: 'Dla firm i rekruterów',
    description: 'Szukasz talentów AI? Nasza społeczność to przyszli specjaliści ML, data science i inżynierii — poznaj ich, zanim trafią na rynek.',
    color: 'from-purple-500 to-pink-600',
    linkLeft: {
      label: 'Firma',
      description: 'Szukasz sprawdzonych talentów AI, ML, data science',
    },
    linkRight: {
      label: 'Absolwenci koła',
      description: 'Sprawdzeni w projektach, gotowi do rekrutacji',
    },
    fullContent: [
      'Członkowie AI Possibilities Lab to nie zwykli studenci — to ludzie, którzy dobrowolnie poświęcają swój czas na projekty AI, hackathony i samorozwój. Wiemy, że sprawdzili się w praktyce, bo widzimy ich w akcji.',
      'Firmy partnerskie mają dostęp do naszych członków i absolwentów, którzy poszukują pracy lub staży. Możemy polecić konkretne osoby na podstawie ich realnych umiejętności i zaangażowania w projektach koła.',
      'Współpracujemy z firmami z różnych branż — od technologii, przez FMCG, po consulting. Każda firma, która chce dotrzeć do młodych talentów AI, jest mile widziana.',
    ],
    highlights: [
      'Dostęp do sprawdzonych talentów AI/ML/Data Science',
      'Polecenia oparte na realnych projektach, nie tylko CV',
      'Współpraca przy rekrutacji stażystów i juniorów',
      'Prezentacje firm na spotkaniach koła',
      'Wspólne projekty proof-of-concept',
    ],
    companies: [
      {
        name: 'Heineken',
        value: 'Globalny lider FMCG z zaawansowanymi potrzebami w zakresie analizy danych, optymalizacji łańcucha dostaw i predykcji popytu. Współpraca otwiera drzwi do projektów z realnym wpływem na operacje biznesowe.',
      },
      {
        name: 'KYP',
        value: 'Firma technologiczna specjalizująca się w innowacyjnych rozwiązaniach. Współpraca z KYP daje członkom koła możliwość pracy nad projektami na styku AI i produktu.',
      },
      // {
      //   name: 'Ritz',
      //   value: 'Partner biznesowy z doświadczeniem w implementacji rozwiązań AI. Oferuje perspektywę praktycznego wdrażania technologii w środowisku korporacyjnym.',
      // },
      // ─── Placeholder: odkomentuj gdy pojawią się nowi partnerzy ───
      // {
      //   name: 'Firma 4',
      //   value: 'Opis wartości współpracy z Firmą 4.',
      // },
      // {
      //   name: 'Firma 5',
      //   value: 'Opis wartości współpracy z Firmą 5.',
      // },
    ],
  },
  {
    id: 'wspolpraca',
    icon: Handshake,
    title: 'Współpraca z marką',
    description: 'Organizujesz event? Masz projekt? Działajmy razem — chętnie wniesiemy wiedzę, doświadczenie i energię.',
    color: 'from-pink-500 to-rose-600',
    linkLeft: {
      label: 'Organizator / Partner',
      description: 'Masz event, projekt, pomysł na współpracę',
    },
    linkRight: {
      label: 'AI Possibilities Lab',
      description: 'Marka z doświadczeniem, projektami i społecznością',
    },
    fullContent: [
      'AI Possibilities Lab to nie tylko koło naukowe — to marka z rozpoznawalnością w środowisku AI w Krakowie. Organizujemy AI Krak Hack, prowadzimy warsztaty, jeździmy na konferencje i budujemy społeczność.',
      'Jeśli organizujesz event związany z AI, technologią lub edukacją — porozmawiajmy. Możemy wystawić stoisko, poprowadzić warsztat, zaprosić naszych członków, albo po prostu pomóc w promocji.',
      'Szukamy partnerów, którzy dzielą naszą wizję — łączenie nauki z praktyką, studentów z branżą, pomysłów z realizacją. Chętnie przyjmiemy wiedzę z Twojej strony i będziemy współtworzyć wartość.',
    ],
    highlights: [
      'Organizacja wspólnych eventów i konkursów',
      'Wystawianie stoiska AI Possibilities Lab na konferencjach',
      'Prowadzenie warsztatów i prezentacji',
      'Cross-promocja w naszych kanałach (Discord, LinkedIn, strona)',
      'Wspólne projekty open-source',
    ],
  },
  {
    id: 'projekty',
    icon: Rocket,
    title: 'Projekty i hackathony',
    description: 'AI Krak Hack, warsztaty, wewnętrzne projekty — budujemy rzeczy, które mają realny wpływ. Dołącz do kolejnej edycji.',
    color: 'from-rose-500 to-orange-600',
    linkLeft: {
      label: 'Uczestnik',
      description: 'Chcesz budować, kodować, wdrażać realne rozwiązania',
    },
    linkRight: {
      label: 'AI Krak Hack',
      description: 'Realny hackathon z realnymi wyzwaniami i danymi',
    },
    fullContent: [
      'AI Krak Hack to nasz flagowy projekt — hackathon, w którym zespoły mierzą się z realnymi problemami miasta Krakowa i partnerów biznesowych, wykorzystując sztuczną inteligencję.',
      'Ale to nie jedyne co robimy. Wewnątrz koła prowadzimy projekty, które rozwijają umiejętności członków — od budowy modeli ML, przez aplikacje z LLM-ami, po narzędzia do analizy danych.',
      'Każdy projekt to okazja do nauki w praktyce, budowania portfolio i pracy zespołowej. Nie musisz być ekspertem — wystarczy chęć do nauki i działania.',
    ],
    highlights: [
      'AI Krak Hack — nasz flagowy hackathon',
      'Wewnętrzne projekty koła (ML, LLM, data analysis)',
      'Warsztaty techniczne prowadzone przez członków',
      'Portfolio-ready projekty do CV',
      'Praca zespołowa w interdyscyplinarnych grupach',
    ],
    externalLink: {
      url: '/',
      label: 'Zobacz AI Krak Hack 2026',
    },
  },
];

export function getValueBySlug(slug: string): ValueItem | undefined {
  return VALUES.find((v) => v.id === slug);
}
