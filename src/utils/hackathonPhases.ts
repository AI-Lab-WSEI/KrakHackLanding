// Hackathon Phase Configuration and Logic

export interface Phase {
  id: number;
  name: string;
  duration: number; // in minutes
  color: string;
  description: string;
  tasks: string[];
  proTips: string[];
}

export const HACKATHON_START = new Date('2026-03-27T18:00:00');
export const HACKATHON_END = new Date('2026-03-28T21:00:00');
export const HACKATHON_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

export const phases: Phase[] = [
  {
    id: 1,
    name: 'Task Selection',
    duration: 60,
    color: '#f59e0b', // amber
    description: 'Kick off strong by choosing the right project early — indecision is the biggest time thief.',
    tasks: [
      'Brainstorm and Decide: Dedicate a maximum of 1 hour to team brainstorming',
      'Discuss which task aligns best with everyone\'s skills, interests, and strengths',
      'Make Concessions and Take Risks: Be flexible and open to bold ideas',
      'If time\'s up without consensus, pick the closest group favorite and move on'
    ],
    proTips: [
      'Set a timer right away. This phase sets the tone — momentum is key!',
      'Be flexible — compromise on ideas to fit the group.',
      'Don\'t shy away from bold, innovative concepts that excite the team.'
    ]
  },
  {
    id: 2,
    name: 'Preparation & Planning',
    duration: 180,
    color: '#3b82f6', // blue
    description: 'With your task locked in, dive into structured prep. This is where you lay a solid foundation for execution.',
    tasks: [
      'Deep Brainstorming: Set up shared note-taking, capture all ideas',
      'Summarize into a Project Blueprint (1-2 pages max)',
      'Task Definition: Break down into actionable items with owners',
      'Set Up Code Repository: Initialize GitHub/GitLab with team access',
      'Create Project Mind Map with FigJam, Miro, or Mural',
      'First Low-Fidelity Designs in Figma or similar tools'
    ],
    proTips: [
      'Document everything in one central hub to avoid scattered files.',
      'Use tools like Notion, Anytype, or Google Docs for shared notes.',
      'Create a simple Kanban board with Trello or Linear for task tracking.'
    ]
  },
  {
    id: 3,
    name: 'Iterative Development',
    duration: 960,
    color: '#10b981', // emerald
    description: 'Hackathons thrive on feedback and adaptation. Use this repeating cycle to build momentum.',
    tasks: [
      'Seek Mentorship: Schedule quick chats with mentors or experts',
      'Execute Sprints: 3-hour focused development sessions',
      'Team Standup (5-10 min): What accomplished? What\'s blocking? Are we aligned?',
      'Optional Brainstorm Refresh: Pivot if needed for new features',
      'Repeat the Loop: Keep the momentum going!'
    ],
    proTips: [
      'Use a shared Discord channel for async updates.',
      'Alternate mentorship discussions with development sprints.',
      'Track progress in your task table and adjust assignments dynamically.'
    ]
  },
  {
    id: 4,
    name: 'Presentation Deck',
    duration: 180,
    color: '#8b5cf6', // violet
    description: 'Your demo isn\'t just the product; it\'s how you sell it. Start visuals early to avoid a Sunday scramble.',
    tasks: [
      'Title slide (team name, project name)',
      'Problem statement',
      'Solution overview with screenshots/mockups',
      'Tech stack and architecture',
      'Demo flow (embed video if possible)',
      'Link to live preview',
      'Impact and future plans'
    ],
    proTips: [
      'Keep it 10-15 slides, visually clean.',
      'Reuse assets from your mind map and mockups.',
      'Practice a 3-minute pitch aloud.',
      'Use AI-powered tools like gamma.app for quick slides.'
    ]
  },
  {
    id: 5,
    name: 'Final Submission',
    duration: 60,
    color: '#ef4444', // red
    description: 'Wrap up with precision — judges love polished submissions.',
    tasks: [
      'Submit to the platform well before deadline',
      'Test across multiple devices/browsers (focus on incognito mode)',
      'Verify all external links are included and working',
      'Ensure permissions are set correctly (no login walls!)',
      'Prepare README.md with launch instructions',
      'Provide admin credentials if using authorization'
    ],
    proTips: [
      'Assign a \'submission captain\' to handle final upload and checks.',
      'Celebrate with a team photo once it\'s done!',
      'Remember: fun + learning > perfection. You\'ve got this!'
    ]
  }
];

export interface PhaseState {
  currentPhase: Phase | null;
  phaseIndex: number;
  phaseProgress: number;
  phaseTimeRemaining: number;
  phaseElapsed: number;
}

export type HackathonStatus = 'before' | 'during' | 'after';

// Set to null for production, or a Date for mocking (e.g. middle of hackathon)
export const MOCK_DATE: Date | null = null;

export function getEffectiveNow(now: Date): Date {
  return MOCK_DATE || now;
}

export function getCurrentPhase(now: Date): PhaseState {
  const effectiveNow = getEffectiveNow(now);
  const elapsed = effectiveNow.getTime() - HACKATHON_START.getTime();
  
  if (elapsed < 0) {
    return {
      currentPhase: null,
      phaseIndex: -1,
      phaseProgress: 0,
      phaseTimeRemaining: 0,
      phaseElapsed: 0
    };
  }

  let accumulatedTime = 0;
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const phaseDuration = phase.duration * 60 * 1000;
    
    if (elapsed < accumulatedTime + phaseDuration) {
      const phaseElapsed = elapsed - accumulatedTime;
      const phaseProgress = (phaseElapsed / phaseDuration) * 100;
      const phaseTimeRemaining = phaseDuration - phaseElapsed;
      
      return {
        currentPhase: phase,
        phaseIndex: i,
        phaseProgress,
        phaseTimeRemaining,
        phaseElapsed
      };
    }
    
    accumulatedTime += phaseDuration;
  }
  
  return {
    currentPhase: phases[phases.length - 1],
    phaseIndex: phases.length - 1,
    phaseProgress: 100,
    phaseTimeRemaining: 0,
    phaseElapsed: phases[phases.length - 1].duration * 60 * 1000
  };
}

export function getPhaseStartTime(phaseIndex: number): Date {
  let accumulatedTime = 0;
  for (let i = 0; i < phaseIndex; i++) {
    accumulatedTime += phases[i].duration * 60 * 1000;
  }
  return new Date(HACKATHON_START.getTime() + accumulatedTime);
}

export function formatTime(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60
  };
}

export function getOverallProgress(now: Date): number {
  const effectiveNow = getEffectiveNow(now);
  const elapsed = effectiveNow.getTime() - HACKATHON_START.getTime();
  return Math.min(Math.max((elapsed / HACKATHON_DURATION) * 100, 0), 100);
}

export function getHackathonStatus(now: Date): HackathonStatus {
  const effectiveNow = getEffectiveNow(now);
  if (effectiveNow < HACKATHON_START) return 'before';
  if (effectiveNow > HACKATHON_END) return 'after';
  return 'during';
}
