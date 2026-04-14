// Badak.biz MVP 타입 정의

// ── Next Stage 타입 ──

export interface CloudWord {
  text: string;
  size: number;
  hasGroup: boolean;
  members: number;
  imageUrl?: string;
  // 모임방 개설 시 추가 정보
  group?: {
    id: string;
    title: string;
    type: 'once' | 'recurring';       // 1회성 / 다회성
    maxMembers: number;
    currentMembers: number;
    leaderName: string;
    leaderJob: string;
    eventDate?: string;               // 1회성: 모임 날짜
    schedule?: string;                 // 다회성: 주기 (매주 화 19:00 등)
    location: string;
    status: 'recruiting' | 'confirmed' | 'closed';
  };
}

export interface FeedItem {
  type: 'group' | 'needs' | 'story';
  badge: string;
  title: string;
  // group
  leader?: string;
  leaderJob?: string;
  members?: number;
  max?: number;
  date?: string;
  location?: string;
  // needs
  count?: number;
  threshold?: number;
  // story
  author?: string;
  authorJob?: string;
  // common
  tags?: string[];
  imageUrl?: string;
}

export interface SkyInfo {
  bg: string;
  period: 'dawn' | 'morning' | 'day' | 'afternoon' | 'sunset' | 'night';
}

// ── 기존 타입 ──

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
