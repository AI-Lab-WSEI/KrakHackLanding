// TypeScript interfaces for new database tables (added in Faza 0 migrations)
// Existing types for legacy tables remain in edition.ts and membership.ts

// ─── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'moderator' | 'hackathon-participant' | 'scienceclub-participant' | 'jury';

/** Helper — returns true for any participant variant */
export const isParticipant = (role: UserRole): boolean =>
  role === 'hackathon-participant' || role === 'scienceclub-participant';
export type ProjectStatus = 'draft' | 'active' | 'published' | 'maintained' | 'archived';
export type ProjectVisibility = 'private' | 'members_only' | 'public';
export type ProjectType = 'personal' | 'team' | 'hackathon';
export type TeamMemberRole = 'captain' | 'member';
export type EventSource = 'manual' | 'bot_openclaw' | 'imported';
export type EventVisibility = 'admin_only' | 'members_only' | 'public';
export type ReminderStatus = 'pending' | 'sent' | 'failed';

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  keycloakId: string | null;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  university: string | null;
  graduationYear: number | null;
  skills: string[];
  isActive: boolean;
  inviteToken: string | null;
  inviteTokenExpiresAt: Date | null;
  onboardingCompleted: boolean;
  submissionId: string | null;
  membershipAppId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublicProfile = Pick<User,
  'id' | 'displayName' | 'avatarUrl' | 'bio' | 'githubUrl' | 'linkedinUrl' |
  'university' | 'graduationYear' | 'skills' | 'role'
>;

export type UserCreateInput = Pick<User, 'email'> & Partial<Pick<User,
  'keycloakId' | 'displayName' | 'avatarUrl' | 'role' | 'bio' |
  'githubUrl' | 'linkedinUrl' | 'university' | 'graduationYear' | 'skills' |
  'submissionId' | 'membershipAppId'
>>;

export type UserUpdateInput = Partial<Pick<User,
  'displayName' | 'avatarUrl' | 'bio' | 'githubUrl' | 'linkedinUrl' |
  'university' | 'graduationYear' | 'skills' | 'isActive' | 'role'
>>;

// ─── Projects ────────────────────────────────────────────────────────────────

export interface ProjectImage {
  url: string;
  caption?: string;
  cloudinaryId?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  projectType: ProjectType;
  editionNumber: number | null;
  teamProjectId: string | null;
  ownerUserId: string | null;
  teamId: string | null;
  tags: string[];
  techStack: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  images: ProjectImage[];
  challengeSlug: string | null;
  placement: number | null;
  placementLabel: string | null;
  specialMention: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectCreateInput = Pick<Project, 'title' | 'projectType'> & Partial<Pick<Project,
  'slug' | 'description' | 'status' | 'visibility' | 'editionNumber' |
  'ownerUserId' | 'teamId' | 'tags' | 'techStack' | 'githubUrl' | 'demoUrl' |
  'thumbnailUrl' | 'images' | 'challengeSlug'
>>;

export type ProjectUpdateInput = Partial<Pick<Project,
  'title' | 'description' | 'status' | 'visibility' | 'tags' | 'techStack' |
  'githubUrl' | 'demoUrl' | 'thumbnailUrl' | 'images'
>>;

// ─── Teams ───────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  editionNumber: number | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: Date;
}

export interface TeamWithMembers extends Team {
  members: Array<TeamMember & { user: UserPublicProfile }>;
}

// ─── Project Timeline ────────────────────────────────────────────────────────

export interface TimelineLink {
  label: string;
  url: string;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  stage: string | null;
  versionTag: string | null;
  images: ProjectImage[];
  links: TimelineLink[];
  publishedAt: Date | null;
  createdBy: string | null;
  sortOrder: number;
  createdAt: Date;
}

export type TimelineCreateInput = Pick<ProjectTimeline, 'title' | 'projectId'> & Partial<Pick<ProjectTimeline,
  'description' | 'stage' | 'versionTag' | 'images' | 'links' | 'publishedAt' | 'sortOrder'
>>;

// ─── Jury ────────────────────────────────────────────────────────────────────

export interface JuryMember {
  id: string;
  userId: string | null;
  name: string;
  title: string | null;
  company: string | null;
  avatarUrl: string | null;
  bio: string | null;
  editionNumber: number;
  isHeadJury: boolean;
  magicToken: string | null;
  tokenExpiresAt: Date | null;
  createdAt: Date;
}

export interface ScoringCategory {
  id: string;
  editionNumber: number;
  name: string;
  key: string;
  description: string | null;
  maxScore: number;
  weight: number;
  sortOrder: number;
  createdAt: Date;
}

// scores: { [categoryKey: string]: number }, e.g. { innovation: 18, technical_value: 15 }
export type JuryScores = Record<string, number>;

// ─── Events ──────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  source: EventSource;
  startsAt: Date;
  endsAt: Date | null;
  deadlineAt: Date | null;
  location: string | null;
  url: string | null;
  organizer: string | null;
  visibility: EventVisibility;
  isFeatured: boolean;
  tags: string[];
  relevanceScore: number | null;
  reminderDays: number[];
  createdBy: string | null;
  sourceData: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type EventCreateInput = Pick<Event, 'title' | 'startsAt'> & Partial<Pick<Event,
  'description' | 'eventType' | 'source' | 'endsAt' | 'deadlineAt' | 'location' |
  'url' | 'organizer' | 'visibility' | 'isFeatured' | 'tags' | 'relevanceScore' |
  'reminderDays' | 'createdBy' | 'sourceData'
>>;

// Schema for bot webhook payload (OpenClaw)
export interface BotEventPayload {
  title: string;
  starts_at: string;          // ISO 8601
  event_type?: string;
  url?: string;
  description?: string;
  deadline_at?: string;       // ISO 8601
  ends_at?: string;           // ISO 8601
  location?: string;
  organizer?: string;
  relevance_score?: number;   // 1-10
  tags?: string[];
}

export interface EventReminder {
  id: string;
  eventId: string;
  sendAt: Date;
  sentAt: Date | null;
  recipients: string[];
  status: ReminderStatus;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: bigint;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  changes: { before?: unknown; after?: unknown } | null;
  ipAddress: string | null;
  createdAt: Date;
}

// Helper to map snake_case DB rows to camelCase
export function mapUserRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    keycloakId: row.keycloak_id as string | null,
    email: row.email as string,
    displayName: row.display_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    role: row.role as UserRole,
    bio: row.bio as string | null,
    githubUrl: row.github_url as string | null,
    linkedinUrl: row.linkedin_url as string | null,
    university: row.university as string | null,
    graduationYear: row.graduation_year as number | null,
    skills: (row.skills as string[]) ?? [],
    isActive: row.is_active as boolean,
    inviteToken: row.invite_token as string | null,
    inviteTokenExpiresAt: row.invite_token_expires_at ? new Date(row.invite_token_expires_at as string) : null,
    onboardingCompleted: row.onboarding_completed as boolean,
    submissionId: row.submission_id as string | null,
    membershipAppId: row.membership_app_id as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export function mapProjectRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string | null,
    status: row.status as ProjectStatus,
    visibility: row.visibility as ProjectVisibility,
    projectType: row.project_type as ProjectType,
    editionNumber: row.edition_number as number | null,
    teamProjectId: row.team_project_id as string | null,
    ownerUserId: row.owner_user_id as string | null,
    teamId: row.team_id as string | null,
    tags: (row.tags as string[]) ?? [],
    techStack: (row.tech_stack as string[]) ?? [],
    githubUrl: row.github_url as string | null,
    demoUrl: row.demo_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    images: (row.images as ProjectImage[]) ?? [],
    challengeSlug: row.challenge_slug as string | null,
    placement: row.placement as number | null,
    placementLabel: row.placement_label as string | null,
    specialMention: row.special_mention as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export function mapEventRow(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    eventType: row.event_type as string | null,
    source: row.source as EventSource,
    startsAt: new Date(row.starts_at as string),
    endsAt: row.ends_at ? new Date(row.ends_at as string) : null,
    deadlineAt: row.deadline_at ? new Date(row.deadline_at as string) : null,
    location: row.location as string | null,
    url: row.url as string | null,
    organizer: row.organizer as string | null,
    visibility: row.visibility as EventVisibility,
    isFeatured: row.is_featured as boolean,
    tags: (row.tags as string[]) ?? [],
    relevanceScore: row.relevance_score as number | null,
    reminderDays: (row.reminder_days as number[]) ?? [],
    createdBy: row.created_by as string | null,
    sourceData: row.source_data as Record<string, unknown> | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}
