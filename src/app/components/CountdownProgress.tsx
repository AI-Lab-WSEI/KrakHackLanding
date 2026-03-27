import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { cn } from '@/app/components/ui/utils';
import {
  SITE_LAUNCH,
  PREP_BASE_UNLOCK,
  HACKATHON_START,
  HACKATHON_END,
  getGlobalProgress,
  getHackathonStatus
} from '@/utils/hackathonPhases';

interface CountdownProgressProps {
  variant?: 'main' | 'task';
  taskType?: 'preparation' | 'tasks';
}

export function CountdownProgress({ variant = 'main' }: CountdownProgressProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - currentTime.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const phase = getHackathonStatus(currentTime);
  const progress = getGlobalProgress(currentTime);

  const renderCountdown = () => {
    let targetDate: Date;
    let message: string;
    let icon: React.ReactNode;

    switch (phase) {
      case 'before':
      case 'waiting':
        targetDate = PREP_BASE_UNLOCK;
        message = 'Do odblokowania materiałów przygotowawczych';
        icon = <Calendar className="w-5 h-5" />;
        break;
      case 'preparation':
        targetDate = HACKATHON_START;
        message = 'Do rozpoczęcia hackathonu';
        icon = <Clock className="w-5 h-5" />;
        break;
      case 'hackathon':
      case 'during':
        targetDate = HACKATHON_END;
        message = 'Do końca hackathonu';
        icon = <Clock className="w-5 h-5 text-red-400" />;
        break;
      default:
        return (
          <div className="text-center py-12">
            <div className="text-3xl font-bold mb-4">🎉 Hackathon zakończony!</div>
            <p className="text-muted-foreground">Dziękujemy za udział w AI Krak Hack 2026!</p>
          </div>
        );
    }

    const timeRemaining = getTimeRemaining(targetDate);
    if (!timeRemaining) return null;

    return (
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="text-cyan-400">{icon}</div>
          <p className="text-lg md:text-xl font-semibold text-foreground">{message}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { value: timeRemaining.days, label: 'dni', color: 'from-purple-500 to-purple-600' },
            { value: timeRemaining.hours.toString().padStart(2, '0'), label: 'godz', color: 'from-cyan-500 to-cyan-600' },
            { value: timeRemaining.minutes.toString().padStart(2, '0'), label: 'min', color: 'from-blue-500 to-blue-600' },
            { value: timeRemaining.seconds.toString().padStart(2, '0'), label: 'sek', color: 'from-fuchsia-500 to-fuchsia-600' }
          ].map((time, index) => (
            <motion.div
              key={index}
              className="bg-card border border-border rounded-2xl p-4 text-center hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn(
                "text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent",
                time.color
              )}>
                {time.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                {time.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const getLinearPosition = (date: Date) => {
    const start = SITE_LAUNCH.getTime();
    const end = HACKATHON_END.getTime();
    return Math.min(Math.max(((date.getTime() - start) / (end - start)) * 100, 0), 100);
  };

  const renderProgressSection = () => {
    const milestones = [
      {
        position: getLinearPosition(PREP_BASE_UNLOCK),
        label: 'Materiały przygotowawcze',
        date: PREP_BASE_UNLOCK.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        active: currentTime >= PREP_BASE_UNLOCK,
        icon: '📚'
      },
      {
        position: getLinearPosition(HACKATHON_START),
        label: 'Start hackathonu',
        date: HACKATHON_START.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        active: phase === 'hackathon' || phase === 'during' || currentTime >= HACKATHON_START,
        icon: '🚀'
      }
    ];

    return (
      <div className="space-y-8">
        {/* Main Progress Bar */}
        <div className="relative">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Postęp do hackathonu</span>
              <span className="text-sm font-bold text-foreground">{progress.toFixed(1)}%</span>
            </div>

            <Progress
              value={progress}
              className="h-4 bg-muted/30"
            />

            {/* Custom progress indicator consumed by Progress component above, but we keep the visual enhancement */}
            <div className="absolute top-8 left-0 right-0 h-4 rounded-full overflow-hidden bg-muted/30 pointer-events-none">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 relative"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]" />
              </motion.div>
            </div>
          </div>

          {/* Milestones */}
          <div className="relative h-20">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${milestone.position}%` }}
              >
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                >
                  {/* Milestone Circle */}
                  <motion.div
                    className={cn(
                      "w-8 h-8 rounded-full border-4 flex items-center justify-center text-lg mb-3 relative z-10",
                      milestone.active
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-white shadow-lg"
                        : "bg-muted border-muted-foreground/30"
                    )}
                    animate={milestone.active ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: milestone.active ? Infinity : 0 }}
                  >
                    <span className={milestone.active ? "text-white" : "text-muted-foreground"}>
                      {milestone.icon}
                    </span>
                  </motion.div>

                  {/* Milestone Info */}
                  <div className="text-center min-w-[120px]">
                    <div className={cn(
                      "font-semibold text-sm mb-1",
                      milestone.active ? "text-cyan-400" : "text-muted-foreground"
                    )}>
                      {milestone.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.date}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDuringHackathon = () => {
    if (phase !== 'hackathon' && phase !== 'during') return null;

    const elapsed = currentTime.getTime() - HACKATHON_START.getTime();
    const totalDuration = HACKATHON_END.getTime() - HACKATHON_START.getTime();
    const hackathonProgress = (elapsed / totalDuration) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl"
      >
        <h3 className="text-xl font-bold text-red-400 mb-4 text-center flex items-center justify-center gap-2">
          🔥 Hackathon w trakcie!
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Postęp hackathonu</span>
            <span className="text-foreground font-bold">{hackathonProgress.toFixed(1)}%</span>
          </div>

          <Progress
            value={hackathonProgress}
            className="h-3 bg-red-900/30"
          />

          <div className="text-center">
            <p className="text-orange-400 font-semibold">⚡ Kodowanie na pełnych obrotach!</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl",
        variant === 'main' ? 'py-12 px-8 mx-auto max-w-5xl' : 'p-6 max-w-2xl mx-auto'
      )}
    >
      {variant === 'main' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Odliczanie do AI Krak Hack
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Śledź postęp przygotowań i bądź gotowy na największe wyzwanie AI w Krakowie
          </p>
        </motion.div>
      )}

      <div className="space-y-12">
        {renderProgressSection()}
        {renderCountdown()}
        {renderDuringHackathon()}

        {variant === 'main' && phase === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 p-8 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl"
          >
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              📋 Materiały przygotowawcze wkrótce dostępne
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tydzień przed hackathonem (20 marca o 18:00) odblokowamy materiały przygotowawcze do zadań.
              Będziesz mógł pobrać dokumenty PDF z opisami zadań i danymi startowymi.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}