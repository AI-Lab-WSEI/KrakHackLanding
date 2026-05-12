// Quiz wiedzy o AI — /quiz.
//
// Nowy flow (v2): e-mail + RODO + nick + tryb (timed/untimed) zbieramy
// UPFRONT na welcome. Po ostatnim pytaniu jeden POST /api/quiz/attempt:
// - zapisuje quiz_attempt z pełnymi metadanymi
// - upsertuje do lab_interests (CRM osób zainteresowanych Kołem)
// - wysyła raport mailem (Resend)
// - zwraca staty kohortowe + leaderboard + per-difficulty cohort avg
// Result screen pokazuje 3 wykresy + leaderboard + banner "wysłane".

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Infinity as InfinityIcon,
  Mail,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

import {
  buildQuizForLevel,
  DIFFICULTY_LABEL,
  DIFFICULTY_COLOR,
  estimatedSecondsForLevel,
  QUIZ_LEVELS,
  totalQuestionsForLevel,
  type Difficulty,
  type LevelKey,
  type Mode,
  type OptionLetter,
  type QuizQuestion,
} from '@/app/pages/quiz/questions';

// ───────────────────────── types & constants ─────────────────────────

interface AnswerRecord {
  id: string;
  difficulty: Difficulty;
  question: string;
  options: Record<OptionLetter, string>;
  picked: OptionLetter | null;
  correct: OptionLetter;
  isCorrect: boolean;
  timedOut: boolean;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  percent: number;
  correct: number;
  total: number;
  durationMs: number | null;
  isMe: boolean;
  createdAt: string;
}

interface PerDifficulty {
  mine: number;
  cohortAvg: number;
}

interface AttemptStats {
  attemptId: string;
  percentile: number;
  cohortSize: number;
  avgPercent: number;
  distribution: number[];
  perDifficulty: Partial<Record<Difficulty, PerDifficulty>>;
  leaderboard: LeaderboardEntry[];
  myRank: number;
  emailed: boolean;
}

interface FormState {
  email: string;
  displayName: string;
  rodo: boolean;
  newsletter: boolean;
  mode: Mode;
}

type Screen =
  | { kind: 'welcome' }
  | {
      kind: 'playing' | 'interlude';
      level: LevelKey;
      mode: Mode;
      form: FormState;
      questions: QuizQuestion[];
      index: number;
      answers: AnswerRecord[];
      startedAt: number;
    }
  | {
      kind: 'result';
      level: LevelKey;
      mode: Mode;
      form: FormState;
      questions: QuizQuestion[];
      answers: AnswerRecord[];
      durationMs: number;
      stats: AttemptStats | null;
      statsError: string | null;
    };

const STORAGE_KEY = 'aipl-quiz-form-v2';
const INTERLUDE_MS = 1100;
const FEEDBACK_MS = 900;

const PRAISE_CORRECT = ['Świetnie!', 'Trafione!', 'Brawo!', 'Mistrzostwo!', 'Doskonale!', 'Pięknie!', 'Czysta robota!', 'Tak jest!'];
const PRAISE_WRONG = ['Spokojnie, idziemy dalej.', 'Bywa. Następne!', 'Trudne pytanie.', 'Nie poddawaj się.', 'Każdy się uczy.'];

function pickFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function headlineFor(percent: number): string {
  if (percent === 100) return 'MISTRZ AI!';
  if (percent >= 85) return 'GENIALNY WYNIK';
  if (percent >= 70) return 'ŚWIETNY WYNIK';
  if (percent >= 50) return 'SOLIDNIE';
  if (percent >= 25) return 'JEST NAD CZYM POPRACOWAĆ';
  return 'SPRÓBUJ JESZCZE RAZ';
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function apiBase(): string {
  return import.meta.env.DEV ? 'http://localhost:3000' : '';
}

function fmtDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

const DEFAULT_FORM: FormState = {
  email: '',
  displayName: '',
  rodo: false,
  newsletter: false,
  mode: 'timed',
};

function loadFormFromStorage(): FormState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FORM;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return {
      ...DEFAULT_FORM,
      ...parsed,
      rodo: !!parsed.rodo,
      newsletter: !!parsed.newsletter,
      mode: parsed.mode === 'untimed' ? 'untimed' : 'timed',
    };
  } catch {
    return DEFAULT_FORM;
  }
}

function persistForm(form: FormState): void {
  try {
    // Nie zapisujemy zgód — niech użytkownik świadomie zaznaczy za każdym razem.
    const { email, displayName, mode } = form;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, displayName, mode }));
  } catch {
    /* ignore */
  }
}

// ───────────────────────────── page ─────────────────────────────

export function QuizPage() {
  const [form, setForm] = useState<FormState>(() => loadFormFromStorage());
  const [screen, setScreen] = useState<Screen>({ kind: 'welcome' });

  const updateForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      persistForm(next);
      return next;
    });
  }, []);

  const startLevel = useCallback(
    (level: LevelKey) => {
      const questions = buildQuizForLevel(level);
      setScreen({
        kind: 'playing',
        level,
        mode: form.mode,
        form,
        questions,
        index: 0,
        answers: [],
        startedAt: Date.now(),
      });
    },
    [form],
  );

  const onAnswerComplete = useCallback(
    async (
      answers: AnswerRecord[],
      questions: QuizQuestion[],
      level: LevelKey,
      mode: Mode,
      submittedForm: FormState,
      startedAt: number,
    ) => {
      const durationMs = Date.now() - startedAt;
      setScreen({ kind: 'result', level, mode, form: submittedForm, questions, answers, durationMs, stats: null, statsError: null });

      const correct = answers.filter((a) => a.isCorrect).length;
      const total = answers.length;
      const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
      const breakdown = (['easy', 'mid', 'expert'] as const).map((d) => ({
        difficulty: d,
        correct: answers.filter((a) => a.difficulty === d && a.isCorrect).length,
        total: answers.filter((a) => a.difficulty === d).length,
      }));

      try {
        const res = await fetch(`${apiBase()}/api/quiz/attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level, mode,
            email: submittedForm.email,
            displayName: submittedForm.displayName || null,
            consents: { rodo: submittedForm.rodo, newsletter: submittedForm.newsletter },
            correct, total, percent, breakdown,
            answers,
            durationMs,
          }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${body.slice(0, 120)}`);
        }
        const stats = (await res.json()) as AttemptStats;
        setScreen((s) => (s.kind === 'result' ? { ...s, stats, statsError: null } : s));
      } catch (err) {
        console.error('[quiz] /attempt failed', err);
        setScreen((s) =>
          s.kind === 'result'
            ? { ...s, stats: null, statsError: 'Nie udało się policzyć kohorty — wynik widzisz mimo to.' }
            : s,
        );
      }
    },
    [],
  );

  const replay = useCallback(() => setScreen({ kind: 'welcome' }), []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Strona główna
          </Link>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            AI Possibilities Lab · Quiz
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {screen.kind === 'welcome' && (
            <Welcome key="welcome" form={form} updateForm={updateForm} onPick={startLevel} />
          )}
          {(screen.kind === 'playing' || screen.kind === 'interlude') && (
            <Playing
              key={`play-${screen.level}-${screen.mode}-${screen.index}-${screen.kind}`}
              screen={screen}
              setScreen={setScreen}
              onFinish={onAnswerComplete}
            />
          )}
          {screen.kind === 'result' && (
            <ResultPanel key="result" screen={screen} onReplay={replay} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ───────────────────────────── welcome ─────────────────────────────

function Welcome({
  form,
  updateForm,
  onPick,
}: {
  form: FormState;
  updateForm: (patch: Partial<FormState>) => void;
  onPick: (level: LevelKey) => void;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const emailValid = isValidEmail(form.email);
  const canStart = emailValid && form.rodo;

  const tryStart = (level: LevelKey) => {
    if (!canStart) {
      setShowErrors(true);
      return;
    }
    onPick(level);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-widest text-gray-300 mb-5">
          <Sparkles className="w-3 h-3" />
          Quiz dnia
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
          SPRAWDŹ SWOJĄ WIEDZĘ <br className="hidden sm:block" />
          O <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
          10 pytań · trzy poziomy do wyboru. Po quizie zobaczysz wynik,
          porównanie z innymi i leaderboard. Pełny raport poleci na maila.
        </p>
      </div>

      {/* Formularz upfront */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 mb-6 flex flex-col gap-4">
        <div>
          <label htmlFor="quiz-email" className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1.5">
            Twój e-mail <span className="text-red-400">*</span>
          </label>
          <input
            id="quiz-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="ty@example.com"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 text-sm transition-colors"
          />
          {showErrors && !emailValid && (
            <p className="text-xs text-red-400 mt-1.5">Podaj prawidłowy e-mail — wynik wyślemy na ten adres.</p>
          )}
        </div>

        <div>
          <label htmlFor="quiz-name" className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1.5">
            Nick na leaderboard (opcjonalnie)
          </label>
          <input
            id="quiz-name"
            type="text"
            maxLength={40}
            placeholder="np. michał"
            value={form.displayName}
            onChange={(e) => updateForm({ displayName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 text-sm transition-colors"
          />
        </div>

        {/* Mode toggle */}
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-1.5">Tryb</div>
          <div className="inline-flex w-full sm:w-auto gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => updateForm({ mode: 'timed' })}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                form.mode === 'timed'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Z czasem
            </button>
            <button
              type="button"
              onClick={() => updateForm({ mode: 'untimed' })}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                form.mode === 'untimed'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5" />
              Bez limitu
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            {form.mode === 'timed'
              ? 'Timer per pytanie: 30s / 40s / 60s w zależności od trudności. Szybsze gry = wyżej na leaderboard.'
              : 'Bez timera — odpowiadaj w swoim tempie. Leaderboard liczony osobno dla tego trybu.'}
          </p>
        </div>

        {/* Consents */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={form.rodo}
              onChange={(e) => updateForm({ rodo: e.target.checked })}
              className="mt-1 w-4 h-4 accent-purple-500"
            />
            <span className="text-sm">
              <strong className="block text-white font-medium">
                Zgoda na przetwarzanie e-maila i kontakt <span className="text-red-400">*</span>
              </strong>
              <span className="block text-xs text-gray-400 leading-relaxed mt-0.5">
                Twój adres trafia do AI Possibilities Lab — żeby wysłać raport i ewentualnie odezwać
                się w sprawie wydarzeń koła. Zgodę cofniesz pisząc na lab@possibilitieslab.org.
              </span>
            </span>
          </label>
          {showErrors && !form.rodo && (
            <p className="text-xs text-red-400 px-3 -mt-1">Zaznacz zgodę, żebyśmy mogli wysłać raport.</p>
          )}
          <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={form.newsletter}
              onChange={(e) => updateForm({ newsletter: e.target.checked })}
              className="mt-1 w-4 h-4 accent-purple-500"
            />
            <span className="text-sm">
              <strong className="block text-white font-medium">Zapisz mnie do newslettera (opcjonalnie)</strong>
              <span className="block text-xs text-gray-400 leading-relaxed mt-0.5">
                Rzadki, sensowny e-mail o eventach, projektach koła i nowych quizach.
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Level picker */}
      <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-2 px-1">Wybierz poziom</div>
      <div className="flex flex-col gap-3">
        {(['easy', 'mid', 'hard'] as const).map((key) => {
          const lvl = QUIZ_LEVELS[key];
          const total = totalQuestionsForLevel(key);
          const mins = Math.round(estimatedSecondsForLevel(key) / 60);
          return (
            <button
              key={key}
              type="button"
              onClick={() => tryStart(key)}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: lvl.color, boxShadow: `0 0 12px ${lvl.color}` }}
                  />
                  <span className="text-base sm:text-lg font-bold tracking-tight">{lvl.label}</span>
                </div>
                <p className="text-sm text-gray-400 leading-snug">{lvl.blurb}</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-gray-500 mb-1">
                  {total} pytań{form.mode === 'timed' ? ` · ~${mins} min` : ''}
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                  Start
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center mt-6 max-w-md mx-auto leading-relaxed">
        Po quizie zobaczysz tu szczegółowy wynik z porównaniem do innych graczy,
        a pełny raport per pytanie poleci na Twoją skrzynkę.
      </p>
    </motion.section>
  );
}

// ───────────────────────────── playing ─────────────────────────────

type PlayingScreen = Extract<Screen, { kind: 'playing' | 'interlude' }>;

function isMilestone(nextIdx: number, total: number): boolean {
  return (
    nextIdx === Math.floor(total / 3) ||
    nextIdx === Math.floor(total / 2) ||
    nextIdx === Math.floor((total * 2) / 3) ||
    nextIdx === total - 1
  );
}

interface InterludeBeat {
  emoji: string;
  title: string;
  sub: string;
}

function interludeFor(nextIdx: number, total: number, correctSoFar: number): InterludeBeat {
  const remaining = total - nextIdx;
  if (nextIdx === Math.floor(total / 3)) {
    return { emoji: '🚀', title: 'Świetny start!', sub: `${correctSoFar}/${nextIdx} trafień. Lecimy z tym dalej.` };
  }
  if (nextIdx === Math.floor(total / 2)) {
    return { emoji: '💪', title: 'Połowa za Tobą!', sub: `${correctSoFar}/${nextIdx} trafień. Trzymaj tempo.` };
  }
  if (nextIdx === Math.floor((total * 2) / 3)) {
    return { emoji: '🔥', title: 'Już prawie meta!', sub: `${correctSoFar}/${nextIdx} trafień. Zostało jeszcze ${remaining}.` };
  }
  return { emoji: '🎯', title: 'Ostatnie pytanie!', sub: 'Daj z siebie wszystko.' };
}

function Playing({
  screen,
  setScreen,
  onFinish,
}: {
  screen: PlayingScreen;
  setScreen: (s: Screen) => void;
  onFinish: (a: AnswerRecord[], q: QuizQuestion[], l: LevelKey, m: Mode, f: FormState, startedAt: number) => void;
}) {
  if (screen.kind === 'interlude') {
    const correctSoFar = screen.answers.filter((a) => a.isCorrect).length;
    const beat = interludeFor(screen.index, screen.questions.length, correctSoFar);
    return <Interlude {...beat} />;
  }
  return (
    <Question
      screen={screen}
      onResolve={(answer) => {
        const answers = [...screen.answers, answer];
        const nextIdx = screen.index + 1;
        const total = screen.questions.length;
        if (nextIdx >= total) {
          onFinish(answers, screen.questions, screen.level, screen.mode, screen.form, screen.startedAt);
          return;
        }
        if (isMilestone(nextIdx, total)) {
          setScreen({ ...screen, kind: 'interlude', index: nextIdx, answers });
          setTimeout(() => {
            setScreen({ ...screen, kind: 'playing', index: nextIdx, answers });
          }, INTERLUDE_MS);
          return;
        }
        setScreen({ ...screen, kind: 'playing', index: nextIdx, answers });
      }}
    />
  );
}

function Interlude({ emoji, title, sub }: InterludeBeat) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="text-center py-16"
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{title}</h2>
      <p className="text-gray-400">{sub}</p>
    </motion.div>
  );
}

// ─────── single question — mode-aware timer ───────

function Question({
  screen,
  onResolve,
}: {
  screen: Extract<Screen, { kind: 'playing' }>;
  onResolve: (a: AnswerRecord) => void;
}) {
  const q = screen.questions[screen.index];
  const total = screen.questions.length;
  const timed = screen.mode === 'timed';
  const [picked, setPicked] = useState<OptionLetter | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState(timed ? q.seconds : Infinity);
  const lockedRef = useRef(false);
  const advancedRef = useRef(false);

  useEffect(() => {
    if (!timed || lockedRef.current) return;
    if (remaining <= 0) {
      lockedRef.current = true;
      setTimedOut(true);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, timed]);

  useEffect(() => {
    if (advancedRef.current) return;
    const isResolved = picked !== null || timedOut;
    if (!isResolved) return;
    advancedRef.current = true;
    const isCorrect = !timedOut && picked === q.correct;
    const t = setTimeout(
      () =>
        onResolve({
          id: q.id,
          difficulty: q.difficulty,
          question: q.q,
          options: q.options,
          picked,
          correct: q.correct,
          isCorrect,
          timedOut,
        }),
      FEEDBACK_MS,
    );
    return () => clearTimeout(t);
  }, [picked, timedOut, q, onResolve]);

  const handlePick = (letter: OptionLetter) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setPicked(letter);
  };

  const progressPct = Math.round((screen.index / total) * 100);
  const timerPct = timed && q.seconds > 0 ? remaining / q.seconds : 1;
  const ringOffset = 100 * (1 - timerPct);
  const ringClass = !timed
    ? 'stroke-purple-400/40'
    : remaining <= q.seconds * 0.25
      ? 'stroke-red-500'
      : remaining <= q.seconds * 0.5
        ? 'stroke-amber-400'
        : 'stroke-purple-400';
  const showFeedback = picked !== null || timedOut;
  const isCorrect = picked === q.correct;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-cyan-300 transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] uppercase tracking-widest">
            <span className="font-mono text-gray-400">
              {screen.index + 1} / {total}
            </span>
            <span className="text-gray-700">·</span>
            <span
              className="px-2 py-0.5 rounded-full border text-[10px]"
              style={{
                color: DIFFICULTY_COLOR[q.difficulty],
                borderColor: DIFFICULTY_COLOR[q.difficulty] + '55',
                background: DIFFICULTY_COLOR[q.difficulty] + '15',
              }}
            >
              {DIFFICULTY_LABEL[q.difficulty]}
            </span>
            <span className="text-gray-700">·</span>
            <span className="text-gray-500">{QUIZ_LEVELS[screen.level].label}</span>
          </div>
        </div>
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" strokeWidth="3" className="stroke-white/10" />
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className={`${ringClass} transition-[stroke-dashoffset] duration-700 ease-linear`}
              style={{ strokeDasharray: 100, strokeDashoffset: timed ? ringOffset : 0 }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold">
            {timed ? remaining : <InfinityIcon className="w-4 h-4" />}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-7">
        <h2 className="text-lg sm:text-xl font-bold leading-snug mb-5">{q.q}</h2>
        <ul className="flex flex-col gap-2">
          {(Object.entries(q.options) as Array<[OptionLetter, string]>).map(([letter, text]) => {
            const isPicked = picked === letter;
            const isAnswer = letter === q.correct;
            const reveal = showFeedback;
            const stateClass = !reveal
              ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25'
              : isAnswer
                ? 'bg-green-500/10 border-green-500/40 text-white'
                : isPicked
                  ? 'bg-red-500/10 border-red-500/40 text-white'
                  : 'bg-white/[0.02] border-white/5 text-gray-500';
            const badgeClass = !reveal
              ? 'bg-white/10 border-white/15 text-gray-300'
              : isAnswer
                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                : isPicked
                  ? 'bg-red-500/20 border-red-500/40 text-red-300'
                  : 'bg-white/5 border-white/10 text-gray-600';
            return (
              <li key={letter}>
                <button
                  type="button"
                  disabled={reveal}
                  onClick={() => handlePick(letter)}
                  className={`w-full flex items-start gap-3 text-left p-3 sm:p-4 rounded-xl border transition-colors ${stateClass} disabled:cursor-not-allowed`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-lg border font-mono text-xs font-semibold ${badgeClass}`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm leading-snug pt-1">{text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between mt-4 min-h-[20px]">
          {showFeedback ? (
            <span
              className={`text-sm font-medium inline-flex items-center gap-1.5 ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {timedOut ? (
                <>
                  <Clock className="w-3.5 h-3.5" /> Czas minął!
                </>
              ) : isCorrect ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {pickFrom(PRAISE_CORRECT)}
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" /> {pickFrom(PRAISE_WRONG)}
                </>
              )}
            </span>
          ) : (
            <span />
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ───────────────────────────── result ─────────────────────────────

type ResultScreen = Extract<Screen, { kind: 'result' }>;

function ResultPanel({ screen, onReplay }: { screen: ResultScreen; onReplay: () => void }) {
  const { level, mode, form, answers, stats, statsError, durationMs } = screen;
  const correct = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Per-difficulty mine vs cohort (cohort comes from server stats if loaded)
  const perDifficultyMine = useMemo(() => {
    const out: Partial<Record<Difficulty, number>> = {};
    (['easy', 'mid', 'expert'] as const).forEach((d) => {
      const set = answers.filter((a) => a.difficulty === d);
      if (set.length === 0) return;
      const right = set.filter((a) => a.isCorrect).length;
      out[d] = Math.round((right / set.length) * 100);
    });
    return out;
  }, [answers]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      {/* Email banner */}
      <EmailSentBanner email={form.email} emailed={stats?.emailed ?? null} statsError={statsError} />

      {/* Score header */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 text-center">
        <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
          Zakończone · {QUIZ_LEVELS[level].label} · {mode === 'timed' ? 'z czasem' : 'bez limitu'}
          {mode === 'timed' && durationMs > 0 ? ` · ${fmtDuration(durationMs)}` : ''}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 inline-flex items-center gap-2">
          {percent >= 70 && <Trophy className="w-7 h-7 text-amber-400" />}
          {headlineFor(percent)}
        </h2>
        <div className="font-mono text-5xl sm:text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-purple-400 bg-clip-text text-transparent leading-none">
          {correct}<span className="text-gray-700 mx-1">/</span>{total}
        </div>
        <div className="font-mono text-sm text-gray-500 mt-1">{percent}%</div>
      </div>

      {/* Percentile gauge — duża grafika */}
      <PercentileGauge stats={stats} myPercent={percent} levelLabel={QUIZ_LEVELS[level].label} />

      {/* Distribution histogram */}
      <DistributionChart stats={stats} myPercent={percent} />

      {/* Per-difficulty: mine vs cohort avg */}
      <DifficultyComparisonChart mine={perDifficultyMine} stats={stats} />

      {/* Leaderboard */}
      <LeaderboardPanel stats={stats} mode={mode} />

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold uppercase tracking-widest text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Zagraj ponownie
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs"
        >
          Strona główna
        </Link>
      </div>
    </motion.section>
  );
}

function EmailSentBanner({ email, emailed, statsError }: { email: string; emailed: boolean | null; statsError: string | null }) {
  if (statsError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3 text-sm text-amber-200">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span>{statsError}</span>
      </div>
    );
  }
  if (emailed === null) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-gray-400">
        <Mail className="w-4 h-4 animate-pulse" />
        <span>Wysyłamy raport na <strong className="text-white">{email}</strong>…</span>
      </div>
    );
  }
  if (emailed) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/[0.05] p-3 text-sm">
        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
        <span>Raport wysłany na <strong className="text-white">{email}</strong>. Zerknij do skrzynki (czasem trafia do spamu).</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3 text-sm text-amber-200">
      <Mail className="w-4 h-4 flex-shrink-0" />
      <span>Wynik mamy zapisany, ale mailing chwilowo nie odpalił — odezwiemy się ręcznie.</span>
    </div>
  );
}

// ─────── chart: big percentile gauge (arc 270°) ───────

function PercentileGauge({ stats, myPercent, levelLabel }: { stats: AttemptStats | null; myPercent: number; levelLabel: string }) {
  if (!stats) {
    return (
      <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.08] to-cyan-500/[0.04] p-6 animate-pulse h-44" />
    );
  }
  const pct = stats.percentile;
  // 270° arc (from -135° do +135°). r=70, c=2πr.
  const r = 70;
  const c = 2 * Math.PI * r;
  const arcLen = c * 0.75; // 270/360
  const filled = (pct / 100) * arcLen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.08] to-cyan-500/[0.04] p-5 sm:p-6"
    >
      <div className="text-[11px] uppercase tracking-widest text-purple-300/70 mb-1">Twoja pozycja w kohorcie</div>
      <div className="grid sm:grid-cols-[180px_1fr] gap-5 items-center">
        <div className="relative w-44 h-44 mx-auto sm:mx-0">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[225deg]">
            <circle cx="100" cy="100" r={r} fill="none" strokeWidth="14" className="stroke-white/10"
                    strokeDasharray={`${arcLen} ${c}`} strokeLinecap="round" />
            <motion.circle
              cx="100" cy="100" r={r} fill="none" strokeWidth="14"
              className="stroke-purple-400"
              strokeDasharray={`${filled} ${c}`}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: `${filled} ${c}` }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-4xl font-black bg-gradient-to-br from-white to-purple-300 bg-clip-text text-transparent leading-none">
              {pct}%
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">percentyl</div>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Lepszy niż <span className="text-purple-300">{pct}%</span> graczy
          </div>
          <div className="text-sm text-gray-400 leading-relaxed">
            na poziomie <strong className="text-white">{levelLabel}</strong>.
            Kohorta: <span className="font-mono text-white">{stats.cohortSize}</span> prób ·
            średnia <span className="font-mono text-white">{stats.avgPercent}%</span> ·
            Twój wynik <span className="font-mono text-white">{myPercent}%</span>.
          </div>
          {stats.myRank > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Miejsce w rankingu: <strong className="text-white font-mono">#{stats.myRank}</strong>
              {stats.cohortSize > 0 ? ` z ${stats.cohortSize}` : ''}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────── chart: 10-bin distribution with my bucket highlighted ───────

function DistributionChart({ stats, myPercent }: { stats: AttemptStats | null; myPercent: number }) {
  if (!stats) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 animate-pulse h-32" />;
  }
  const maxBin = Math.max(1, ...stats.distribution);
  const myBin = Math.min(9, Math.floor(myPercent / 10));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[11px] uppercase tracking-widest text-gray-400">Rozkład wyników kohorty</div>
        <div className="text-[11px] font-mono text-gray-500">{stats.cohortSize} prób</div>
      </div>
      <div className="flex items-end gap-1 h-28 mb-2">
        {stats.distribution.map((count, i) => {
          const h = (count / maxBin) * 100;
          const isMine = i === myBin;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end relative">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                className={`rounded-t ${isMine ? 'bg-purple-400 shadow-[0_0_12px_rgba(167,139,250,0.5)]' : 'bg-white/15'}`}
                style={{ minHeight: count > 0 ? 2 : 0 }}
                title={`${i * 10}–${i * 10 + 10}%: ${count} prób`}
              />
              {isMine && count > 0 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-purple-300 whitespace-nowrap">
                  Ty
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-gray-500">
        <span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span>
      </div>
    </div>
  );
}

// ─────── chart: per-difficulty grouped bars (mine vs cohort avg) ───────

function DifficultyComparisonChart({
  mine,
  stats,
}: {
  mine: Partial<Record<Difficulty, number>>;
  stats: AttemptStats | null;
}) {
  const diffs: Difficulty[] = ['easy', 'mid', 'expert'];
  const rows = diffs
    .map((d) => {
      const myV = mine[d];
      if (myV === undefined) return null;
      const cohortV = stats?.perDifficulty?.[d]?.cohortAvg ?? null;
      return { d, mine: myV, cohort: cohortV };
    })
    .filter((r): r is { d: Difficulty; mine: number; cohort: number | null } => r !== null);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-3">
        Ty vs średnia kohorty — wg trudności
      </div>
      <div className="flex flex-col gap-3">
        {rows.map(({ d, mine: myV, cohort }) => {
          const c = DIFFICULTY_COLOR[d];
          return (
            <div key={d}>
              <div className="flex items-baseline justify-between mb-1 text-xs">
                <span className="text-gray-300">{DIFFICULTY_LABEL[d]}</span>
                <span className="font-mono text-gray-500">
                  <span className="text-white">{myV}%</span>
                  {cohort !== null && <> · śr. {cohort}%</>}
                </span>
              </div>
              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: c }}
                  initial={{ width: 0 }}
                  animate={{ width: `${myV}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                {cohort !== null && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/60"
                    style={{ left: `${cohort}%`, boxShadow: '0 0 4px rgba(255,255,255,0.5)' }}
                    title={`Średnia kohorty: ${cohort}%`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500 mt-3">
        Słupek = Twój wynik. Pionowa kreska = średnia kohorty na tym poziomie trudności.
      </p>
    </div>
  );
}

// ─────── leaderboard top 10 ───────

function LeaderboardPanel({ stats, mode }: { stats: AttemptStats | null; mode: Mode }) {
  if (!stats || stats.leaderboard.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[11px] uppercase tracking-widest text-gray-400 inline-flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Leaderboard
          </div>
          <div className="text-[11px] font-mono text-gray-500">tryb: {mode === 'timed' ? 'z czasem' : 'bez limitu'}</div>
        </div>
        <p className="text-sm text-gray-500">Bądź pierwszy — leaderboard jest jeszcze pusty na tym poziomie.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[11px] uppercase tracking-widest text-gray-400 inline-flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Top 10
        </div>
        <div className="text-[11px] font-mono text-gray-500">tryb: {mode === 'timed' ? 'z czasem' : 'bez limitu'}</div>
      </div>
      <div className="flex flex-col gap-1">
        {stats.leaderboard.map((e) => (
          <div
            key={`${e.rank}-${e.createdAt}`}
            className={`grid grid-cols-[28px_1fr_auto] sm:grid-cols-[28px_1fr_auto_auto] items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              e.isMe ? 'bg-purple-500/15 border border-purple-500/30' : 'border border-transparent hover:bg-white/[0.02]'
            }`}
          >
            <span
              className={`font-mono text-xs ${
                e.rank === 1 ? 'text-amber-400' : e.rank === 2 ? 'text-gray-300' : e.rank === 3 ? 'text-amber-700' : 'text-gray-500'
              }`}
            >
              #{e.rank}
            </span>
            <span className="truncate">
              {e.displayName}
              {e.isMe && <span className="ml-2 text-[10px] uppercase tracking-widest text-purple-300">Ty</span>}
            </span>
            <span className="font-mono text-xs text-white">{e.correct}/{e.total} · {e.percent}%</span>
            <span className="hidden sm:inline font-mono text-xs text-gray-500">{fmtDuration(e.durationMs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
