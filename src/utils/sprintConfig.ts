// Sprint/Pomodoro Configuration for Phase 3

export interface Sprint {
  id: number;
  name: string;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  type: 'work' | 'longBreak';
}

export const sprints: Sprint[] = [
  { id: 1, name: 'Sprint 1 - Foundation', workDuration: 50, breakDuration: 10, type: 'work' },
  { id: 2, name: 'Sprint 2 - Core Features', workDuration: 50, breakDuration: 10, type: 'work' },
  { id: 3, name: 'Sprint 3 - Integration', workDuration: 50, breakDuration: 15, type: 'work' },
  { id: 4, name: 'Sprint 4 - Refinement', workDuration: 50, breakDuration: 15, type: 'work' },
  { id: 5, name: 'Long Break - Recharge', workDuration: 0, breakDuration: 30, type: 'longBreak' },
  { id: 6, name: 'Sprint 5 - Polish', workDuration: 50, breakDuration: 10, type: 'work' },
  { id: 7, name: 'Sprint 6 - Features++', workDuration: 50, breakDuration: 15, type: 'work' },
  { id: 8, name: 'Sprint 7 - Testing', workDuration: 50, breakDuration: 15, type: 'work' },
  { id: 9, name: 'Sprint 8 - Bug Fixes', workDuration: 50, breakDuration: 20, type: 'work' },
  { id: 10, name: 'Long Break - Rest', workDuration: 0, breakDuration: 45, type: 'longBreak' },
  { id: 11, name: 'Sprint 9 - Final Push', workDuration: 45, breakDuration: 10, type: 'work' },
  { id: 12, name: 'Sprint 10 - Wrap Up', workDuration: 45, breakDuration: 10, type: 'work' }
];

export interface SprintState {
  currentSprint: Sprint;
  sprintIndex: number;
  isBreak: boolean;
  sprintProgress: number;
  sprintTimeRemaining: number;
  totalSprintsProgress: number;
  nextSprintName: string | null;
}

export function calculateSprintState(phaseStartTime: Date, currentTime: Date): SprintState | null {
  const elapsed = currentTime.getTime() - phaseStartTime.getTime();
  
  let accumulatedTime = 0;
  
  for (let i = 0; i < sprints.length; i++) {
    const sprint = sprints[i];
    const workDuration = sprint.workDuration * 60 * 1000;
    const breakDuration = sprint.breakDuration * 60 * 1000;
    const totalSprintDuration = workDuration + breakDuration;
    
    if (elapsed < accumulatedTime + totalSprintDuration) {
      const sprintElapsed = elapsed - accumulatedTime;
      const isBreak = sprintElapsed >= workDuration;
      
      let sprintProgress: number;
      let sprintTimeRemaining: number;
      
      if (isBreak) {
        const breakElapsed = sprintElapsed - workDuration;
        sprintProgress = (breakElapsed / breakDuration) * 100;
        sprintTimeRemaining = breakDuration - breakElapsed;
      } else {
        sprintProgress = (sprintElapsed / workDuration) * 100;
        sprintTimeRemaining = workDuration - sprintElapsed;
      }
      
      const totalSprintsProgress = ((i + (isBreak ? 1 : sprintProgress / 100)) / sprints.length) * 100;
      const nextSprintName = i < sprints.length - 1 ? sprints[i + 1].name : null;
      
      return {
        currentSprint: sprint,
        sprintIndex: i,
        isBreak,
        sprintProgress,
        sprintTimeRemaining,
        totalSprintsProgress,
        nextSprintName
      };
    }
    
    accumulatedTime += totalSprintDuration;
  }
  
  // All sprints completed
  return {
    currentSprint: sprints[sprints.length - 1],
    sprintIndex: sprints.length - 1,
    isBreak: true,
    sprintProgress: 100,
    sprintTimeRemaining: 0,
    totalSprintsProgress: 100,
    nextSprintName: null
  };
}

export interface BreakSuggestion {
  duration: number; // in minutes
  activity: string;
}

export const breakSuggestions: BreakSuggestion[] = [
  { duration: 5, activity: 'Quick stretch & eye rest' },
  { duration: 10, activity: 'Walk around, grab water/snacks' },
  { duration: 15, activity: 'Power nap or meditation' },
  { duration: 20, activity: 'Full break - step outside' },
  { duration: 30, activity: 'Meal break - eat properly!' },
  { duration: 45, activity: 'Long rest - recharge completely' }
];

export interface BreakReminder {
  elapsedHours: number;
  urgency: 'low' | 'medium' | 'high';
  message: string;
}

export const breakReminders: BreakReminder[] = [
  { elapsedHours: 4, urgency: 'low', message: 'Every 50 mins, take a 10-min break. Stay hydrated!' },
  { elapsedHours: 8, urgency: 'medium', message: '8 hours in. Meal break recommended - your brain needs fuel!' },
  { elapsedHours: 12, urgency: 'medium', message: 'Halfway point! Take a proper 20-min break to recharge.' },
  { elapsedHours: 16, urgency: 'high', message: 'You\'ve been at it for 16+ hours. Consider a 30-min power rest.' },
  { elapsedHours: 20, urgency: 'high', message: 'Final stretch! Take short 5-min breaks between tasks.' }
];

export function getBreakReminder(elapsedMs: number): BreakReminder | null {
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  for (let i = breakReminders.length - 1; i >= 0; i--) {
    if (elapsedHours >= breakReminders[i].elapsedHours) {
      return breakReminders[i];
    }
  }
  
  return null;
}
