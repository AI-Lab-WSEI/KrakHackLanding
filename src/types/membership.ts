export interface CompetencyProfile {
  programming: number;
  analytics: number;
  softSkills: number;
  organization: number;
  creativity: number;
  marketing: number;
}

export type EngagementType =
  | 'technical_projects'
  | 'discussions_research'
  | 'marketing_pr'
  | 'organization'
  | 'academic_path';

export type ApplicationStatus =
  | 'nowe'
  | 'w_kontakcie'
  | 'rozmowa_umówiona'
  | 'przyjęty'
  | 'odrzucony';

export interface MembershipFormData {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  fieldOfStudy: string;
  yearOrStatus: string;
  attendMeetings: boolean;
  attendInPerson: boolean;
  monthlyHours: number;
  competencies: CompetencyProfile;
  whatYouBring: string;
  expectations: string;
  valuesResonance: string;
  engagementTypes: EngagementType[];
  howDidYouHear?: string;
  /** Opcjonalne, mocno rekomendowane — nazwa na Discordzie (do dodania do serwera koła). */
  discordUsername?: string;
  /** Opcjonalne, mocno rekomendowane — email używany do logowania w ClickUp
   *  (na ten adres wyślemy zaproszenie do workspace koła). */
  clickupEmail?: string;
}

export interface MembershipApplication extends MembershipFormData {
  id: number;
  isWsei: boolean;
  status: ApplicationStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const COMPETENCY_LABELS: Record<keyof CompetencyProfile, string> = {
  programming: 'Programowanie',
  analytics: 'Analityka / Data Science',
  softSkills: 'Umiejętności miękkie',
  organization: 'Organizacja / Zarządzanie',
  creativity: 'Kreatywność / Design',
  marketing: 'Marketing / PR',
};

export const ENGAGEMENT_TYPE_LABELS: Record<EngagementType, { emoji: string; title: string; description: string }> = {
  technical_projects: {
    emoji: '🔧',
    title: 'Projekty techniczne',
    description: 'Chcę budować, kodować, implementować',
  },
  discussions_research: {
    emoji: '💬',
    title: 'Dyskusje i research',
    description: 'Chcę analizować trendy AI, prezentować, dyskutować',
  },
  marketing_pr: {
    emoji: '📢',
    title: 'Marketing i PR',
    description: 'Mogę pomóc z komunikacją, social mediami, zasięgami',
  },
  organization: {
    emoji: '📋',
    title: 'Organizacja',
    description: 'Chcę wspierać od strony koordynacji, logistyki, eventów',
  },
  academic_path: {
    emoji: '🎓',
    title: 'Ścieżka naukowa',
    description: 'Interesują mnie publikacje, badania, konferencje',
  },
};

export const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string; textColor: string }> = {
  nowe: { label: 'Nowe', color: 'bg-gray-600', textColor: 'text-white' },
  w_kontakcie: { label: 'W kontakcie', color: 'bg-blue-600', textColor: 'text-white' },
  'rozmowa_umówiona': { label: 'Rozmowa umówiona', color: 'bg-yellow-500', textColor: 'text-black' },
  'przyjęty': { label: 'Przyjęty', color: 'bg-green-600', textColor: 'text-white' },
  odrzucony: { label: 'Odrzucony', color: 'bg-red-600', textColor: 'text-white' },
};

export const DEFAULT_COMPETENCIES: CompetencyProfile = {
  programming: 5,
  analytics: 5,
  softSkills: 5,
  organization: 5,
  creativity: 5,
  marketing: 5,
};

export const YEAR_OPTIONS = [
  { value: '1', label: '1 rok' },
  { value: '2', label: '2 rok' },
  { value: '3', label: '3 rok' },
  { value: 'magisterskie', label: 'Studia magisterskie' },
  { value: 'doktoranckie', label: 'Studia doktoranckie' },
  { value: 'pracujący', label: 'Pracuję zawodowo' },
  { value: 'pasjonat', label: 'Pasjonat / Zainteresowany' },
];
