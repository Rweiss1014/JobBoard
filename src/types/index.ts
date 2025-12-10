// Job Listing Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  description: string;
  requirements: string[];
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'annual';
  };
  category: JobCategory;
  experienceLevel: ExperienceLevel;
  employmentType: EmploymentType;

  // Source tracking for scraped jobs
  sourceUrl: string;
  sourceSite: string;

  // Posting metadata
  postedAt: Date;
  expiresAt: Date;
  scrapedAt?: Date;

  // Premium features
  isFeatured: boolean;
  isDirectPost: boolean; // true if employer posted directly

  // Status
  status: 'active' | 'expired' | 'removed';
}

export type JobCategory =
  | 'instructional-design'
  | 'elearning-development'
  | 'training-facilitation'
  | 'learning-management'
  | 'curriculum-development'
  | 'corporate-training'
  | 'learning-technology'
  | 'talent-development'
  | 'other';

export type ExperienceLevel =
  | 'entry'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'director';

export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance';

// Freelancer Profile Types
export interface FreelancerProfile {
  id: string;
  userId: string;

  // Basic info
  displayName: string;
  headline: string; // e.g., "Senior Instructional Designer | Articulate Expert"
  bio: string;
  avatarUrl?: string;

  // Location
  location: string;
  timezone: string;
  availableRemotely: boolean;

  // Professional details
  specializations: JobCategory[];
  skills: string[]; // e.g., "Articulate Storyline", "Adobe Captivate", "SCORM"
  experienceYears: number;
  hourlyRate?: {
    min: number;
    max: number;
    currency: string;
  };

  // Portfolio
  portfolioUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;

  // Availability
  availability: 'available' | 'limited' | 'unavailable';
  availabilityNote?: string; // e.g., "Available starting January 2025"

  // Premium features
  isFeatured: boolean;
  featuredUntil?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'pending-review';
}

// Employer/Direct Job Poster Types
export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyDescription?: string;
  industry?: string;
  companySize?: string;
  createdAt: Date;
}

// Direct Job Posting (paid)
export interface DirectJobPosting {
  id: string;
  employerId: string;
  job: Omit<Job, 'id' | 'sourceUrl' | 'sourceSite' | 'scrapedAt' | 'isDirectPost'>;

  // Payment
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  postingTier: 'basic' | 'featured';

  // Visibility
  publishedAt?: Date;
  expiresAt: Date;
}

// Search/Filter Types
export interface JobFilters {
  search?: string;
  categories?: JobCategory[];
  experienceLevels?: ExperienceLevel[];
  employmentTypes?: EmploymentType[];
  locationTypes?: ('remote' | 'hybrid' | 'onsite')[];
  location?: string;
  isFeatured?: boolean;
}

export interface FreelancerFilters {
  search?: string;
  specializations?: JobCategory[];
  skills?: string[];
  availability?: ('available' | 'limited')[];
  minExperience?: number;
  maxHourlyRate?: number;
  location?: string;
  remoteOnly?: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'freelancer' | 'employer' | 'admin';
  createdAt: Date;
  profileId?: string; // FreelancerProfile or Employer ID
}
