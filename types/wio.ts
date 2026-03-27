// WIO 솔루션 타입 정의

export type WIOPlan = 'starter' | 'growth' | 'pro' | 'enterprise';
export type WIORole = 'owner' | 'admin' | 'manager' | 'member' | 'guest';
export type ProjectType = 'client' | 'internal' | 'community' | 'personal';
export type ProjectStatus = 'draft' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type JobStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectMemberRole = 'pm' | 'lead' | 'member' | 'support';

export const WIO_MODULES = [
  'home', 'project', 'talk', 'finance', 'people',
  'sales', 'timesheet', 'learn', 'content', 'wiki', 'insight', 'shop',
  'competition', 'networking', 'certificate', 'approval',
] as const;
export type WIOModule = typeof WIO_MODULES[number];

export interface WIOTenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  serviceName: string;
  poweredBy: boolean;
  modules: WIOModule[];
  plan: WIOPlan;
  maxMembers: number;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WIOMember {
  id: string;
  tenantId: string;
  userId: string;
  displayName: string;
  role: WIORole;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
  moduleAccess: string[];
  isActive: boolean;
  joinedAt: string;
}

export interface WIOProject {
  id: string;
  tenantId: string;
  code: string;
  title: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  pmId: string | null;
  clientName: string | null;
  budget: number;
  revenue: number;
  startedAt: string | null;
  deadline: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  pm?: WIOMember;
  memberCount?: number;
  jobCount?: number;
}

export interface WIOJob {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  status: JobStatus;
  priority: JobPriority;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  assignee?: WIOMember;
}

export interface WIOTimesheet {
  id: string;
  tenantId: string;
  memberId: string;
  jobId: string;
  workDate: string;
  hours: number;
  note: string | null;
  approved: boolean;
  approvedBy: string | null;
  createdAt: string;
  // Joined
  member?: WIOMember;
  job?: WIOJob;
}

export interface WIOProjectMember {
  id: string;
  tenantId: string;
  projectId: string;
  memberId: string;
  role: ProjectMemberRole;
  hourlyRate: number;
  joinedAt: string;
  // Joined
  member?: WIOMember;
}
