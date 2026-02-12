'use client';

import { useState, useEffect } from 'react';
import styles from './CountdownProgress.module.css';

interface CountdownProgressProps {
  variant?: 'main' | 'task';
  taskType?: 'preparation' | 'tasks';
}

const CountdownProgress = ({ variant = 'main', taskType = 'preparation' }: CountdownProgressProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const preparationUnlockDate = new Date('2026-03-20T18:00:00');
  const hackathonStartDate = new Date('2026-03-27T16:00:00');
  const hackathonEndDate = new Date('2026-03-28T16:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateProgress = () => {
    const now = currentTime.getTime();
    const prepStart = preparationUnlockDate.getTime();
    const hackStart = hackathonStartDate.getTime();
    const hackEnd = hackathonEndDate.getTime();

    const totalDuration = hackEnd - (prepStart - 7 * 24 * 60 * 60 * 1000);
    const elapsed = now - (prepStart - 7 * 24 * 60 * 60 * 1000);

    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const getTimeRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - currentTime.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getPhase = () => {
    const now = currentTime.getTime();
    if (now < preparationUnlockDate.getTime()) return 'waiting';
    if (now < hackathonStartDate.getTime()) return 'preparation';
    if (now < hackathonEndDate.getTime()) return 'hackathon';
    return 'ended';
  };

  const phase = getPhase();
  const progress = calculateProgress();

  const renderCountdown = () => {
    let targetDate: Date;
    let message: string;

    switch (phase) {
      case 'waiting':
        targetDate = preparationUnlockDate;
        message = 'Do odblokowania materiałów przygotowawczych';
        break;
      case 'preparation':
        targetDate = hackathonStartDate;
        message = 'Do rozpoczęcia hackathonu';
        break;
      case 'hackathon':
        targetDate = hackathonEndDate;
        message = 'Do końca hackathonu';
        break;
      default:
        return <div className={styles.message}>Hackathon zakończony!</div>;
    }

    const timeRemaining = getTimeRemaining(targetDate);
    if (!timeRemaining) return null;

    return (
      <div className={styles.countdownContainer}>
        <p className={styles.countdownMessage}>{message}</p>
        <div className={styles.countdownTimer}>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.days}</span>
            <span className={styles.timeLabel}>dni</span>
          </div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.hours.toString().padStart(2, '0')}</span>
            <span className={styles.timeLabel}>godz</span>
          </div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.minutes.toString().padStart(2, '0')}</span>
            <span className={styles.timeLabel}>min</span>
          </div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{timeRemaining.seconds.toString().padStart(2, '0')}</span>
            <span className={styles.timeLabel}>sek</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMilestones = () => {
    if (variant === 'task') {
      return (
        <div className={styles.milestonesTask}>
          <div className={`${styles.milestoneTask} ${phase !== 'waiting' ? styles.active : ''}`}>
            <div className={styles.milestoneCircle} />
            <span className={styles.milestoneLabel}>Materiały ({taskType === 'preparation' ? '20.03' : '27.03'})</span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.milestones}>
        <div className={`${styles.milestone} ${phase !== 'waiting' ? styles.active : ''}`}
             style={{ left: '30%' }}>
          <div className={styles.milestoneCircle} />
          <span className={styles.milestoneLabel}>Materiały przygotowawcze</span>
          <span className={styles.milestoneDate}>20.03 18:00</span>
        </div>
        <div className={`${styles.milestone} ${phase === 'hackathon' || phase === 'ended' ? styles.active : ''}`}
             style={{ left: '70%' }}>
          <div className={styles.milestoneCircle} />
          <span className={styles.milestoneLabel}>Start hackathonu</span>
          <span className={styles.milestoneDate}>27.03 16:00</span>
        </div>
      </div>
    );
  };

  const renderDuringHackathon = () => {
    if (phase !== 'hackathon') return null;

    const elapsed = currentTime.getTime() - hackathonStartDate.getTime();
    const totalDuration = hackathonEndDate.getTime() - hackathonStartDate.getTime();
    const hackathonProgress = (elapsed / totalDuration) * 100;

    return (
      <div className={styles.hackathonInfo}>
        <div className={styles.hackathonProgressBar}>
          <div className={styles.hackathonProgressFill} style={{ width: `${hackathonProgress}%` }} />
        </div>
        <div className={styles.hackathonEvents}>
          <p className={styles.currentEvent}>Trwa kodowanie!</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      {variant === 'main' && (
        <h2 className={styles.title}>Odliczanie do AI Krak Hack</h2>
      )}

      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress}%`,
              background: phase === 'hackathon'
                ? 'linear-gradient(90deg, var(--vibrant-magenta), var(--electric-blue))'
                : 'linear-gradient(90deg, var(--bright-cyan), var(--vibrant-magenta))'
            }}
          />
          {renderMilestones()}
        </div>
      </div>

      {renderCountdown()}
      {renderDuringHackathon()}

      {variant === 'main' && phase === 'waiting' && (
        <div className={styles.infoSection}>
          <h3 className={styles.infoTitle}>Tutaj pojawią się materiały przygotowawcze</h3>
          <p className={styles.infoText}>
            Tydzień przed hackathonem (20 marca o 18:00) odblokowamy materiały przygotowawcze do zadań.
            Będziesz mógł pobrać dokumenty PDF z opisami zadań i danymi startowymi.
          </p>
        </div>
      )}
    </div>
  );
};

export default CountdownProgress;