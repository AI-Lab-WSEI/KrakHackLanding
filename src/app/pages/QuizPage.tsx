// Quiz wiedzy o AI — /quiz.
//
// Otwarte dla wszystkich (bez logowania). Flow:
//   welcome (wybór poziomu) → playing (timer + pytania, z interlude'ami) →
//   result (wynik + percentyl kohortowy + bramka emailowa) → thanks.
//
// Wynik zapisuje się anonimowo zaraz po ostatnim pytaniu (/api/quiz/attempt),
// dzięki czemu mamy kohortę do statystyk. Email + pełny raport per pytanie
// idzie do bazy + Resend DOPIERO po jawnej zgodzie RODO (/api/quiz/send-results).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  RotateCcw,
  Send,
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

interface AttemptStats {
  attemptId: string;
  percentile: number;   // 0..100 — % graczy z gorszym/równym wynikiem
  cohortSize: number;
  avgPercent: number;
  distribution: number[]; // 10 binów po 10% (suma = cohortSize)
}

type Screen =
  | { kind: 'welcome' }
  | {
      kind: 'playing' | 'interlude';
      level: LevelKey;
      questions: QuizQuestion[];
      index: number;
      answers: AnswerRecord[];
      startedAt: number;
    }
  | {
      kind: 'result';
      level: LevelKey;
      questions: QuizQuestion[];
      answers: AnswerRecord[];
      durationMs: number;
      stats: AttemptStats | null;
      statsError: string | null;
    }
  | { kind: 'thanks'; email: string };

const STORAGE_KEY = 'aipl-quiz-email';
const INTERLUDE_MS = 1100;
const FEEDBACK_MS = 900;

const PRAISE_CORRECT = [
  'Świetnie!', 'Trafione!', 'Brawo!', 'Mistrzostwo!',
  'Doskonale!', 'Pięknie!', 'Czysta robota!', 'Tak jest!',
];
const PRAISE_WRONG = [
  'Spokojnie, idziemy dalej.', 'Bywa. Następne!', 'Trudne pytanie.',
  'Nie poddawaj się.', 'Każdy się uczy.',
];

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

// ───────────────────────────── page ─────────────────────────────

export function QuizPage() {
  const [screen, setScreen] = useState<Screen>({ kind: 'welcome' });

  const startLevel = useCallback((level: LevelKey) => {
    const questions = buildQuizForLevel(level);
    setScreen({
      kind: 'playing',
      level,
      questions,
      index: 0,
      answers: [],
      startedAt: Date.now(),
    });
  }, []);

  const onAnswerComplete = useCallback(
    async (answers: AnswerRecord[], questions: QuizQuestion[], level: LevelKey, startedAt: number) => {
      const durationMs = Date.now() - startedAt;
      // Skok do ekranu wyniku natychmiast (z null statsami) — równolegle pollujemy /attempt.
      setScreen({
        kind: 'result',
        level,
        questions,
        answers,
        durationMs,
        stats: null,
        statsError: null,
      });

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
          body: JSON.stringify({ level, correct, total, percent, breakdown, durationMs }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const stats = (await res.json()) as AttemptStats;
        setScreen((s) =>
          s.kind === 'result' ? { ...s, stats, statsError: null } : s,
        );
      } catch {
        setScreen((s) =>
          s.kind === 'result'
            ? { ...s, stats: null, statsError: 'Statystyki niedostępne — wynik bez porównania kohortowego.' }
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
            <Welcome key="welcome" onPick={startLevel} />
          )}
          {(screen.kind === 'playing' || screen.kind === 'interlude') && (
            <Playing
              key={`play-${screen.level}-${screen.index}-${screen.kind}`}
              screen={screen}
              setScreen={setScreen}
              onFinish={onAnswerComplete}
            />
          )}
          {screen.kind === 'result' && (
            <ResultPanel
              key="result"
              screen={screen}
              onReplay={replay}
              onSent={(email) => setScreen({ kind: 'thanks', email })}
            />
          )}
          {screen.kind === 'thanks' && (
            <Thanks key="thanks" email={screen.email} onReplay={replay} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ───────────────────────────── welcome ─────────────────────────────

function Welcome({ onPick }: { onPick: (level: LevelKey) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-widest text-gray-300 mb-5">
          <Sparkles className="w-3 h-3" />
          Quiz dnia
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
          SPRAWDŹ SWOJĄ WIEDZĘ <br className="hidden sm:block" />
          O <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
          10 pytań · trzy poziomy do wyboru. Zagraj anonimowo — wynik
          zobaczysz od razu, pełny raport możesz dostać na mail.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {(['easy', 'mid', 'hard'] as const).map((key) => {
          const lvl = QUIZ_LEVELS[key];
          const total = totalQuestionsForLevel(key);
          const mins = Math.round(estimatedSecondsForLevel(key) / 60);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-left"
              style={{ ['--accent' as string]: lvl.color }}
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
                  {total} pytań · ~{mins} min
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

      <p className="text-xs text-gray-500 text-center mt-8 max-w-md mx-auto leading-relaxed">
        Wynik orientacyjny zobaczysz od razu, anonimowo. Pełny raport z
        rozpisaniem każdego pytania dostaniesz na maila po wyrażeniu zgody.
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
  onFinish: (answers: AnswerRecord[], questions: QuizQuestion[], level: LevelKey, startedAt: number) => void;
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
          void onFinish(answers, screen.questions, screen.level, screen.startedAt);
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

// ───────── single question — timer ring + locking options ─────────

function Question({
  screen,
  onResolve,
}: {
  screen: Extract<Screen, { kind: 'playing' }>;
  onResolve: (a: AnswerRecord) => void;
}) {
  const q = screen.questions[screen.index];
  const total = screen.questions.length;
  const [picked, setPicked] = useState<OptionLetter | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState(q.seconds);
  const lockedRef = useRef(false);
  const advancedRef = useRef(false);

  // Tick timer (1 Hz) — resetuje się z nowym pytaniem dzięki key= w QuizPage.
  useEffect(() => {
    if (lockedRef.current) return;
    if (remaining <= 0) {
      lockedRef.current = true;
      setTimedOut(true);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  // Auto-advance po wyborze odpowiedzi lub timeoucie.
  useEffect(() => {
    if (advancedRef.current) return;
    const isResolved = picked !== null || timedOut;
    if (!isResolved) return;
    advancedRef.current = true;
    const isCorrect = !timedOut && picked === q.correct;
    const answer: AnswerRecord = {
      id: q.id,
      difficulty: q.difficulty,
      question: q.q,
      options: q.options,
      picked,
      correct: q.correct,
      isCorrect,
      timedOut,
    };
    const t = setTimeout(() => onResolve(answer), FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [picked, timedOut, q, onResolve]);

  const handlePick = (letter: OptionLetter) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setPicked(letter);
  };

  const progressPct = Math.round((screen.index / total) * 100);
  const timerPct = q.seconds > 0 ? remaining / q.seconds : 0;
  const ringOffset = 100 * (1 - timerPct);
  const ringClass =
    remaining <= q.seconds * 0.25
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
      {/* topbar */}
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
              style={{ strokeDasharray: 100, strokeDashoffset: ringOffset }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold">
            {remaining}
          </span>
        </div>
      </div>

      {/* card */}
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

function ResultPanel({
  screen,
  onReplay,
  onSent,
}: {
  screen: ResultScreen;
  onReplay: () => void;
  onSent: (email: string) => void;
}) {
  const { level, answers, durationMs, stats, statsError } = screen;
  const correct = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const breakdownDiffs: Difficulty[] = ['easy', 'mid', 'expert'];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      {/* Score header */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 text-center">
        <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
          Zakończone · poziom {QUIZ_LEVELS[level].label}
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

      {/* Cohort stats — the analytics panel */}
      <CohortPanel stats={stats} error={statsError} myPercent={percent} levelLabel={QUIZ_LEVELS[level].label} />

      {/* Per-difficulty bars */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-3">
          Rozbicie wg trudności
        </div>
        <div className="flex flex-col gap-3">
          {breakdownDiffs.map((d) => {
            const set = answers.filter((a) => a.difficulty === d);
            const right = set.filter((a) => a.isCorrect).length;
            const pct = set.length > 0 ? Math.round((right / set.length) * 100) : 0;
            if (set.length === 0) return null;
            return (
              <div key={d} className="grid grid-cols-[80px_1fr_60px] items-center gap-3">
                <div className="text-xs text-gray-400">{DIFFICULTY_LABEL[d]}</div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: DIFFICULTY_COLOR[d] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="font-mono text-[11px] text-gray-500 text-right">
                  {right}/{set.length}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email gate */}
      <EmailGate
        level={level}
        answers={answers}
        attemptId={stats?.attemptId ?? null}
        durationMs={durationMs}
        onSent={onSent}
      />

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold uppercase tracking-widest text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Zagraj ponownie
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs"
        >
          Strona główna
        </Link>
      </div>
    </motion.section>
  );
}

// ─────────── cohort analytics panel ───────────

function CohortPanel({
  stats,
  error,
  myPercent,
  levelLabel,
}: {
  stats: AttemptStats | null;
  error: string | null;
  myPercent: number;
  levelLabel: string;
}) {
  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-gray-500">
        {error}
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">
          Liczę kohortę…
        </div>
        <div className="h-16 animate-pulse bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  const maxBin = Math.max(1, ...stats.distribution);
  const myBin = Math.min(9, Math.floor(myPercent / 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.08] to-cyan-500/[0.04] p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-purple-300/70 mb-0.5">
            Twoja pozycja w kohorcie
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            Lepszy niż <span className="text-purple-300">{stats.percentile}%</span> graczy
          </div>
          <div className="text-xs text-gray-400 mt-1">
            na poziomie <span className="text-white">{levelLabel}</span> ·{' '}
            <span className="font-mono">{stats.cohortSize}</span> prób ·
            śr. <span className="font-mono">{stats.avgPercent}%</span>
          </div>
        </div>
      </div>

      {/* Distribution mini-chart */}
      <div className="flex items-end gap-1 h-20 mb-2">
        {stats.distribution.map((count, i) => {
          const h = (count / maxBin) * 100;
          const isMine = i === myBin;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                className={`rounded-t ${isMine ? 'bg-purple-400' : 'bg-white/15'}`}
                style={{ minHeight: count > 0 ? 2 : 0 }}
                title={`${i * 10}–${i * 10 + 10}%: ${count} prób`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-gray-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>

      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        Każda twoja gra zostawia anonimowy ślad — Ty widzisz, gdzie jesteś;
        my widzimy, gdzie są <em>luki w wiedzy o AI</em> w naszej społeczności,
        i wiemy, co eksponować na warsztatach.
      </p>
    </motion.div>
  );
}

// ─────────── email gate ───────────

function EmailGate({
  level,
  answers,
  attemptId,
  durationMs,
  onSent,
}: {
  level: LevelKey;
  answers: AnswerRecord[];
  attemptId: string | null;
  durationMs: number;
  onSent: (email: string) => void;
}) {
  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rodo, setRodo] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError('Podaj prawidłowy adres e-mail.');
      return;
    }
    setEmailError(null);
    if (!rodo) {
      setSendError('Zaznacz zgodę na przetwarzanie e-maila.');
      return;
    }
    setSendError(null);
    setSending(true);
    try {
      localStorage.setItem(STORAGE_KEY, email);
    } catch {
      /* ignore */
    }

    const correct = answers.filter((a) => a.isCorrect).length;
    const total = answers.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const breakdown = (['easy', 'mid', 'expert'] as const).map((d) => ({
      difficulty: d,
      correct: answers.filter((a) => a.difficulty === d && a.isCorrect).length,
      total: answers.filter((a) => a.difficulty === d).length,
    }));

    try {
      const res = await fetch(`${apiBase()}/api/quiz/send-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          email,
          consents: { rodo, newsletter },
          level,
          score: { correct, total, percent },
          breakdown,
          answers,
          durationMs,
          completedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${body.slice(0, 120)}`);
      }
      onSent(email);
    } catch (err) {
      console.error('[quiz] send failed', err);
      setSendError('Nie udało się wysłać raportu. Spróbuj ponownie za chwilę.');
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 flex flex-col gap-4"
      noValidate
    >
      <div>
        <h3 className="text-lg font-bold mb-1 inline-flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-300" />
          Chcesz pełny raport na maila?
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Dostaniesz rozpisane <strong className="text-white">wszystkie pytania</strong>:
          które trafiłeś, w czym byłeś blisko — z poprawnymi odpowiedziami, do nauki.
        </p>
      </div>

      <div>
        <label htmlFor="quiz-email" className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1.5">
          Twój e-mail
        </label>
        <input
          id="quiz-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ty@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 text-sm transition-colors"
        />
        {emailError && <p className="text-xs text-red-400 mt-1.5">{emailError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={rodo}
            onChange={(e) => setRodo(e.target.checked)}
            className="mt-1 w-4 h-4 accent-purple-500"
          />
          <span className="text-sm">
            <strong className="block text-white font-medium">
              Zgoda na przetwarzanie e-maila i kontakt
            </strong>
            <span className="block text-xs text-gray-400 leading-relaxed mt-0.5">
              Twój adres trafia tylko do AI Possibilities Lab — wyłącznie żeby wysłać raport
              i ewentualnie skontaktować się w sprawie wydarzeń koła. W każdej chwili możesz
              wycofać zgodę pisząc na lab@possibilitieslab.org.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-1 w-4 h-4 accent-purple-500"
          />
          <span className="text-sm">
            <strong className="block text-white font-medium">
              Zapisz mnie do newslettera (opcjonalnie)
            </strong>
            <span className="block text-xs text-gray-400 leading-relaxed mt-0.5">
              Rzadki, sensowny e-mail o eventach, projektach koła i nowych quizach.
            </span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm uppercase tracking-widest transition-colors"
      >
        {sending ? (
          'Wysyłam…'
        ) : (
          <>
            <Send className="w-4 h-4" />
            Wyślij pełny raport
          </>
        )}
      </button>
      {sendError && <p className="text-xs text-red-400">{sendError}</p>}
    </form>
  );
}

// ───────────────────────────── thanks ─────────────────────────────

function Thanks({ email, onReplay }: { email: string; onReplay: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <div className="inline-flex w-20 h-20 rounded-full bg-green-500/15 border border-green-500/40 items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">WYSŁANE!</h2>
      <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
        Pełny raport poleciał na <strong className="text-white">{email}</strong>.
        Jeśli nie zobaczysz go w ciągu kilku minut — zerknij do spamu.
      </p>
      <div className="flex justify-center gap-3 mt-8">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold uppercase tracking-widest text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Zagraj ponownie
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs"
        >
          Strona główna
        </Link>
      </div>
    </motion.section>
  );
}

