import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Clock, Calendar, Zap, Coffee, Plus, Trash2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { cn } from '@/app/components/ui/utils';
import {
  phases,
  getCurrentPhase,
  getPhaseStartTime,
  formatTime,
  getOverallProgress,
  getHackathonStatus,
  HACKATHON_START,
  HACKATHON_END,
  type Phase
} from '@/utils/hackathonPhases';
import {
  sprints,
  calculateSprintState,
  breakSuggestions,
  getBreakReminder
} from '@/utils/sprintConfig';

interface Milestone {
  id: string;
  name: string;
  targetTime: Date;
  completed: boolean;
}

interface StorageState {
  completedTasks: Record<number, number[]>;
  milestones: Array<{
    id: string;
    name: string;
    targetTime: string;
    completed: boolean;
  }>;
}

const STORAGE_KEY = 'hackathon-timer-state-v2';

export function HackathonTimer() {
  const [now, setNow] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState<Record<number, number[]>>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneHour, setNewMilestoneHour] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());

  // Load state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StorageState = JSON.parse(stored);
        setCompletedTasks(data.completedTasks || {});
        setMilestones((data.milestones || []).map(m => ({
          ...m,
          targetTime: new Date(m.targetTime)
        })));
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const data: StorageState = {
      completedTasks,
      milestones: milestones.map(m => ({
        ...m,
        targetTime: m.targetTime.toISOString()
      }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [completedTasks, milestones]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const status = getHackathonStatus(now);
  const phaseState = getCurrentPhase(now);
  const overallProgress = getOverallProgress(now);
  const elapsed = now.getTime() - HACKATHON_START.getTime();
  const breakReminder = status === 'during' ? getBreakReminder(elapsed) : null;

  // Sprint state (only for Phase 3)
  const sprintState = phaseState.currentPhase?.id === 3 && status === 'during'
    ? calculateSprintState(getPhaseStartTime(2), now)
    : null;

  // Auto-expand current phase
  useEffect(() => {
    if (phaseState.currentPhase) {
      setExpandedPhases(prev => new Set(prev).add(phaseState.currentPhase!.id));
    }
  }, [phaseState.currentPhase?.id]);

  const toggleTask = (phaseId: number, taskIndex: number) => {
    setCompletedTasks(prev => {
      const phaseTasks = prev[phaseId] || [];
      const newTasks = phaseTasks.includes(taskIndex)
        ? phaseTasks.filter(i => i !== taskIndex)
        : [...phaseTasks, taskIndex];
      return { ...prev, [phaseId]: newTasks };
    });
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const addMilestone = () => {
    if (!newMilestoneName.trim() || !newMilestoneHour) return;
    
    const hour = parseFloat(newMilestoneHour);
    if (isNaN(hour) || hour < 0 || hour > 24) return;

    const targetTime = new Date(HACKATHON_START.getTime() + hour * 60 * 60 * 1000);
    
    setMilestones(prev => [...prev, {
      id: `milestone-${Date.now()}`,
      name: newMilestoneName.trim(),
      targetTime,
      completed: false
    }]);

    setNewMilestoneName('');
    setNewMilestoneHour('');
  };

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m =>
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const sortedMilestones = [...milestones].sort((a, b) =>
    a.targetTime.getTime() - b.targetTime.getTime()
  );

  const nextMilestone = sortedMilestones.find(m => !m.completed && m.targetTime > now);
  const completedMilestonesCount = milestones.filter(m => m.completed).length;
  const milestonesProgress = milestones.length > 0
    ? (completedMilestonesCount / milestones.length) * 100
    : 0;

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Background Image - Dark Purple Futuristic */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1762278804729-13d330fad71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkYXJrJTIwcHVycGxlJTIwZnV0dXJpc3RpYyUyMHRlY2hub2xvZ3klMjBhYnN0cmFjdCUyMG5lb258ZW58MXx8fHwxNzcwMTUxNDYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-indigo-950/40 to-black/90"></div>
      </div>

      {/* Animated gradient overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-full h-full bg-purple-600/20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-full h-full bg-cyan-600/15 blur-[120px] rounded-full"
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <header className="pt-12 pb-8">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-12 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Strona Główna</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <motion.img 
                src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770832103/ai-krak-hack-central_frj1yg.svg"
                alt="AI Krak Hack 2026"
                className="w-full max-w-3xl h-auto opacity-90 mb-10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-6"></div>
              <p className="text-lg text-indigo-200/60 font-black uppercase tracking-[0.4em] text-center max-w-2xl mx-auto">
                24H LIVE TRACKER • HACKATHON DASHBOARD
              </p>
            </motion.div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 pb-32 max-w-7xl">
          {status === 'before' && (
            <BeforeHackathon now={now} />
          )}

          {status === 'during' && (
            <DuringHackathon
              now={now}
              phaseState={phaseState}
              overallProgress={overallProgress}
              breakReminder={breakReminder}
              sprintState={sprintState}
              completedTasks={completedTasks}
              toggleTask={toggleTask}
              expandedPhases={expandedPhases}
              togglePhase={togglePhase}
              milestones={sortedMilestones}
              nextMilestone={nextMilestone}
              milestonesProgress={milestonesProgress}
              completedMilestonesCount={completedMilestonesCount}
              toggleMilestone={toggleMilestone}
              deleteMilestone={deleteMilestone}
              newMilestoneName={newMilestoneName}
              setNewMilestoneName={setNewMilestoneName}
              newMilestoneHour={newMilestoneHour}
              setNewMilestoneHour={setNewMilestoneHour}
              addMilestone={addMilestone}
            />
          )}

          {status === 'after' && (
            <AfterHackathon
              now={now}
              completedTasks={completedTasks}
              toggleTask={toggleTask}
              expandedPhases={expandedPhases}
              togglePhase={togglePhase}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Component for before hackathon starts
function BeforeHackathon({ now }: { now: Date }) {
  const timeRemaining = formatTime(HACKATHON_START.getTime() - now.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8 opacity-60 backdrop-blur-sm p-12 rounded-3xl border border-white/5 bg-white/5"
    >
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
        <Calendar className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Oczekiwanie na start</span>
      </div>

      <CountdownDisplay
        time={timeRemaining}
        variant="large"
        colorClass="from-gray-400 to-gray-600"
      />

      <p className="text-gray-500 text-lg font-medium uppercase tracking-[0.2em]">
        Wydarzenie rozpocznie się {HACKATHON_START.toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </motion.div>
  );
}

// Component for after hackathon ends
function AfterHackathon({
  now,
  completedTasks,
  toggleTask,
  expandedPhases,
  togglePhase
}: {
  now: Date;
  completedTasks: Record<number, number[]>;
  toggleTask: (phaseId: number, taskIndex: number) => void;
  expandedPhases: Set<number>;
  togglePhase: (phaseId: number) => void;
}) {
  const timeSinceEnd = formatTime(now.getTime() - HACKATHON_END.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 opacity-80"
    >
      <div className="text-center space-y-8 py-12 backdrop-blur-md bg-white/5 border border-white/5 rounded-3xl p-12">
        <div className="text-6xl mb-4 grayscale opacity-50">🏆</div>
        <h2 className="text-4xl font-black text-gray-400 uppercase tracking-widest">HACKATHON ZAKOŃCZONY</h2>
        
        <div className="space-y-4">
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm">Czas od zakończenia wydarzenia:</p>
          <CountdownDisplay
            time={timeSinceEnd}
            variant="small"
            colorClass="from-gray-500 to-gray-700"
          />
        </div>
      </div>

      <div className="space-y-6 grayscale">
        <h3 className="text-2xl font-black text-gray-500 uppercase tracking-widest text-center">Archiwum Faz</h3>
        {phases.map((phase, index) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            phaseIndex={index}
            isActive={false}
            isCompleted={true}
            progress={100}
            timeRemaining={0}
            completedTasks={completedTasks[phase.id] || []}
            toggleTask={toggleTask}
            isExpanded={expandedPhases.has(phase.id)}
            toggleExpanded={togglePhase}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Countdown Display Component
interface CountdownDisplayProps {
  time: { days: number; hours: number; minutes: number; seconds: number };
  variant: 'large' | 'small';
  colorClass: string;
  urgent?: boolean;
}

function CountdownDisplay({ time, variant, colorClass, urgent }: CountdownDisplayProps) {
  const isLarge = variant === 'large';
  const showDays = time.days > 0;

  const timeUnits = showDays
    ? [
        { value: time.days, label: 'dni' },
        { value: time.hours, label: 'godz' },
        { value: time.minutes, label: 'min' },
        { value: time.seconds, label: 'sek' }
      ]
    : [
        { value: time.hours, label: 'godz' },
        { value: time.minutes, label: 'min' },
        { value: time.seconds, label: 'sek' }
      ];

  return (
    <div className={cn(
      "grid gap-4 md:gap-6",
      showDays ? "grid-cols-4" : "grid-cols-3",
      isLarge ? "max-w-4xl mx-auto" : "max-w-2xl"
    )}>
      {timeUnits.map((unit, index) => (
        <motion.div
          key={index}
          className={cn(
            "rounded-2xl border backdrop-blur-xl text-center flex flex-col items-center justify-center transition-all duration-500",
            isLarge ? "p-8 md:p-12 aspect-square md:aspect-auto" : "p-6",
            urgent
              ? "bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : "bg-white/5 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-white/10"
          )}
          animate={urgent ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className={cn(
            "font-black mb-2 bg-gradient-to-b bg-clip-text text-transparent drop-shadow-2xl",
            isLarge ? "text-6xl md:text-8xl" : "text-4xl md:text-5xl",
            urgent ? "from-red-400 to-orange-500" : colorClass
          )}>
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className={cn(
            "text-indigo-200/50 uppercase font-black tracking-[0.3em]",
            isLarge ? "text-base" : "text-xs"
          )}>
            {unit.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// During Hackathon Component (will be continued in next part)

// During Hackathon Component
function DuringHackathon({
  now,
  phaseState,
  overallProgress,
  breakReminder,
  sprintState,
  completedTasks,
  toggleTask,
  expandedPhases,
  togglePhase,
  milestones,
  nextMilestone,
  milestonesProgress,
  completedMilestonesCount,
  toggleMilestone,
  deleteMilestone,
  newMilestoneName,
  setNewMilestoneName,
  newMilestoneHour,
  setNewMilestoneHour,
  addMilestone
}: any) {
  const timeRemaining = formatTime(HACKATHON_END.getTime() - now.getTime());
  const isUrgent = HACKATHON_END.getTime() - now.getTime() < 60 * 60 * 1000; // < 1 hour

  return (
    <div className="space-y-8">
      {/* Main Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Czas pozostały</h2>
        <CountdownDisplay
          time={timeRemaining}
          variant="large"
          colorClass="from-cyan-500 to-blue-500"
          urgent={isUrgent}
        />
      </motion.div>

      {/* Mission Control Map (Progress & Timeline) */}
      <MissionControlMap progress={overallProgress} phaseState={phaseState} />

      {/* Break Reminder */}
      {breakReminder && <BreakReminderCard reminder={breakReminder} now={now} />}

      {/* Current Phase Highlight */}
      {phaseState.currentPhase && (
        <CurrentPhaseHighlight phaseState={phaseState} />
      )}

      {/* Sprint Tracker (Phase 3 only) */}
      {sprintState && <SprintTracker sprintState={sprintState} />}

      {/* Milestone Tracker */}
      <MilestoneTracker
        milestones={milestones}
        nextMilestone={nextMilestone}
        milestonesProgress={milestonesProgress}
        completedMilestonesCount={completedMilestonesCount}
        toggleMilestone={toggleMilestone}
        deleteMilestone={deleteMilestone}
        newMilestoneName={newMilestoneName}
        setNewMilestoneName={setNewMilestoneName}
        newMilestoneHour={newMilestoneHour}
        setNewMilestoneHour={setNewMilestoneHour}
        addMilestone={addMilestone}
        now={now}
      />

      {/* Phase Cards */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Fazy Hackathonu</h3>
        {phases.map((phase, index) => {
          const isActive = phaseState.currentPhase?.id === phase.id;
          const isCompleted = index < phaseState.phaseIndex;
          const progress = isActive ? phaseState.phaseProgress : (isCompleted ? 100 : 0);

          return (
            <PhaseCard
              key={phase.id}
              phase={phase}
              phaseIndex={index}
              isActive={isActive}
              isCompleted={isCompleted}
              progress={progress}
              timeRemaining={isActive ? phaseState.phaseTimeRemaining : 0}
              completedTasks={completedTasks[phase.id] || []}
              toggleTask={toggleTask}
              isExpanded={expandedPhases.has(phase.id)}
              toggleExpanded={togglePhase}
            />
          );
        })}
      </div>

      {/* Break Suggestions */}
      <BreakSuggestionsList />
    </div>
  );
}

// Unified Mission Control Map (Combines Overall Progress & Timeline)
function MissionControlMap({ progress, phaseState, now }: any) {
  const isBefore = getHackathonStatus(now) === 'before';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative cursor-pointer group"
      onClick={() => {
        const el = document.getElementById(`phase-${phaseState.currentPhase?.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Dynamic Background Glow based on current phase */}
      <div 
        className="absolute inset-0 opacity-10 transition-all duration-1000"
        style={{ 
          background: `radial-gradient(circle at ${progress}%, ${phaseState.currentPhase?.color || '#000'}40, transparent 70%)` 
        }} 
      />

      <div className="relative z-10 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Mapa Misji</h3>
            <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">
              {isBefore ? "Cisza przed burzą" : "Systemy monitorowania aktywne"}
            </p>
          </div>
          <div className="text-right self-end md:self-auto">
            <span className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              {isBefore ? "0.0" : progress.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Segmented Progress Track */}
        <div className="space-y-10">
          <div className="relative flex gap-2 h-10 items-end">
            {phases.map((phase, index) => {
              const isActive = phaseState.currentPhase?.id === phase.id;
              const isCompleted = index < phaseState.phaseIndex;
              const phaseProgress = isBefore ? 0 : (isActive ? phaseState.phaseProgress : (isCompleted ? 100 : 0));

              return (
                <div
                  key={phase.id}
                  className="h-full rounded-2xl transition-all duration-500 relative flex-1 border border-white/5 bg-white/[0.02] overflow-hidden group/segment"
                >
                  {/* Phase Fill */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${phaseProgress}%` }}
                    className={cn(
                      "h-full rounded-2xl relative",
                      isActive && "shadow-[0_0_30px_white/20]"
                    )}
                    style={{ 
                      backgroundColor: phase.color,
                      opacity: isActive ? 1 : (isCompleted ? 0.8 : 0.2)
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
                    )}
                  </motion.div>
                  
                  {/* Hover Indicator */}
                  <div className="absolute inset-0 border-2 border-white/20 opacity-0 group-hover/segment:opacity-100 transition-opacity rounded-2xl" />
                </div>
              );
            })}

            {/* Pulsing Live Marker (only if hackathon started) */}
            {!isBefore && (
              <motion.div 
                className="absolute -top-4 bottom-0 w-[2px] bg-white shadow-[0_0_20px_white] z-20 pointer-events-none"
                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-[10px] font-black rounded-full whitespace-nowrap shadow-2xl">LIVE</div>
              </motion.div>
            )}
          </div>

          {/* Phase Labels / Milestones */}
          <div className="grid grid-cols-5 gap-6">
            {phases.map((phase) => {
              const isActive = phaseState.currentPhase?.id === phase.id;

              return (
                <div key={phase.id} className="space-y-4 group/label">
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                        "w-4 h-4 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-500",
                        isActive ? "scale-125 bg-white text-black" : "bg-white/5 text-white/30"
                      )}
                      style={isActive ? { backgroundColor: phase.color, color: 'white', boxShadow: `0 0 15px ${phase.color}` } : {}}
                    >
                      {phase.id}
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                      isActive ? "text-cyan-400" : "text-gray-600"
                    )}>
                      PHASE {phase.id}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className={cn(
                      "text-sm font-black transition-all duration-500 uppercase tracking-wider",
                      isActive ? "text-white" : "text-gray-500"
                    )}>
                      {phase.name}
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock className="w-3 h-3 text-gray-700" />
                       <span className="text-[10px] text-gray-700 font-bold">{phase.duration}m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Break Reminder Card
function BreakReminderCard({ reminder, now }: { reminder: any, now: Date }) {
  const currentHour = now.getHours();
  const isNightShift = currentHour >= 20 || currentHour < 4;

  const colors: Record<string, string> = {
    low: 'bg-white/5 border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    medium: 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_25px_rgba(249,115,22,0.2)]',
    high: 'bg-red-500/15 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.3)]'
  };

  const icons: Record<string, React.ReactNode> = {
    low: <Coffee className="w-6 h-6" />,
    medium: <Zap className="w-6 h-6" />,
    high: <AlertCircle className="w-6 h-6 animate-pulse" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        "border rounded-[2.5rem] p-8 backdrop-blur-2xl transition-all duration-500 relative overflow-hidden",
        colors[reminder.urgency],
        isNightShift && "border-cyan-500/40"
      )}
    >
      {isNightShift && (
        <div className="absolute top-0 right-0 px-4 py-1 bg-cyan-500/20 border-b border-l border-cyan-500/30 rounded-bl-xl">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Insisted Mode • Night Shift</span>
        </div>
      )}

      <div className="flex items-center gap-6">
        <motion.div 
          animate={reminder.urgency === 'high' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className={cn(
            "p-5 rounded-2xl",
            reminder.urgency === 'high' ? "bg-red-500/20 text-red-400" : (isNightShift ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400")
          )}
        >
          {icons[reminder.urgency]}
        </motion.div>
        <div className="flex-1">
          <h4 className="font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
            {isNightShift ? "ALERTY NOCNE" : "PRZERWA REKOMENDOWANA"}
            {isNightShift && <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />}
          </h4>
          <p className={cn(
            "text-xl font-bold leading-relaxed",
            isNightShift ? "text-cyan-100" : "text-gray-300"
          )}>
            {isNightShift ? `🌙 ${reminder.message.replace('.', '!')} Wstań, rusz się!` : reminder.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


// Current Phase Highlight
function CurrentPhaseHighlight({ phaseState }: any) {
  const phase = phaseState.currentPhase;
  const timeRemaining = formatTime(phaseState.phaseTimeRemaining);
  const isUrgent = phaseState.phaseTimeRemaining < 10 * 60 * 1000; // < 10 minutes

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-2 rounded-xl p-6 shadow-2xl"
      style={{
        borderColor: phase.color,
        boxShadow: `0 0 30px ${phase.color}40`
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: phase.color }}
        >
          {phase.id}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{phase.name}</h3>
          <p className="text-gray-400">Aktualna faza</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Pozostały czas fazy:</p>
          <CountdownDisplay
            time={timeRemaining}
            variant="small"
            colorClass="from-cyan-400 to-blue-400"
            urgent={isUrgent}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Sprint Tracker
function SprintTracker({ sprintState }: any) {
  const currentSprint = sprintState.currentSprint;
  const timeRemaining = formatTime(sprintState.sprintTimeRemaining);
  const isUrgent = sprintState.sprintTimeRemaining < 60 * 1000; // < 1 minute

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-emerald-400" />
        System Sprintów Pomodoro
      </h3>

      {/* Overall Sprint Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Postęp wszystkich sprintów</span>
          <span className="text-sm font-bold text-emerald-400">
            {sprintState.totalSprintsProgress.toFixed(1)}%
          </span>
        </div>
        <Progress value={sprintState.totalSprintsProgress} className="h-2" />
      </div>

      {/* Current Sprint/Break */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-white mb-1">
              {sprintState.isBreak ? 'Break Time' : currentSprint.name}
            </h4>
            <p className="text-sm text-gray-400">
              Sprint {sprintState.sprintIndex + 1} / {sprints.length}
            </p>
          </div>
          {sprintState.isBreak && (
            <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
              <span className="text-orange-400 text-sm font-medium">Przerwa</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <CountdownDisplay
            time={timeRemaining}
            variant="small"
            colorClass={sprintState.isBreak ? "from-orange-400 to-amber-400" : "from-emerald-400 to-green-400"}
            urgent={isUrgent}
          />

          <div>
            <Progress
              value={sprintState.sprintProgress}
              className="h-3"
            />
          </div>

          {sprintState.isBreak && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-orange-300 text-sm">
                {currentSprint.breakDuration <= 10 && "Quick stretch & eye rest"}
                {currentSprint.breakDuration > 10 && currentSprint.breakDuration <= 20 && "Walk around, grab water/snacks"}
                {currentSprint.breakDuration > 20 && currentSprint.breakDuration <= 30 && "Meal break - eat properly!"}
                {currentSprint.breakDuration > 30 && "Long rest - recharge completely"}
              </p>
            </div>
          )}
        </div>

        {sprintState.nextSprintName && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Następny: <span className="text-white font-medium">{sprintState.nextSprintName}</span>
            </p>
          </div>
        )}
      </div>

      {/* Sprint Timeline */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Oś sprintów</p>
        <div className="flex flex-wrap gap-2">
          {sprints.map((sprint, index) => {
            const isCurrent = index === sprintState.sprintIndex;
            const isCompleted = index < sprintState.sprintIndex;
            const isLongBreak = sprint.type === 'longBreak';

            return (
              <div
                key={sprint.id}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                  isCurrent && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-900",
                  isCompleted && "bg-emerald-500 text-white",
                  !isCompleted && !isCurrent && "bg-gray-700 text-gray-400",
                  isCurrent && !isLongBreak && "bg-emerald-500/50 text-emerald-300",
                  isCurrent && isLongBreak && "bg-orange-500/50 text-orange-300",
                  isLongBreak && !isCurrent && !isCompleted && "bg-orange-500/20 text-orange-400"
                )}
              >
                {isLongBreak ? <Coffee className="w-4 h-4" /> : `S${sprint.id}`}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Milestone Tracker
function MilestoneTracker({
  milestones,
  nextMilestone,
  milestonesProgress,
  completedMilestonesCount,
  toggleMilestone,
  deleteMilestone,
  newMilestoneName,
  setNewMilestoneName,
  newMilestoneHour,
  setNewMilestoneHour,
  addMilestone,
  now
}: any) {
  const nextMilestoneTimeRemaining = nextMilestone
    ? formatTime(nextMilestone.targetTime.getTime() - now.getTime())
    : null;
  const isNextMilestoneUrgent = nextMilestone
    ? nextMilestone.targetTime.getTime() - now.getTime() < 30 * 60 * 1000
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6">Custom Milestones</h3>

      {/* Milestone Progress */}
      {milestones.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Postęp milestone'ów</span>
            <span className="text-sm font-bold text-cyan-400">
              {completedMilestonesCount} / {milestones.length}
            </span>
          </div>
          <Progress value={milestonesProgress} className="h-2" />
        </div>
      )}

      {/* Next Milestone Countdown */}
      {nextMilestone && nextMilestoneTimeRemaining && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h4 className="font-semibold text-white">Następny milestone</h4>
          </div>
          <p className="text-cyan-300 mb-3">{nextMilestone.name}</p>
          <CountdownDisplay
            time={nextMilestoneTimeRemaining}
            variant="small"
            colorClass="from-cyan-400 to-blue-400"
            urgent={isNextMilestoneUrgent}
          />
        </div>
      )}

      {/* Milestone List */}
      {milestones.length > 0 && (
        <div className="space-y-2 mb-6">
          {milestones.map((milestone: Milestone) => {
            const hoursSinceStart = (milestone.targetTime.getTime() - HACKATHON_START.getTime()) / (1000 * 60 * 60);
            const isOverdue = milestone.targetTime < now && !milestone.completed;

            return (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  milestone.completed && "bg-green-500/10 border-green-500/30",
                  isOverdue && "bg-red-500/10 border-red-500/30",
                  !milestone.completed && !isOverdue && "bg-gray-700/30 border-gray-600"
                )}
              >
                <button
                  onClick={() => toggleMilestone(milestone.id)}
                  className="flex-shrink-0"
                >
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    milestone.completed && "line-through text-gray-500",
                    !milestone.completed && "text-white"
                  )}>
                    {milestone.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Godzina {hoursSinceStart.toFixed(1)}
                    {isOverdue && <span className="text-red-400 ml-2">Overdue!</span>}
                  </p>
                </div>

                <button
                  onClick={() => deleteMilestone(milestone.id)}
                  className="flex-shrink-0 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Milestone Form */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Dodaj nowy milestone</h4>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newMilestoneName}
            onChange={(e) => setNewMilestoneName(e.target.value)}
            placeholder="Nazwa milestone"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="number"
            value={newMilestoneHour}
            onChange={(e) => setNewMilestoneHour(e.target.value)}
            placeholder="Godzina (0-24)"
            min="0"
            max="24"
            step="0.5"
            className="w-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={addMilestone}
            disabled={!newMilestoneName.trim() || !newMilestoneHour}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Phase Card Component
function PhaseCard({
  phase,
  phaseIndex,
  isActive,
  isCompleted,
  progress,
  timeRemaining,
  completedTasks,
  toggleTask,
  isExpanded,
  toggleExpanded
}: {
  phase: Phase;
  phaseIndex: number;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  timeRemaining: number;
  completedTasks: number[];
  toggleTask: (phaseId: number, taskIndex: number) => void;
  isExpanded: boolean;
  toggleExpanded: (phaseId: number) => void;
}) {
  const time = formatTime(timeRemaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: phaseIndex * 0.1 }}
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-300",
        isActive && "border-2 shadow-2xl",
        isCompleted && "opacity-60",
        !isActive && !isCompleted && "border-gray-700"
      )}
      style={{
        borderColor: isActive ? phase.color : undefined,
        boxShadow: isActive ? `0 0 30px ${phase.color}40` : undefined
      }}
    >
      {/* Header - Always Visible */}
      <div
        onClick={() => toggleExpanded(phase.id)}
        className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Phase Number */}
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0",
                isActive && "ring-2 ring-offset-2 ring-offset-gray-900"
              )}
              style={{
                backgroundColor: isActive || isCompleted ? phase.color : '#4b5563',
                outlineColor: isActive ? phase.color : undefined
              }}
            >
              {isCompleted ? <CheckCircle className="w-6 h-6" /> : phase.id}
            </div>

            {/* Phase Info */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-xl font-bold mb-1",
                  isActive ? "text-white" : "text-gray-400"
                )}
                style={{ color: isActive ? phase.color : undefined }}
              >
                {phase.name}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">{phase.duration} min</span>
                {isActive && timeRemaining > 0 && (
                  <span className="text-cyan-400 font-medium">
                    {time.hours}h {time.minutes}m pozostało
                  </span>
                )}
              </div>
            </div>

            {/* Mini Progress Bar (hidden on mobile) */}
            <div className="hidden md:block w-32">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Expand Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 border-t border-gray-700/50 pt-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-300 leading-relaxed">{phase.description}</p>
          </div>

          {/* Tasks Checklist */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Zadania</h4>
            <div className="space-y-2">
              {phase.tasks.map((task, index) => {
                const isTaskCompleted = completedTasks.includes(index);

                return (
                  <button
                    key={index}
                    onClick={() => toggleTask(phase.id, index)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                      isTaskCompleted
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-gray-700/30 border-gray-600 hover:border-gray-500"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isTaskCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex-1",
                        isTaskCompleted ? "line-through text-gray-500" : "text-gray-300"
                      )}
                    >
                      {task}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pro Tips */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-cyan-400" />
              Pro Tips
            </h4>
            <div className="space-y-2 border-l-2 pl-4" style={{ borderColor: phase.color }}>
              {phase.proTips.map((tip, index) => (
                <p key={index} className="text-gray-300 text-sm leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Break Suggestions List
function BreakSuggestionsList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Coffee className="w-6 h-6 text-orange-400" />
        Sugestie przerw
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:border-orange-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-orange-400">{suggestion.duration}</span>
              <span className="text-xs text-gray-400 uppercase">minut</span>
            </div>
            <p className="text-gray-300 text-sm">{suggestion.activity}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <p className="text-cyan-300 text-sm text-center">
          Regularne przerwy zwiększają produktywność i kreatywność. Zadbaj o swoje zdrowie podczas hackathonu!
        </p>
      </div>
    </motion.div>
  );
}
