export type EditionStatus = 'upcoming' | 'active' | 'archive';

export interface TimelineStep {
  title: string;
  dateRange: string;
  description: string;
  color?: string;
}

export interface ValueCard {
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface GalleryImage {
  imageUrl: string;
  alt: string;
  caption?: string;
}

export interface StoryBlock {
  title?: string;
  text: string;
}

export interface SuccessStory {
  personNameOrAlias: string;
  role: string;
  whatDid: string;
  outcome: string;
  quote?: string;
  links?: { label: string; url: string }[];
  imageUrl?: string;
}

export interface Partner {
  name: string;
  logoUrl?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Category {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  technologies: string[];
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  externalUrl?: string;
}

export interface Edition {
  year: string;
  status: EditionStatus;
  heroTitle: string;
  heroSubtitle: string;
  heroDate?: string;
  ctaApplyUrl: string;
  categories?: Category[];
  challenges?: Challenge[];
  timelineSteps: TimelineStep[];
  highlights: ValueCard[];
  program?: {
    title: string;
    description: string;
    faqs?: FAQ[];
  };
  stats?: Stat[];
  gallery?: GalleryImage[];
  storyBlocks?: StoryBlock[];
  successStory?: SuccessStory;
  partners?: Partner[];
}