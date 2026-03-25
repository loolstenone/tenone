// Badak.biz MVP 타입 정의

export interface BadakProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  jobFunction: string;
  industry: string;
  experienceYears: number;
  jobLevel: string;
  company: string | null;
  companyVisible: boolean;
  bio: string;
  lookingFor: string[];
  canOffer: string[];
  interestTags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BadakConnection {
  id: string;
  requesterId: string;
  targetId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt: string | null;
  // Joined
  requesterProfile?: BadakProfile;
  targetProfile?: BadakProfile;
}

export interface BadakFeedback {
  id: string;
  connectionId: string;
  giverId: string;
  wasHelpful: boolean;
  createdAt: string;
}

export interface BadakStar {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  featuredProfileId: string | null;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  featuredProfile?: BadakProfile;
}

export interface ProfileSearchParams {
  jobFunction?: string;
  industry?: string;
  jobLevel?: string;
  lookingFor?: string;
  canOffer?: string;
  search?: string;
  page?: number;
  limit?: number;
}
