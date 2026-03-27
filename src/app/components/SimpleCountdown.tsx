import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';
import {
  SITE_LAUNCH,
  PREP_BASE_UNLOCK,
  HACKATHON_START,
  HACKATHON_END,
  getGlobalProgress,
  getHackathonStatus
} from '@/utils/hackathonPhases';

export function SimpleCountdown() {
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
  const overallProgress = getGlobalProgress(currentTime);

  const milestones = [
    { date: SITE_LAUNCH, label: 'Start', desc: 'Dołącz do oficjalnego otwarcia!' },
    { date: PREP_BASE_UNLOCK, label: 'Baza', desc: 'Sprawdź bazę wiedzy i materiały!' },
    { date: HACKATHON_START, label: 'Live', desc: 'Rozpocznij 24h intensywnego kodowania!' },
    { date: HACKATHON_END, label: 'Meta', desc: 'Zobacz prezentacje i wielki finał!' }
  ];

  // Strictly linear position
  const getLinearPosition = (date: Date) => {
    const start = SITE_LAUNCH.getTime();
    const end = HACKATHON_END.getTime();
    return Math.min(Math.max(((date.getTime() - start) / (end - start)) * 100, 0), 100);
  };

  const renderCountdown = () => {
    let targetDate: Date;
    let message: string;
    let icon: React.ReactNode;
    let progressColor: string;

    switch (phase) {
      case 'before': // Special case for before SITE_LAUNCH
        targetDate = SITE_LAUNCH;
        message = 'Do startu wydarzenia';
        icon = <Calendar className="w-5 h-5" />;
        progressColor = 'from-gray-500 to-gray-400';
        break;
      case 'waiting': // Added for robustness if status logic differs
      case 'recruitment': // Should align with 'before' in getHackathonStatus if before start
        targetDate = PREP_BASE_UNLOCK;
        message = 'Do bazy wiedzy';
        icon = <Calendar className="w-5 h-5" />;
        progressColor = 'from-purple-500 to-cyan-500';
        break;
      case 'preparation':
        targetDate = HACKATHON_START;
        message = 'Do startu 24h';
        icon = <Clock className="w-5 h-5" />;
        progressColor = 'from-cyan-500 to-blue-500';
        break;
      case 'hackathon':
      case 'during':
        targetDate = HACKATHON_END;
        message = 'Do oddania projektów';
        icon = <Zap className="w-5 h-5" />;
        progressColor = 'from-red-500 to-orange-500';
        break;
      default:
        return (
          <div className="text-center py-4">
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">HACKATHON ZAKOŃCZONY!</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/timer" className="px-6 py-2 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-xl transition-all border border-white/10 text-xs font-bold uppercase tracking-widest">
                Wyniki i projekty
              </Link>
              <Link to="/feedback" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Wypełnij ankietę
              </Link>
            </div>
          </div>
        );
    }

    const timeRemaining = getTimeRemaining(targetDate);
    if (!timeRemaining) return null;

    return (
      <>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-indigo-300 font-bold uppercase tracking-[0.25em] text-[11px]">
            <div className="animate-pulse bg-indigo-500/20 p-1.5 rounded-lg">{icon}</div>
            <span>{message}</span>
          </div>

          <div className="flex gap-4 md:gap-8 justify-center">
            {[
              { v: timeRemaining.days, l: 'dni' },
              { v: timeRemaining.hours, l: 'godz' },
              { v: timeRemaining.minutes, l: 'min' },
              { v: timeRemaining.seconds, l: 'sek' }
            ]
            .filter(t => t.l !== 'dni' || t.v > 0)
            .map((t, i) => (
              <div key={i} className="flex flex-col items-center min-w-[80px] relative group/num">
                <div className="absolute inset-0 bg-white/5 rounded-2xl scale-110 opacity-0 group-hover/num:opacity-100 transition-opacity duration-500" />
                <motion.div 
                  className={`text-4xl md:text-5xl font-black text-white bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent drop-shadow-2xl relative z-10`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={t.v}
                >
                  {String(t.v).padStart(2, '0')}
                </motion.div>
                <div className="text-[9px] text-indigo-300 font-black uppercase tracking-[0.3em] mt-2 relative z-10 opacity-80">{t.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative pt-6 pb-2">
          <div className="relative h-1 bg-white/5 rounded-full overflow-visible">
            <motion.div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${progressColor} rounded-full z-10 shadow-[0_0_25px_rgba(34,211,238,0.5)]`}
              style={{ width: `${overallProgress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full z-20 shadow-[0_0_20px_#fff]"
              style={{ left: `${overallProgress}%` }}
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {milestones.map((ms, idx) => {
              const pos = getLinearPosition(ms.date);
              const isReached = currentTime >= ms.date;
              
              return (
                <div 
                  key={idx} 
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/tooltip z-30"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute bottom-full mb-6 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none w-48 z-50 translate-y-2 group-hover/tooltip:translate-y-0">
                    <div className="bg-indigo-950/95 border border-white/20 p-4 rounded-xl backdrop-blur-2xl shadow-2xl text-[12px]">
                      <p className="font-black text-white mb-1 uppercase tracking-widest text-cyan-400">{ms.label}</p>
                      <p className="text-gray-300 leading-snug">{ms.desc}</p>
                      <p className="text-[10px] text-gray-500 mt-2 font-mono">{ms.date.toLocaleDateString('pl-PL')}</p>
                    </div>
                  </div>

                  <motion.div 
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-all duration-500",
                      isReached ? "bg-white border-cyan-400 shadow-[0_0_10px_#fff]" : "bg-indigo-950 border-white/20"
                    )}
                    whileHover={{ scale: 1.5, borderColor: '#22d3ee' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <Link to="/timer" className="block">
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.2)' }}
        className="max-w-3xl mx-auto relative p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl overflow-visible transition-all duration-300 cursor-pointer group/container"
        style={{
          background: 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.2), transparent), radial-gradient(circle at bottom right, rgba(165, 180, 252, 0.1), transparent)',
          backdropFilter: 'blur(30px)'
        }}
      >
        <div className="absolute inset-0 bg-indigo-900/10 z-0 rounded-3xl group-hover/container:bg-indigo-900/20 transition-colors duration-300" />
        <div className="relative z-10">
          {renderCountdown()}
        </div>
      </motion.div>
    </Link>
  );
}
