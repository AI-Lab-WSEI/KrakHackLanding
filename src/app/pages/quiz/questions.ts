// Quiz wiedzy o AI — bank pytań + konfiguracja poziomów.
// Źródło: 23 EASY / 20 MID / 13 EXPERT, dostarczone przez Michała.

export type Difficulty = 'easy' | 'mid' | 'expert';
export type LevelKey = 'easy' | 'mid' | 'hard';
export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  q: string;
  options: Record<OptionLetter, string>;
  correct: OptionLetter;
}

export type QuestionBank = Record<Difficulty, Question[]>;

export interface QuizQuestion extends Question {
  difficulty: Difficulty;
  seconds: number;
}

export interface QuizLevel {
  id: LevelKey;
  label: string;
  color: string;
  blurb: string;
  mix: Record<Difficulty, number>;
}

// Per-difficulty timing — każde pytanie używa timera swojej trudności,
// niezależnie od wybranego poziomu (easy = szybko, expert = powoli).
export const DIFFICULTY_SECONDS: Record<Difficulty, number> = {
  easy: 15,
  mid: 20,
  expert: 30,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Łatwe',
  mid: 'Średnie',
  expert: 'Trudne',
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#22c55e',
  mid: '#f59e0b',
  expert: '#ef4444',
};

// Trzy tryby gry. Każdy ciągnie z wszystkich trzech pul, ale z innym
// środkiem ciężkości — easy mode to głównie rozgrzewka, hard mode to
// głównie expert. Total = 10 pytań we wszystkich trybach (porównywalność).
export const QUIZ_LEVELS: Record<LevelKey, QuizLevel> = {
  easy: {
    id: 'easy',
    label: 'Łatwy',
    color: '#22c55e',
    blurb: 'Rozgrzewka. Mix lekkich pytań — sprawdzasz fundamenty.',
    mix: { easy: 6, mid: 3, expert: 1 },
  },
  mid: {
    id: 'mid',
    label: 'Średni',
    color: '#f59e0b',
    blurb: 'Równe tempo — po trochu z każdego poziomu.',
    mix: { easy: 3, mid: 5, expert: 2 },
  },
  hard: {
    id: 'hard',
    label: 'Trudny',
    color: '#ef4444',
    blurb: 'Dla twardzieli. Dominują pytania expertowe.',
    mix: { easy: 1, mid: 3, expert: 6 },
  },
};

export function totalQuestionsForLevel(levelKey: LevelKey): number {
  const m = QUIZ_LEVELS[levelKey].mix;
  return m.easy + m.mid + m.expert;
}

export function estimatedSecondsForLevel(levelKey: LevelKey): number {
  const m = QUIZ_LEVELS[levelKey].mix;
  return (
    m.easy * DIFFICULTY_SECONDS.easy +
    m.mid * DIFFICULTY_SECONDS.mid +
    m.expert * DIFFICULTY_SECONDS.expert
  );
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(pool: readonly T[], n: number): T[] {
  return shuffle(pool).slice(0, n);
}

export function buildQuizForLevel(levelKey: LevelKey): QuizQuestion[] {
  const { mix } = QUIZ_LEVELS[levelKey];
  const tag = (qs: Question[], d: Difficulty): QuizQuestion[] =>
    qs.map((q) => ({ ...q, difficulty: d, seconds: DIFFICULTY_SECONDS[d] }));
  // Kolejność: easy → mid → expert (intuicyjny ramp w obrębie zestawu).
  return [
    ...tag(pickN(QUESTIONS.easy, mix.easy), 'easy'),
    ...tag(pickN(QUESTIONS.mid, mix.mid), 'mid'),
    ...tag(pickN(QUESTIONS.expert, mix.expert), 'expert'),
  ];
}

export const QUESTIONS: QuestionBank = {
  easy: [
    {
      id: 'easy-1',
      q: 'Jaka jest zasadnicza różnica między klasycznym Generative AI (GenAI) a Agentic AI?',
      options: {
        A: 'GenAI służy do generowania kodu, natomiast Agentic AI operuje wyłącznie na tekście.',
        B: 'GenAI jest zawsze rozwiązaniem typu open-source, a Agentic AI wymaga zamkniętej subskrypcji.',
        C: 'GenAI głównie generuje odpowiedź na bezpośredni prompt, podczas gdy Agentic AI potrafi samodzielnie planować etapy pracy i podejmować działania, by osiągnąć złożony cel.',
        D: 'Nie ma różnicy — są to synonimy używane zamiennie w marketingu.',
      },
      correct: 'C',
    },
    {
      id: 'easy-2',
      q: 'Czym są „tokeny" w kontekście pracy z modelami LLM?',
      options: {
        A: 'Punktami w programie lojalnościowym za częste korzystanie z API.',
        B: 'Podstawowymi jednostkami tekstu (słowami lub ich fragmentami), na które model dzieli dane wejściowe przed ich przetworzeniem.',
        C: 'Nazwami wag w warstwach ukrytych (hidden layers) sieci neuronowej.',
        D: 'Unikalnymi kluczami dostępu niezbędnymi do wdrożenia modelu na serwerze.',
      },
      correct: 'B',
    },
    {
      id: 'easy-3',
      q: 'Na czym polega mechanizm „attention" (uwagi) w architekturze Transformer?',
      options: {
        A: 'Pozwala modelowi zignorować większość danych wejściowych, aby przyspieszyć proces uczenia.',
        B: 'Jest to system powiadomień informujący inżyniera o wystąpieniu błędu w modelu.',
        C: 'Pozwala modelowi dynamicznie określać, które elementy sekwencji są kluczowe dla zrozumienia kontekstu danego słowa.',
        D: 'Służy do monitorowania obciążenia procesora podczas generowania odpowiedzi.',
      },
      correct: 'C',
    },
    {
      id: 'easy-4',
      q: 'Co oznacza termin „fine-tuning" modelu językowego?',
      options: {
        A: 'Całkowite zresetowanie wag i parametrów modelu oraz ponowne trenowanie od zera.',
        B: 'Proces dotrenowania wstępnie wytrenowanego modelu na specyficznym, mniejszym zbiorze danych w celu optymalizacji pod konkretne zadanie.',
        C: 'Redukcję rozmiaru kodu modelu, aby zminimalizować zużycie pamięci RAM.',
        D: 'Technikę pisania bardzo rozbudowanych i szczegółowych promptów.',
      },
      correct: 'B',
    },
    {
      id: 'easy-5',
      q: 'Kiedy mówimy, że model AI „halucynuje"?',
      options: {
        A: 'Gdy system odmawia odpowiedzi ze względu na filtry bezpieczeństwa.',
        B: 'Gdy model generuje odpowiedź, która brzmi wiarygodnie i logicznie, ale zawiera nieprawdziwe lub całkowicie zmyślone informacje.',
        C: 'Gdy proces trenowania modelu przekracza założony czas i nie wykazuje postępów.',
        D: 'Gdy model zaczyna używać emotikonów w oficjalnych raportach technicznych.',
      },
      correct: 'B',
    },
    {
      id: 'easy-6',
      q: 'Czym jest „embedding" w architekturze LLM?',
      options: {
        A: 'Techniką usuwania słów pospolitych (stop-words) z tekstu źródłowego.',
        B: 'Ostatnią warstwą modelu, która zamienia liczby z powrotem na czytelny tekst.',
        C: 'Reprezentacją słów lub fraz w postaci wektorów liczbowych w wielowymiarowej przestrzeni, co pozwala modelowi uchwycić relacje semantyczne.',
        D: 'Metodą regularyzacji, która zapobiega zjawisku przeuczenia (overfittingu).',
      },
      correct: 'C',
    },
    {
      id: 'easy-7',
      q: 'Jaka jest główna rola prompt engineeringu?',
      options: {
        A: 'Tworzenie dokumentacji technicznej i instrukcji obsługi modeli AI.',
        B: 'Takie formułowanie zapytań, aby uzyskać jak najbardziej precyzyjny wynik bez konieczności modyfikowania parametrów modelu.',
        C: 'Optymalizacja architektury procesorów GPU pod kątem trenowania sieci neuronowych.',
        D: 'Ręczne korygowanie wag w poszczególnych warstwach sieci neuronowej.',
      },
      correct: 'B',
    },
    {
      id: 'easy-8',
      q: 'Co odróżnia model BERT od architektury GPT?',
      options: {
        A: 'GPT służy wyłącznie do analizy obrazu, natomiast BERT operuje na tekście.',
        B: 'BERT jest dwukierunkowy (bidirectional), co pozwala mu lepiej rozumieć kontekst słowa na podstawie wyrazów występujących zarówno przed nim, jak i po nim.',
        C: 'BERT nie bazuje na architekturze Transformer, wykorzystując zamiast tego proste sieci rekurencyjne.',
        D: 'GPT-2 wymaga stałego połączenia z Internetem, podczas gdy BERT działa w pełni offline.',
      },
      correct: 'B',
    },
    {
      id: 'easy-9',
      q: 'Co w kontekście Agentic AI oznacza moduł planowania (planning module)?',
      options: {
        A: 'Narzędzie do zarządzania czasem pracy zespołu programistów.',
        B: 'Komponent systemu, który pozwala agentowi AI rozbić złożony problem na sekwencję mniejszych zadań i ustalić kolejność ich realizacji.',
        C: 'Skrypt służący do wizualizacji krzywej uczenia się modelu (loss curves).',
        D: 'Inne określenie na funkcję aktywacji wewnątrz agenta.',
      },
      correct: 'B',
    },
    {
      id: 'easy-10',
      q: 'Na czym polega „Zero-shot learning" w modelach językowych?',
      options: {
        A: 'Na trenowaniu modelu na całkowicie pustym zbiorze danych.',
        B: 'Na zdolności modelu do wykonania zadania, którego nie widział w trakcie treningu, bez podawania mu żadnych przykładów w prompcie.',
        C: 'Na sytuacji, w której model zawsze zwraca wartość zerową z powodu błędu.',
        D: 'Na technice usuwania zbędnych parametrów z modelu w celu jego odchudzenia.',
      },
      correct: 'B',
    },
    {
      id: 'easy-11',
      q: 'Jaką rolę w systemach Agentic AI pełni pamięć (memory)?',
      options: {
        A: 'Przechowuje wyłącznie kopie zapasowe wag modelu na wypadek awarii.',
        B: 'Pozwala agentowi śledzić historię działań, uzyskane wyniki i zgromadzone informacje w ramach realizowanego zadania.',
        C: 'Odnosi się wyłącznie do fizycznej pamięci RAM serwera, na którym uruchomiono AI.',
        D: 'Decyduje o tym, jak szybko model generuje kolejne słowa w zdaniu.',
      },
      correct: 'B',
    },
    {
      id: 'easy-12',
      q: 'Czym różni się uczenie nadzorowane (supervised) od nienadzorowanego (unsupervised)?',
      options: {
        A: 'W uczeniu nadzorowanym model samodzielnie szuka wzorców bez żadnych danych wejściowych.',
        B: 'W uczeniu nadzorowanym wykorzystujemy dane etykietowane (labeled data), czyli takie, które zawierają już gotowe odpowiedzi.',
        C: 'Uczenie nienadzorowane wymaga znacznie większej liczby warstw ukrytych w sieci.',
        D: 'Uczenie nadzorowane znajduje zastosowanie wyłącznie w analizie tekstów (NLP).',
      },
      correct: 'B',
    },
    {
      id: 'easy-13',
      q: 'Kiedy w modelu występuje zjawisko przeuczenia (overfitting)?',
      options: {
        A: 'Gdy model uczy się zbyt powoli z powodu zbyt niskiego parametru learning rate.',
        B: 'Gdy model świetnie radzi sobie z danymi treningowymi, ale nie potrafi generalizować wiedzy na nowych danych (testowych).',
        C: 'Gdy model jest zbyt prosty, by wykryć jakiekolwiek zależności w danych (underfitting).',
        D: 'Gdy model podczas pracy zużywa więcej zasobów, niż przewidział inżynier.',
      },
      correct: 'B',
    },
    {
      id: 'easy-14',
      q: 'Dlaczego w Data Science stosuje się podział danych na zbiór treningowy i testowy?',
      options: {
        A: 'Aby skrócić czas obliczeń poprzez trenowanie modelu na mniejszej liczbie próbek.',
        B: 'Ponieważ większość algorytmów nie jest w stanie przetworzyć całego zbioru danych jednocześnie.',
        C: 'Aby obiektywnie ocenić zdolność modelu do generalizacji na danych, których nie widział on podczas uczenia.',
        D: 'Aby wyeliminować błędy powstałe na etapie inżynierii cech (feature engineering).',
      },
      correct: 'C',
    },
    {
      id: 'easy-15',
      q: 'Na czym polega inżynieria cech (feature engineering)?',
      options: {
        A: 'Na automatycznej aktualizacji wag i biasów przez sieć neuronową.',
        B: 'Na tworzeniu nowych, wartościowych zmiennych na podstawie istniejących danych, aby ułatwić modelowi zrozumienie problemu.',
        C: 'Na usuwaniu wierszy z brakującymi danymi ze zbioru treningowego.',
        D: 'Na technice redukcji liczby warstw ukrytych w celu optymalizacji modelu.',
      },
      correct: 'B',
    },
    {
      id: 'easy-16',
      q: 'Jaka jest główna rola funkcji aktywacji (np. ReLU lub Sigmoid) w sieciach neuronowych?',
      options: {
        A: 'Wprowadza nieliniowość, co pozwala sieci uczyć się złożonych zależności, których nie oddałby prosty model liniowy.',
        B: 'Odpowiada za losową inicjalizację wag przed rozpoczęciem procesu uczenia.',
        C: 'Służy wyłącznie do obliczania ostatecznej dokładności modelu (accuracy).',
        D: 'Umożliwia automatyczny podział danych na zbiór treningowy i walidacyjny.',
      },
      correct: 'A',
    },
    {
      id: 'easy-17',
      q: 'Dlaczego sama metryka dokładności (accuracy) może być myląca przy niezbalansowanych zbiorach danych?',
      options: {
        A: 'Ponieważ dokładność zawsze maleje wraz ze wzrostem liczby cech.',
        B: 'Ponieważ przy rzadkich zjawiskach (np. 1% oszustw) model, który zawsze wskazuje brak oszustwa, będzie miał 99% dokładności, mimo że jest bezużyteczny.',
        C: 'Ponieważ dokładność nie uwzględnia wag przypisanych do warstw ukrytych.',
        D: 'Ponieważ do jej obliczenia wymagany jest kosztowny proces wstecznej propagacji błędu.',
      },
      correct: 'B',
    },
    {
      id: 'easy-18',
      q: 'Do czego służy technika regularyzacji?',
      options: {
        A: 'Pomaga zapobiegać przeuczeniu (overfittingowi) poprzez nakładanie kar na funkcję straty za zbyt wysokie wartości wag.',
        B: 'Służy do automatycznego uzupełniania braków w danych (imputacji).',
        C: 'Jest procesem przenoszenia gotowego modelu na serwer produkcyjny.',
        D: 'Przyspiesza proces znajdowania globalnego minimum w algorytmie gradient descent.',
      },
      correct: 'A',
    },
    {
      id: 'easy-19',
      q: 'W jakich zadaniach najlepiej sprawdza się architektura CNN (Convolutional Neural Networks)?',
      options: {
        A: 'W prognozowaniu cen akcji na giełdzie w oparciu o szeregi czasowe.',
        B: 'W klasyfikacji i analizie obrazów dzięki zastosowaniu filtrów wykrywających wzorce wizualne.',
        C: 'W prostych zadaniach regresji, gdzie mamy mało zmiennych numerycznych.',
        D: 'Wyłącznie w zadaniach polegających na grupowaniu danych bez etykiet (clustering).',
      },
      correct: 'B',
    },
    {
      id: 'easy-20',
      q: 'Kiedy warto rozważyć użycie modelu typu LSTM (Long Short-Term Memory)?',
      options: {
        A: 'Przy pracy z danymi sekwencyjnymi (tekst, szeregi czasowe), gdzie ważne jest zachowanie informacji z odległych punktów w czasie.',
        B: 'Gdy chcemy przeprowadzić proste grupowanie danych metodą k-średnich.',
        C: 'Tylko w sytuacjach, gdy nasz zbiór danych jest bardzo mały (poniżej 100 rekordów).',
        D: 'Gdy model składa się wyłącznie z jednej warstwy wejściowej i wyjściowej.',
      },
      correct: 'A',
    },
    {
      id: 'easy-21',
      q: 'Czym są wagi (weights) i biasy w sieci neuronowej?',
      options: {
        A: 'Metrykami określającymi precyzję oraz czułość modelu.',
        B: 'Parametrami modelu, które są aktualizowane podczas treningu, aby zminimalizować błąd przewidywań.',
        C: 'Nazwami algorytmów służących do usuwania duplikatów z baz danych.',
        D: 'Technikami redukcji wymiarowości, takimi jak analiza składowych głównych (PCA).',
      },
      correct: 'B',
    },
    {
      id: 'easy-22',
      q: 'Czym jest „Baseline" w projekcie Data Science?',
      options: {
        A: 'Ostatecznym wynikiem uzyskanym po długotrwałym dostrajaniu modelu.',
        B: 'Prostym modelem (np. średnią lub regułą), który stanowi punkt odniesienia dla bardziej zaawansowanych algorytmów.',
        C: 'Warstwą wyjściową w sieciach konwolucyjnych (CNN).',
        D: 'Maksymalną dopuszczalną wartością współczynnika uczenia (learning rate).',
      },
      correct: 'B',
    },
    {
      id: 'easy-23',
      q: 'Co mierzy metryka F1-score?',
      options: {
        A: 'Czas potrzebny procesorowi na wykonanie jednej epoki treningowej.',
        B: 'Odległość między punktami danych w przestrzeni wielowymiarowej.',
        C: 'Średnią harmoniczną z precyzji (precision) i pełności (recall), dając zrównoważony obraz jakości klasyfikacji.',
        D: 'Całkowitą liczbę parametrów w sieci typu Deep Learning.',
      },
      correct: 'C',
    },
  ],

  mid: [
    {
      id: 'mid-1',
      q: 'Jak zmienia się zachowanie modelu w kontekście kompromisu między obciążeniem a wariancją (bias-variance tradeoff), gdy drastycznie zwiększamy liczbę parametrów?',
      options: {
        A: 'Zwiększamy obciążenie (bias), jednocześnie zmniejszając wariancję (ryzyko underfittingu).',
        B: 'Zwiększamy wariancję, zmniejszając obciążenie (ryzyko overfittingu w klasycznym ujęciu).',
        C: 'Oba parametry maleją dzięki optymalizacji procesem wstecznej propagacji błędu.',
        D: 'Obciążenie i wariancja pozostają stałe, a zmianie ulega jedynie współczynnik uczenia (learning rate).',
      },
      correct: 'B',
    },
    {
      id: 'mid-2',
      q: 'Dlaczego w zadaniach selekcji cech (feature selection) preferujemy regularyzację L1 (Lasso) nad L2 (Ridge)?',
      options: {
        A: 'L1 jest prostsza obliczeniowo, ponieważ nie wymaga operacji potęgowania wag.',
        B: 'L2 zawsze prowadzi do przeuczenia modelu na dużych zbiorach danych.',
        C: 'L1 ma tendencję do zerowania wag mniej istotnych cech, co naturalnie prowadzi do rzadkich (sparse) modeli.',
        D: 'L2 stosuje się wyłącznie w regresji liniowej, natomiast L1 jest zarezerwowana dla sieci neuronowych.',
      },
      correct: 'C',
    },
    {
      id: 'mid-3',
      q: 'Jaką rolę pełni mechanizm momentum w optymalizatorach typu SGD z punktu widzenia geometrii powierzchni kosztu?',
      options: {
        A: 'Wykorzystuje wykładniczą średnią kroczącą poprzednich gradientów, co pomaga „przepchnąć" model przez minima lokalne i wygładzić oscylacje.',
        B: 'Automatycznie przywraca wagi do wartości początkowych, gdy funkcja straty przestaje maleć.',
        C: 'Odpowiada za progresywne zmniejszanie learning rate w miarę zbliżania się do minimum globalnego.',
        D: 'Służy do automatycznego podziału na zbiór treningowy i testowy wewnątrz każdej epoki.',
      },
      correct: 'A',
    },
    {
      id: 'mid-4',
      q: 'Jaki problem rozwiązała architektura ResNet poprzez wprowadzenie połączeń skrótowych (skip connections)?',
      options: {
        A: 'Wąskie gardło przy odczycie danych z dysku (I/O bottleneck).',
        B: 'Ograniczenie liczby klas, które model może klasyfikować jednocześnie.',
        C: 'Degradację dokładności w bardzo głębokich sieciach, ułatwiając przepływ gradientu dzięki mapowaniu tożsamościowemu (identity mapping).',
        D: 'Konieczność stosowania wyłącznie małych filtrów splotowych o rozmiarze 1x1.',
      },
      correct: 'C',
    },
    {
      id: 'mid-5',
      q: 'W jaki sposób proces Batch Normalization wpływa na proces trenowania sieci neuronowej?',
      options: {
        A: 'Usuwa wszystkie wartości odstające (outliery) ze zbioru danych przed rozpoczęciem uczenia.',
        B: 'Normalizuje aktywacje wewnątrz warstw, co stabilizuje proces nauki i pozwala na zastosowanie wyższego współczynnika uczenia.',
        C: 'Redukuje liczbę parametrów modelu poprzez usuwanie zbędnych połączeń między neuronami.',
        D: 'Jest to technika wykorzystywana wyłącznie przy optymalizacji modeli pod urządzenia mobilne.',
      },
      correct: 'B',
    },
    {
      id: 'mid-6',
      q: 'Na czym polega zasadnicza różnica między Baggingiem (np. Random Forests) a Boostingiem (np. XGBoost)?',
      options: {
        A: 'Bagging trenuje modele sekwencyjnie, natomiast Boosting robi to równolegle.',
        B: 'Bagging trenuje niezależne modele na różnych podzbiorach danych i uśrednia ich wyniki, podczas gdy Boosting buduje modele sekwencyjnie, gdzie każdy kolejny naprawia błędy poprzednika.',
        C: 'Bagging znajduje zastosowanie tylko w regresji, a Boosting wyłącznie w klasyfikacji.',
        D: 'Nie ma różnicy — są to dwie nazwy na ten sam proces uczenia zespołowego (ensemble learning).',
      },
      correct: 'B',
    },
    {
      id: 'mid-7',
      q: 'Czym jest entropia w kontekście budowania drzew decyzyjnych?',
      options: {
        A: 'Metryką określającą szybkość zbieżności algorytmu.',
        B: 'Miarą nieuporządkowania lub niepewności w zbiorze danych; służy do wyliczania przyrostu informacji (Information Gain) przy wyborze podziału.',
        C: 'Sumą wszystkich wag we wszystkich warstwach sieci neuronowej.',
        D: 'Błędem wynikającym z zastosowania zbyt małej liczby poziomów drzewa.',
      },
      correct: 'B',
    },
    {
      id: 'mid-8',
      q: 'Co w algorytmie PCA (Principal Component Analysis) reprezentują wartości własne (eigenvalues) macierzy kowariancji?',
      options: {
        A: 'Informują o tym, jaka część wariancji danych jest wyjaśniana przez dany główny komponent.',
        B: 'Określają optymalną wartość learning rate dla procesu redukcji wymiarowości.',
        C: 'Wskazują na liczbę brakujących danych (missing values) w konkretnych kolumnach.',
        D: 'Służą do obliczania wyniku F1-score po dokonaniu transformacji danych.',
      },
      correct: 'A',
    },
    {
      id: 'mid-9',
      q: 'Jaka jest przewaga mechanizmu Self-Attention nad warstwami LSTM?',
      options: {
        A: 'Transformer jest modelem nienadzorowanym, podczas gdy LSTM wymaga etykiet.',
        B: 'Self-attention pozwala na równoległe przetwarzanie całej sekwencji i modelowanie zależności między odległymi elementami bez względu na ich dystans.',
        C: 'LSTM wymaga znacznie większej liczby tokenów do poprawnego zainicjalizowania wag.',
        D: 'Transformery nie posiadają wag treningowych, opierając się wyłącznie na statystycznej dystrybucji słów.',
      },
      correct: 'B',
    },
    {
      id: 'mid-10',
      q: 'Do czego służą biblioteki takie jak SHAP czy LIME?',
      options: {
        A: 'Do stratnej kompresji modeli przed ich publikacją na serwerze produkcyjnym.',
        B: 'Do interpretacji modeli typu „czarna skrzynka", pozwalając zrozumieć wpływ poszczególnych cech na konkretną predykcję.',
        C: 'Do automatycznego czyszczenia i wstępnego przetwarzania danych tekstowych (NLP wrangling).',
        D: 'Do generowania syntetycznych obrazów treningowych w architekturach GAN.',
      },
      correct: 'B',
    },
    {
      id: 'mid-11',
      q: 'Co jest istotą architektury Autoencodera (AE)?',
      options: {
        A: 'Składa się z kodera i dekodera, a jej celem jest nauka skompresowanej reprezentacji danych (przestrzeni ukrytej) poprzez rekonstrukcję wejścia na wyjściu.',
        B: 'Jest to model zaprojektowany wyłącznie do generowania wysokiej jakości obrazów twarzy.',
        C: 'Wykorzystuje proces rywalizacji dwóch sieci (adversarial training) do wykrywania anomalii.',
        D: 'Automatycznie dobiera parametry algorytmu klasyfikacji pod zadany zbiór danych.',
      },
      correct: 'A',
    },
    {
      id: 'mid-12',
      q: 'Jak działa mechanizm Early Stopping?',
      options: {
        A: 'Przerywa proces uczenia sztywno po 10 epokach, niezależnie od trendu metryk.',
        B: 'Monitoruje metrykę na zbiorze walidacyjnym i przerywa trening, gdy błąd przestaje spadać, co zapobiega przeuczeniu modelu.',
        C: 'Automatycznie zwalnia zasoby pamięci RAM, gdy funkcja straty osiągnie zbyt wysoką wartość.',
        D: 'Zatrzymuje obliczenia w momencie, gdy temperatura procesora graficznego przekroczy bezpieczny limit.',
      },
      correct: 'B',
    },
    {
      id: 'mid-13',
      q: 'Czym jest kwantyzacja (quantization) modelu LLM i jaki jest jej główny cel?',
      options: {
        A: 'Procesem zwiększania liczby parametrów modelu w celu poprawy jego zdolności rozumowania.',
        B: 'Techniką zmniejszania precyzji wag (np. z FP16 do INT4), co pozwala na redukcję zapotrzebowania na pamięć VRAM i przyspieszenie inferencji.',
        C: 'Metodą usuwania rzadko używanych tokenów ze słownika modelu.',
        D: 'Procesem zamiany architektury Transformer na prostsze sieci splotowe (CNN).',
      },
      correct: 'B',
    },
    {
      id: 'mid-14',
      q: 'Jaką funkcję pełni mechanizm KV Caching podczas generowania tekstu przez LLM?',
      options: {
        A: 'Służy do trwałego zapisywania rozmów użytkownika w bazie danych w celu późniejszego dotrenowania modelu.',
        B: 'Przyspiesza proces treningu poprzez cache\'owanie gradientów z poprzednich epok.',
        C: 'Przechowuje obliczone wcześniej wektory Key i Value dla poprzednich tokenów, aby uniknąć ich re-komputacji przy generowaniu każdego kolejnego słowa.',
        D: 'Jest to technika kompresji promptu, która usuwa z niego zbędne przymiotniki.',
      },
      correct: 'C',
    },
    {
      id: 'mid-15',
      q: 'Na czym polega technika LoRA (Low-Rank Adaptation) w kontekście fine-tuningu?',
      options: {
        A: 'Na zamianie wszystkich wag modelu na macierze o niskim rzędzie, co trwale uszkadza model bazowy.',
        B: 'Na zamrożeniu wag modelu bazowego i dodaniu trenowalnych macierzy o niskim rzędzie do wybranych warstw, co drastycznie zmniejsza liczbę parametrów wymagających aktualizacji.',
        C: 'Na uczeniu modelu wyłącznie na bardzo krótkich zdaniach (poniżej 5 tokenów).',
        D: 'Na automatycznym usuwaniu neuronów, które nie wykazują aktywności podczas fazy forward pass.',
      },
      correct: 'B',
    },
    {
      id: 'mid-16',
      q: 'Jaka jest główna przewaga architektury RAG (Retrieval-Augmented Generation) nad modelem bez dostępu do narzędzi?',
      options: {
        A: 'RAG pozwala modelowi generować odpowiedzi znacznie szybciej dzięki pominięciu warstwy Attention.',
        B: 'RAG eliminuje konieczność tokenizacji tekstu wejściowego.',
        C: 'Pozwala modelowi korzystać z aktualnych, zewnętrznych źródeł danych (np. baz wiedzy), co redukuje halucynacje i problem nieaktualnej wiedzy.',
        D: 'RAG automatycznie tłumaczy każde zapytanie na język angielski przed udzieleniem odpowiedzi.',
      },
      correct: 'C',
    },
    {
      id: 'mid-17',
      q: 'Jaką rolę pełni model nagrody (Reward Model) w procesie RLHF (Reinforcement Learning from Human Feedback)?',
      options: {
        A: 'Odpowiada za generowanie wariantów odpowiedzi, które są następnie oceniane przez ludzi.',
        B: 'Jest trenowany na preferencjach ludzi, aby naśladować ich oceny i służyć jako funkcja celu (scoring) dla głównego modelu podczas optymalizacji PPO.',
        C: 'Służy do blokowania wulgaryzmów i toksycznych treści w promptach użytkownika.',
        D: 'Jest to system bonusowy dla użytkowników, którzy zgłaszają błędy w działaniu AI.',
      },
      correct: 'B',
    },
    {
      id: 'mid-18',
      q: 'Co oznacza termin „context window" (okno kontekstowe) modelu LLM?',
      options: {
        A: 'Rozmiar okna przeglądarki, w którym wyświetlany jest interfejs czatu.',
        B: 'Liczbę języków, które model potrafi zrozumieć jednocześnie.',
        C: 'Maksymalną liczbę tokenów (wejściowych i wyjściowych), jakie model jest w stanie przetworzyć w ramach jednej sesji/zapytania.',
        D: 'Czas, po którym model „zapomina" dane użytkownika ze względu na regulacje RODO.',
      },
      correct: 'C',
    },
    {
      id: 'mid-19',
      q: 'Do czego wykorzystuje się bazy wektorowe (np. Pinecone, Milvus, FAISS) w systemach AI?',
      options: {
        A: 'Do przechowywania surowych plików tekstowych w celu ich późniejszego indeksowania przez Google.',
        B: 'Do hostowania wag modelu w sposób rozproszony na wielu serwerach.',
        C: 'Do wydajnego przeszukiwania podobieństwa semantycznego między embeddingami, co jest kluczowe w systemach RAG.',
        D: 'Do automatycznego generowania promptów na podstawie historii przeglądania użytkownika.',
      },
      correct: 'C',
    },
    {
      id: 'mid-20',
      q: 'Na czym polega destylacja wiedzy (Knowledge Distillation) w rozwoju modeli AI?',
      options: {
        A: 'Na usuwaniu z modelu wiedzy dotyczącej tematów wrażliwych i niebezpiecznych.',
        B: 'Na procesie łączenia dwóch małych modeli w jeden większy o większych możliwościach.',
        C: 'Na trenowaniu mniejszego modelu („ucznia"), aby naśladował wyjścia i zachowanie większego, bardziej złożonego modelu („nauczyciela").',
        D: 'Na wyodrębnianiu faktów historycznych z tekstów literackich przy użyciu wyrażeń regularnych.',
      },
      correct: 'C',
    },
  ],

  expert: [
    {
      id: 'expert-1',
      q: 'Jaka relacja zachodzi między algorytmami PPO (Proximal Policy Optimization) a TRPO (Trust-Region Policy Optimization)?',
      options: {
        A: 'PPO osiąga lepsze wyniki dzięki bezpośredniemu wykorzystaniu macierzy Hessiana w każdej iteracji.',
        B: 'PPO wprowadza twardy limit na średnią dywergencję KL, którego TRPO nie posiada.',
        C: 'W punkcie końcowym gradienty funkcji celu obu algorytmów są tożsame, co sprawia, że PPO jest prostszą w implementacji aproksymacją pierwszego rzędu dla TRPO.',
        D: 'TRPO bazuje na mechanizmie „clipping", aby zapobiegać zbyt gwałtownym zmianom polityki (policy).',
      },
      correct: 'C',
    },
    {
      id: 'expert-2',
      q: 'Dlaczego w mechanizmie Attention skaluje się iloczyn skalarny (dot-product) przez pierwiastek wymiarowości wektora ukrytego?',
      options: {
        A: 'Aby zwiększyć wagę tokenów znajdujących się w bezpośrednim sąsiedztwie w sekwencji.',
        B: 'Żeby umożliwić jednostkom GPU bardziej efektywne wykonywanie operacji macierzowych.',
        C: 'Ponieważ przy wysokiej wymiarowości iloczyn skalarny osiąga duże wartości, co powoduje nasycenie funkcji softmax i skutkuje bardzo małymi gradientami.',
        D: 'Jest to specyficzna forma regularyzacji dropout, stosowana wyłącznie w warstwie self-attention.',
      },
      correct: 'C',
    },
    {
      id: 'expert-3',
      q: 'Która właściwość jest najważniejsza dla frameworku SHAP w kontekście interpretowalności modeli?',
      options: {
        A: 'Konsystencja (Consistency) — jeśli model zmieni się tak, że wpływ danej cechy wzrośnie, jej wartość SHAP nie może zmaleć.',
        B: 'Globalna dokładność — suma wag wszystkich cech musi być równa dokładnie zero dla każdego przykładu.',
        C: 'Wykorzystanie jądra wykładniczego, które jest identyczne z implementacją stosowaną w metodzie LIME.',
        D: 'Możliwość wyjaśniania wyłącznie modeli liniowych, które nie korzystają z inżynierii cech.',
      },
      correct: 'A',
    },
    {
      id: 'expert-4',
      q: 'Na czym polega gra typu „minimax" w procesie trenowania sieci GAN?',
      options: {
        A: 'Obie sieci (Generator i Dyskryminator) dążą do zminimalizowania wspólnej funkcji błędu średniokwadratowego (MSE).',
        B: 'Generator stara się zmaksymalizować prawdopodobieństwo, że Dyskryminator poprawnie rozpozna fałszywe próbki.',
        C: 'Dyskryminator dąży do maksymalizacji trafności klasyfikacji, podczas gdy Generator próbuje zminimalizować szansę na poprawne rozpoznanie fałszerstwa.',
        D: 'Jest to proces jednoczesnej optymalizacji wag za pomocą dwóch radykalnie różnych współczynników uczenia.',
      },
      correct: 'C',
    },
    {
      id: 'expert-5',
      q: 'Zjawisko „Internal Covariate Shift", które Batch Normalization ma na celu ograniczyć, polega na:',
      options: {
        A: 'Gwałtownym wzroście wariancji danych treningowych tuż po zakończeniu każdej epoki.',
        B: 'Zmianie rozkładu aktywacji warstw sieci w trakcie treningu, co zmusza kolejne warstwy do ciągłej adaptacji do nowych parametrów.',
        C: 'Problemie zanikających gradientów występującym głównie w bardzo głębokich sieciach typu ResNet.',
        D: 'Przesunięciu etykiet w zbiorze treningowym względem testowego na skutek złego skalowania cech.',
      },
      correct: 'B',
    },
    {
      id: 'expert-6',
      q: 'Czym jest zjawisko „Double Descent" (podwójnego spadku) w kontekście głębokich sieci neuronowych?',
      options: {
        A: 'Sytuacją, w której błąd na zbiorze testowym spada, rośnie (overfitting), a następnie ponownie spada wraz ze zwiększaniem liczby parametrów poza punkt interpolacji.',
        B: 'Błędem w algorytmie SGD, który powoduje dwukrotne przejście przez to samo minimum lokalne w jednej epoce.',
        C: 'Techniką regularyzacji polegającą na dwukrotnym, gwałtownym zmniejszeniu współczynnika uczenia (learning rate).',
        D: 'Momentem, w którym gradienty enkodera i dekodera w modelu VAE przyjmują wartości ujemne.',
      },
      correct: 'A',
    },
    {
      id: 'expert-7',
      q: 'Jakie jest główne ograniczenie ekspresywności standardowych sieci grafowych (GNN) typu Message Passing?',
      options: {
        A: 'Całkowity brak możliwości przetwarzania grafów skierowanych.',
        B: 'Ich zdolność do rozróżniania struktur grafowych jest ograniczona przez test izomorfizmu grafów Weisfeilera-Lehmana (WL-test).',
        C: 'Wymóg, aby wszystkie węzły w grafie posiadały identyczną liczbę sąsiadów (stopień węzła).',
        D: 'Brak możliwości trenowania takich sieci przy użyciu klasycznego algorytmu SGD.',
      },
      correct: 'B',
    },
    {
      id: 'expert-8',
      q: 'W modelach dyfuzyjnych (Diffusion Models), jaką rolę pełni „Classifier-Free Guidance"?',
      options: {
        A: 'Pozwala na trenowanie modelu bez użycia jakichkolwiek etykiet w sposób w pełni nienadzorowany.',
        B: 'Umożliwia sterowanie procesem generowania (np. promptem) bez oddzielnego modelu klasyfikującego, poprzez mieszanie wyników modelu warunkowego i bezwarunkowego.',
        C: 'Służy do usuwania szumu z obrazów o niskiej rozdzielczości przy użyciu filtrów medianowych.',
        D: 'Jest techniką przyspieszającą samplowanie poprzez pominięcie kroków wstecznych w procesie odszumiania.',
      },
      correct: 'B',
    },
    {
      id: 'expert-9',
      q: 'Na czym polega problem „Deadly Triad" (zabójczej triady) w uczeniu przez wzmacnianie (RL)?',
      options: {
        A: 'Na jednoczesnym wystąpieniu trzech czynników: aproksymacji funkcji, uczenia off-policy oraz bootstrappingu, co może prowadzić do niestabilności i dywergencji.',
        B: 'Na konflikcie interesów między trzema niezależnymi agentami w środowisku wieloagentowym.',
        C: 'Na sytuacji, w której model nagrody, środowisko oraz agent posiadają sprzeczne funkcje celu.',
        D: 'Na błędnym dobraniu trzech kluczowych hiperparametrów: współczynnika uczenia, dyskonta oraz parametru epsilon.',
      },
      correct: 'A',
    },
    {
      id: 'expert-10',
      q: 'Czym charakteryzuje się metoda „Self-Consistency" w procesie generowania odpowiedzi przez LLM?',
      options: {
        A: 'Model sprawdza, czy jego odpowiedź jest zgodna z regulaminem bezpieczeństwa (alignment).',
        B: 'Polega na wygenerowaniu wielu różnych ścieżek rozumowania (Chain-of-Thought) dla tego samego pytania i wyborze ostatecznej odpowiedzi drogą głosowania większościowego (marginalizacja po ścieżkach rozumowania).',
        C: 'Służy do wymuszania, aby model zawsze odpowiadał w tym samym stylu, niezależnie od promptu.',
        D: 'Jest to technika polegająca na dotrenowaniu modelu na jego własnych, poprawnych odpowiedziach.',
      },
      correct: 'B',
    },
    {
      id: 'expert-11',
      q: 'Co oznacza zjawisko „Lost in the Middle" w kontekście systemów RAG i długiego okna kontekstowego?',
      options: {
        A: 'Model traci połączenie z bazą danych w połowie generowania odpowiedzi.',
        B: 'Tendencja modeli LLM do lepszego wykorzystywania informacji znajdujących się na samym początku lub na samym końcu dostarczonego kontekstu, przy jednoczesnym ignorowaniu faktów umieszczonych w jego środkowej części.',
        C: 'Problem polegający na tym, że model zapomina instrukcję systemową po wygenerowaniu 500 tokenów.',
        D: 'Błąd bazy wektorowej, który zwraca dokumenty o średnim podobieństwie zamiast najwyższym.',
      },
      correct: 'B',
    },
    {
      id: 'expert-12',
      q: 'Co to jest „Model Quantization-Aware Training" (QAT) i kiedy warto go zaprojektować?',
      options: {
        A: 'Metoda polegająca na trenowaniu modelu na bardzo małej liczbie danych wejściowych.',
        B: 'Technika, w której proces redukcji precyzji wag (np. do INT8) jest symulowany już podczas treningu, co pozwala modelowi lepiej zaadaptować się do błędów kwantyzacji.',
        C: 'System automatycznego dobierania liczby warstw w sieci neuronowej w zależności od obciążenia serwera.',
        D: 'Sposób pakowania modelu w kontenery Docker w celu optymalizacji zużycia RAM.',
      },
      correct: 'B',
    },
    {
      id: 'expert-13',
      q: 'Jaką metrykę statystyczną najczęściej wykorzystuje się do wykrywania Data Driftu w cechach numerycznych?',
      options: {
        A: 'F1-Score oraz Precision-Recall AUC.',
        B: 'Test Kołmogorowa-Smirnowa (K-S test) lub Population Stability Index (PSI) poprzez porównanie rozkładu danych produkcyjnych z referencyjnymi.',
        C: 'Średni błąd kwadratowy (MSE) mierzony na zbiorze walidacyjnym.',
        D: 'Liczbę operacji zmiennoprzecinkowych na sekundę (FLOPS).',
      },
      correct: 'B',
    },
  ],
};
