'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import {
  FileText, Bookmark, MessageSquare, Settings, LogOut,
  ChevronRight, ChevronDown, Eye, MessageCircle, Heart,
  Shield, Mail, Phone, Briefcase, Building2, Tag,
  Check, X, Crown, Users, CalendarDays, MapPin,
  UserCheck, UserX, Clock, Bell, Megaphone,
  ToggleLeft, ToggleRight, UserPlus, AlertCircle,
} from 'lucide-react';

type TabType = 'posts' | 'bookmarks' | 'notifications' | 'mygroups' | 'settings';
type ApplicantStatus = 'pending' | 'approved' | 'rejected';
type JoinType = 'approval' | 'firstcome';

// ── 인터페이스 ──
interface MyPost {
  id: string;
  board: string;
  boardLabel: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

interface BookmarkItem {
  id: string;
  type: 'need' | 'group' | 'post';
  title: string;
  subtitle: string;
  createdAt: string;
}

interface MessageItem {
  id: string;
  direction: 'sent' | 'received';
  type: 'join' | 'interest' | 'approved' | 'rejected' | 'notice';
  groupName?: string;
  needName?: string;
  counterpartName: string;
  counterpartJob: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface GroupApplicant {
  id: string;
  memberId?: string;
  name: string;
  job: string;
  message: string;
  status: ApplicantStatus;
  appliedAt: string;
}

interface MyGroup {
  id: string;
  title: string;
  type: 'once' | 'recurring';
  joinType: JoinType;
  status: 'recruiting' | 'confirmed' | 'closed';
  currentMembers: number;
  maxMembers: number;
  schedule: string;
  location: string;
  nextDate?: string;
  applicants: GroupApplicant[];
  members: { id: string; name: string; job: string; joinedAt: string }[];
  notice?: string;
}

interface JoinedGroup {
  id: string;
  title: string;
  type: 'once' | 'recurring';
  leaderName: string;
  myStatus: ApplicantStatus;
  nextDate?: string;
  schedule: string;
  location: string;
}

// ── Mock 데이터 ──
const MOCK_POSTS: MyPost[] = [
  { id: 'p1', board: 'chat', boardLabel: '수다', title: '마케터가 알아야 할 AI 툴 추천', views: 1204, likes: 67, comments: 32, createdAt: '2026-04-13' },
  { id: 'p2', board: 'review', boardLabel: '모임 후기', title: '소셜미디어 트렌드 분석 모임 다녀왔어요!', views: 218, likes: 23, comments: 7, createdAt: '2026-04-12' },
];

const MOCK_BOOKMARKS: BookmarkItem[] = [
  { id: 'b1', type: 'need', title: '데이터 분석 같이 공부하자', subtitle: '12명 관심', createdAt: '2026-04-13' },
  { id: 'b2', type: 'group', title: 'B2B 마케팅 실무 모임', subtitle: '정기 모임 · 13/20명', createdAt: '2026-04-11' },
  { id: 'b3', type: 'post', title: '프리랜서 전향 1년차 후기', subtitle: '수다 · 좋아요 34', createdAt: '2026-04-10' },
];

const MOCK_MESSAGES: MessageItem[] = [
  // 받은
  { id: 'm1', direction: 'received', type: 'join', groupName: 'B2B 마케팅 실무 모임', counterpartName: '마케터J', counterpartJob: '퍼포먼스 마케터 3년차', content: 'B2B 쪽으로 전환하고 싶어서 참여 신청합니다!', createdAt: '2026-04-14', read: false },
  { id: 'm2', direction: 'received', type: 'join', groupName: 'B2B 마케팅 실무 모임', counterpartName: '그로스해커K', counterpartJob: '그로스 마케터 5년차', content: 'B2B SaaS 경험 많습니다. 같이 나누고 싶어요.', createdAt: '2026-04-13', read: false },
  // 보낸
  { id: 'm3', direction: 'sent', type: 'join', groupName: '카피라이팅 같이 연습할래?', counterpartName: '카피장인', counterpartJob: '브랜드 마케터', content: '카피라이팅 실력을 키우고 싶어서 신청합니다!', createdAt: '2026-04-13', read: true },
  { id: 'm4', direction: 'sent', type: 'interest', needName: '포트폴리오 피드백 받고 싶어', counterpartName: '', counterpartJob: '', content: '이직 준비 중인데 같이 피드백 교환하면 좋겠어요', createdAt: '2026-04-12', read: false },
  // 알림
  { id: 'm5', direction: 'received', type: 'approved', groupName: '카피라이팅 같이 연습할래?', counterpartName: '카피장인', counterpartJob: '바닥장', content: '참여가 승인되었습니다! 첫 모임은 4/20(토) 14시입니다.', createdAt: '2026-04-12', read: true },
];

const MOCK_MY_GROUPS: MyGroup[] = [
  {
    id: 'g1', title: 'B2B 마케팅 실무 모임', type: 'recurring', joinType: 'approval',
    status: 'recruiting', currentMembers: 13, maxMembers: 20,
    schedule: '매주 금 12:00', location: '삼성역', nextDate: '2026-04-18',
    applicants: [
      { id: 'a1', name: '마케터J', job: '퍼포먼스 마케터 3년차', message: 'B2B 쪽으로 전환하고 싶어서 참여 신청합니다!', status: 'pending', appliedAt: '2026-04-14' },
      { id: 'a2', name: '그로스해커K', job: '그로스 마케터 5년차', message: 'B2B SaaS 경험 많습니다.', status: 'pending', appliedAt: '2026-04-13' },
      { id: 'a3', name: '콘텐츠러L', job: '콘텐츠 마케터', message: '', status: 'approved', appliedAt: '2026-04-10' },
      { id: 'a4', name: '데이터M', job: '데이터 분석가', message: '마케팅 데이터 분석 관점에서 참여하고 싶습니다.', status: 'rejected', appliedAt: '2026-04-09' },
    ],
    members: [
      { id: 'mb1', name: '콘텐츠러L', job: '콘텐츠 마케터', joinedAt: '2026-04-10' },
      { id: 'mb2', name: '기획자A', job: 'PM 4년차', joinedAt: '2026-04-05' },
      { id: 'mb3', name: '브랜더B', job: '브랜드 마케터', joinedAt: '2026-04-03' },
    ],
    notice: '이번 주 금요일 모임은 발표 순서가 있습니다. 각자 B2B 캠페인 사례 1개씩 준비해주세요!',
  },
  {
    id: 'g2', title: '마케터 사이드 프로젝트', type: 'once', joinType: 'firstcome',
    status: 'confirmed', currentMembers: 6, maxMembers: 6,
    schedule: '2026-05-10', location: '온라인 (Zoom)',
    applicants: [],
    members: [
      { id: 'mb4', name: '사이드A', job: 'PM', joinedAt: '2026-04-08' },
      { id: 'mb5', name: '디자이너C', job: 'UX 디자이너', joinedAt: '2026-04-08' },
    ],
  },
];

const MOCK_JOINED: JoinedGroup[] = [
  { id: 'j1', title: '카피라이팅 같이 연습할래?', type: 'recurring', leaderName: '카피장인', myStatus: 'approved', nextDate: '2026-04-20', schedule: '매주 토 14:00', location: '강남역' },
  { id: 'j2', title: '소셜미디어 트렌드 같이 분석', type: 'recurring', leaderName: '소셜러', myStatus: 'pending', schedule: '격주 수 19:00', location: '홍대입구역' },
];

const INDUSTRIES = [
  'IT/테크', '광고/에이전시', '마케팅', '디자인', '미디어/콘텐츠',
  '금융/핀테크', '유통/이커머스', '제조', '교육', '컨설팅',
  '스타트업', '엔터테인먼트', '패션/뷰티', '식음료/외식', '부동산/건설',
  '의료/헬스케어', '공공/비영리', '기타',
];
const JOB_FUNCTIONS = [
  '마케팅', '브랜딩', '퍼포먼스 마케팅', 'CRM/그로스', 'PR/홍보',
  'AE/광고기획', '미디어플래닝', '콘텐츠 기획', 'UX/UI 디자인', '그래픽 디자인',
  'PM/기획', '개발', '데이터 분석', '영업/BD', '경영/전략',
  '크리에이티브 디렉션', '영상 제작', 'SNS 운영', 'CS/운영', '기타',
];
const EXPECTATIONS = [
  '취업 준비', '이직 준비', '구인 (채용)', '구직 활동',
  '업무 스킬 향상', '커리어 전환', '창업/사업 준비',
  '사이드 프로젝트', '네트워킹', '업계 정보 교류',
  '파트너/제휴 구하기', '스터디/스킬 교환',
  '사업 투자/펀딩', '멘토링', '프리랜서 전환', '해외 진출',
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── 컴포넌트 ──

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    recruiting: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', label: '모집중' },
    confirmed: { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc', label: '확정' },
    closed: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', label: '마감' },
    pending: { bg: 'rgba(255,217,61,0.12)', color: '#ffd93d', label: '대기중' },
    approved: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', label: '승인됨' },
    rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: '거절됨' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function GroupManageCard({
  group,
  onUpdate,
  onApplicantAction,
}: {
  group: MyGroup;
  onUpdate: (g: MyGroup) => void;
  onApplicantAction?: (groupId: string, membershipId: string, action: 'approved' | 'rejected') => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'applicants' | 'members' | 'notice'>('applicants');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const pendingCount = group.applicants.filter((a) => a.status === 'pending').length;
  const remaining = group.maxMembers - group.currentMembers;

  const handleApplicantAction = async (applicantId: string, action: ApplicantStatus) => {
    if (action !== 'approved' && action !== 'rejected') return;
    setProcessingId(applicantId);
    if (onApplicantAction) {
      await onApplicantAction(group.id, applicantId, action);
    } else {
      // 로컬 fallback (API 없을 때)
      const updated = {
        ...group,
        applicants: group.applicants.map((a) => a.id === applicantId ? { ...a, status: action } : a),
        currentMembers: action === 'approved' ? group.currentMembers + 1 : group.currentMembers,
      };
      onUpdate(updated);
    }
    setProcessingId(null);
  };

  const toggleJoinType = () => {
    onUpdate({ ...group, joinType: group.joinType === 'approval' ? 'firstcome' : 'approval' });
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
      {/* 모임 헤더 */}
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <StatusBadge status={group.status} />
            <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] text-white/30">
              {group.type === 'recurring' ? '정기' : '1회'}
            </span>
            {pendingCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white/90">{group.title}</h3>
          <div className="mt-1 flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-0.5"><Users className="h-3 w-3" /> {group.currentMembers}/{group.maxMembers}</span>
            <span className="flex items-center gap-0.5"><CalendarDays className="h-3 w-3" /> {group.schedule}</span>
            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {group.location}</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/20 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-white/6">
          {/* 모임 설정 바 */}
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <span>참여 방식:</span>
              <button onClick={toggleJoinType} className="flex items-center gap-1 text-white/70">
                {group.joinType === 'approval' ? (
                  <><ToggleRight className="h-4 w-4 text-amber-400" /> <span className="font-medium text-amber-400">승인제</span></>
                ) : (
                  <><ToggleLeft className="h-4 w-4 text-green-400" /> <span className="font-medium text-green-400">선착순</span></>
                )}
              </button>
            </div>
            {remaining > 0 && (
              <span className="text-[10px] text-white/25">잔여 {remaining}석</span>
            )}
          </div>

          {/* 섹션 탭 */}
          <div className="flex border-b border-white/6">
            {[
              { id: 'applicants' as const, label: '지원 현황', count: pendingCount },
              { id: 'members' as const, label: '참여 멤버', count: group.members.length },
              { id: 'notice' as const, label: '공지' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className="flex-1 py-2 text-[11px] font-medium transition-colors"
                style={{
                  color: activeSection === sec.id ? '#ffd93d' : 'rgba(255,255,255,0.3)',
                  borderBottom: activeSection === sec.id ? '2px solid #ffd93d' : '2px solid transparent',
                }}
              >
                {sec.label}
                {sec.count !== undefined && sec.count > 0 && (
                  <span className="ml-1 text-[9px] opacity-60">({sec.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* 지원 현황 */}
          {activeSection === 'applicants' && (
            <div className="p-3 space-y-2">
              {group.applicants.length === 0 ? (
                <p className="py-6 text-center text-xs text-white/25">지원자가 없습니다</p>
              ) : (
                <>
                  {/* 상태 요약 */}
                  <div className="flex gap-2 mb-2">
                    {(['pending', 'approved', 'rejected'] as const).map((s) => {
                      const count = group.applicants.filter((a) => a.status === s).length;
                      const labels = { pending: '대기', approved: '승인', rejected: '거절' };
                      return (
                        <div key={s} className="flex-1 rounded-lg bg-white/[0.04] px-2 py-1.5 text-center">
                          <div className="text-sm font-bold text-white/70">{count}</div>
                          <div className="text-[9px] text-white/25">{labels[s]}</div>
                        </div>
                      );
                    })}
                  </div>
                  {group.applicants.map((app) => (
                    <div key={app.id} className="rounded-lg bg-white/[0.03] p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-white/80">{app.name}</span>
                            <span className="ml-1.5 text-[10px] text-white/30">{app.job}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={app.status} />
                          <span className="text-[9px] text-white/15">{app.appliedAt}</span>
                        </div>
                      </div>
                      {app.message ? (
                        <p className="mb-2 text-[11px] leading-relaxed text-white/45">{app.message}</p>
                      ) : (
                        <p className="mb-2 text-[11px] italic text-white/15">메시지 없음</p>
                      )}
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplicantAction(app.id, 'approved')}
                            disabled={processingId === app.id}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg border-none py-1.5 text-[11px] font-semibold disabled:opacity-50"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}
                          >
                            <UserCheck className="h-3 w-3" /> {processingId === app.id ? '처리중...' : '승인'}
                          </button>
                          <button
                            onClick={() => handleApplicantAction(app.id, 'rejected')}
                            disabled={processingId === app.id}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/8 bg-transparent py-1.5 text-[11px] text-white/35 disabled:opacity-50"
                          >
                            <UserX className="h-3 w-3" /> 거절
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* 참여 멤버 */}
          {activeSection === 'members' && (
            <div className="p-3 space-y-1.5">
              {group.members.length === 0 ? (
                <p className="py-6 text-center text-xs text-white/25">참여 멤버가 없습니다</p>
              ) : (
                group.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-white/80">{m.name}</span>
                        <span className="ml-1.5 text-[10px] text-white/30">{m.job}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-white/15">{m.joinedAt} 참여</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 공지 */}
          {activeSection === 'notice' && (
            <div className="p-3">
              {group.notice ? (
                <div className="rounded-lg bg-amber-400/5 border border-amber-400/10 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
                    <Megaphone className="h-3 w-3" /> 모임 공지
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/60">{group.notice}</p>
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-white/25">등록된 공지가 없습니다</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BadakMyPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showLogin, setShowLogin] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 설정
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobFunction, setJobFunction] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'idle' | 'confirm' | 'sending' | 'input' | 'verifying'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [codeResendCooldown, setCodeResendCooldown] = useState(0);

  // 내 글 (실DB)
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [myPostsLoading, setMyPostsLoading] = useState(true);

  // 북마크 (실DB)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);

  // 내 모임 (실DB)
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<JoinedGroup[]>([]);
  const isLeader = myGroups.length > 0;

  // 멤버 역할
  const [memberRole, setMemberRole] = useState<string>('member');

  useEffect(() => { if (!isLoading && !isAuthenticated) setShowLogin(true); }, [isLoading, isAuthenticated]);

  // 프로필 + 내 글 실DB 로드
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const { data: { session } } = await createClient().auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };

        // 프로필
        const memberRes = await fetch('/api/badak/member', { headers });
        const memberData = await memberRes.json();
        if (memberData.member) {
          setNickname(memberData.member.display_name || user.name || '');
          setPhone(memberData.member.phone || '');
          setIndustry(memberData.member.industry || '');
          setJobFunction(memberData.member.job_function || '');
          setInterests(memberData.member.interests || []);
          setMemberRole(memberData.member.role || 'member');
        } else {
          setNickname(user.name || '');
        }

        // 내 글 (모든 보드에서 내 글)
        setMyPostsLoading(true);
        const boardLabels: Record<string, string> = { chat: '수다', review: '모임 후기', proposal: '모임 제안' };
        const results = await Promise.all(
          ['chat', 'review', 'proposal'].map(b => fetch(`/api/badak/community?board=${b}&limit=50`).then(r => r.json()))
        );
        const allPosts = results.flatMap(r => r.posts || []);
        const mine = allPosts
          .filter((p: { user_id: string }) => p.user_id === user.id)
          .map((p: { id: string; board: string; title: string; views_count: number; likes_count: number; comments_count: number; created_at: string }) => ({
            id: p.id,
            board: p.board,
            boardLabel: boardLabels[p.board] || p.board,
            title: p.title,
            views: p.views_count || 0,
            likes: p.likes_count || 0,
            comments: p.comments_count || 0,
            createdAt: new Date(p.created_at).toLocaleDateString('ko-KR'),
          }));
        setMyPosts(mine);
        setMyPostsLoading(false);

        // 알림 로드
        const notiRes = await fetch('/api/badak/notifications', { headers });
        const notiData = await notiRes.json();
        setNotifications(notiData.notifications || []);
        setUnreadCount(notiData.unreadCount || 0);

        // 북마크 로드
        setBookmarksLoading(true);
        const bmRes = await fetch('/api/badak/bookmarks', { headers });
        const bmData = await bmRes.json();
        setBookmarks((bmData.bookmarks || []).map((b: { id: string; item_type: string; item_id: string; title: string; subtitle: string | null; created_at: string }) => ({
          id: b.id,
          type: b.item_type as 'need' | 'group' | 'post',
          title: b.title,
          subtitle: b.subtitle || '',
          createdAt: new Date(b.created_at).toLocaleDateString('ko-KR'),
        })));
        setBookmarksLoading(false);

        // 내 모임 로드 (개설한 모임 + 참여 신청 모임)
        const myGroupsRes = await fetch('/api/badak/my/groups', { headers });
        const myGroupsData = await myGroupsRes.json();
        setMyGroups(myGroupsData.ledGroups || []);
        setJoinedGroups(myGroupsData.joinedGroups || []);
      } catch {
        setNickname(user.name || '');
        setMyPostsLoading(false);
        setBookmarksLoading(false);
      }
    })();
  }, [user]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" /></div>;
  if (!isAuthenticated) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a2e] px-6">
      <Shield className="mx-auto mb-4 h-10 w-10 text-white/30" />
      <p className="mb-4 text-sm text-white/50">로그인이 필요합니다</p>
      <button onClick={() => setShowLogin(true)} className="rounded-xl border-none px-6 py-2.5 text-sm font-semibold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>로그인</button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );

  const initials = user?.name?.substring(0, 1) || '?';
  const pendingApplicants = myGroups.reduce((sum, g) => sum + g.applicants.filter((a) => a.status === 'pending').length, 0);

  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'posts', label: '내 글', icon: FileText },
    { id: 'bookmarks', label: '북마크', icon: Bookmark },
    { id: 'notifications', label: '알림', icon: Bell, badge: unreadCount },
    ...(isLeader ? [{ id: 'mygroups' as const, label: '내 모임', icon: Crown, badge: pendingApplicants }] : []),
    { id: 'settings', label: '설정', icon: Settings },
  ];

  const handleToggleInterest = (item: string) => setInterests((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);
  const handleSave = () => { setVerifyStep('confirm'); setVerificationCode(''); setVerifyError(''); };
  const handleSendCode = async () => {
    setVerifyStep('sending');
    try {
      const res = await fetch('/api/badak/member/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, userId: user?.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setVerifyError(data.error || '인증 코드 발송에 실패했습니다.');
        setVerifyStep('confirm');
        return;
      }
      setVerifyStep('input');
      setCodeResendCooldown(60);
      const timer = setInterval(() => setCodeResendCooldown((p) => { if (p <= 1) { clearInterval(timer); return 0; } return p - 1; }), 1000);
    } catch {
      setVerifyError('네트워크 오류가 발생했습니다.');
      setVerifyStep('confirm');
    }
  };
  const handleVerifyAndSave = async () => {
    if (verificationCode.length < 6) { setVerifyError('6자리 인증 코드를 입력해주세요'); return; }
    setVerifyStep('verifying');
    try {
      const res = await fetch('/api/badak/member/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        setVerifyError(data.error || '인증 코드가 올바르지 않습니다.');
        setVerifyStep('input');
        return;
      }
      // 프로필 업데이트 API 호출
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (session) {
        await fetch('/api/badak/member', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ displayName: nickname, phone, industry, jobFunction, interests }),
        });
      }
      setSaveSuccess(true); setVerifyStep('idle'); setEditMode(false); setVerificationCode('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setVerifyError('네트워크 오류가 발생했습니다.');
      setVerifyStep('input');
    }
  };
  const handleCancelEdit = () => { setEditMode(false); setVerifyStep('idle'); setVerificationCode(''); setVerifyError(''); };

  const handleGroupUpdate = (updated: MyGroup) => {
    setMyGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
  };

  const handleApplicantAction = async (groupId: string, membershipId: string, action: 'approved' | 'rejected') => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/badak/groups/${groupId}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ membershipId, action }),
      });
      if (!res.ok) return;
      // 로컬 상태도 동기화
      setMyGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          applicants: g.applicants.map((a) => a.id === membershipId ? { ...a, status: action } : a),
          currentMembers: action === 'approved' ? g.currentMembers + 1 : g.currentMembers,
          members: action === 'approved'
            ? [...g.members, ...g.applicants.filter((a) => a.id === membershipId).map((a) => ({ id: a.memberId || a.id, name: a.name, job: a.job, joinedAt: new Date().toLocaleDateString('ko-KR') }))]
            : g.members,
        };
      }));
    } catch {
      // silent fail
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">

        {/* 프로필 카드 */}
        <div className="mb-6 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>{initials}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">{user?.name || '회원'}</h1>
                {isLeader && <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}><Crown className="h-2.5 w-2.5" /> 바닥장</span>}
              </div>
              <p className="mt-0.5 text-xs text-white/40">{user?.email}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/40">{industry || '산업군 미설정'}</span>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/40">{jobFunction || '직무 미설정'}</span>
              </div>
            </div>
          </div>

          {/* 참여 중인 모임 요약 */}
          {joinedGroups.length > 0 && (
            <div className="mt-4 border-t border-white/6 pt-3">
              <div className="mb-2 text-[10px] font-medium text-white/30">참여 중인 모임</div>
              <div className="space-y-1.5">
                {joinedGroups.map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70">{j.title}</span>
                      <StatusBadge status={j.myStatus} />
                    </div>
                    {j.nextDate && j.myStatus === 'approved' && (
                      <span className="flex items-center gap-0.5 text-[9px] text-green-400/60">
                        <CalendarDays className="h-2.5 w-2.5" /> {j.nextDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 탭 */}
        <div className="scrollbar-hide mb-5 flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                style={{ background: isActive ? 'rgba(255,217,61,0.1)' : 'transparent', color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.badge && tab.badge > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{tab.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* ── 내 글 ── */}
        {activeTab === 'posts' && (
          <div className="space-y-2">
            {myPostsLoading ? (
              <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" /></div>
            ) : myPosts.length === 0 ? (
              <div className="py-16 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-white/15" /><p className="text-sm text-white/30">작성한 글이 없습니다</p></div>
            ) : myPosts.map((post) => (
              <div key={post.id} className="rounded-xl border border-white/6 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">{post.boardLabel}</span>
                  <span className="text-[10px] text-white/20">{post.createdAt}</span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white/90">{post.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-white/25">
                  <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {formatNumber(post.views)}</span>
                  <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {post.likes}</span>
                  <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 북마크 ── */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-2">
            {bookmarksLoading ? (
              <div className="flex justify-center py-16"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" /></div>
            ) : bookmarks.length === 0 ? (
              <div className="py-16 text-center"><Bookmark className="mx-auto mb-3 h-8 w-8 text-white/15" /><p className="text-sm text-white/30">북마크가 없습니다</p></div>
            ) : bookmarks.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.03] p-4 hover:bg-white/[0.06]">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{
                      background: item.type === 'need' ? 'rgba(255,217,61,0.1)' : item.type === 'group' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                      color: item.type === 'need' ? '#ffd93d' : item.type === 'group' ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                    }}>
                      {item.type === 'need' ? '니즈' : item.type === 'group' ? '모임' : '게시글'}
                    </span>
                    <span className="text-[10px] text-white/20">{item.createdAt}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white/80">{item.title}</h3>
                  <p className="mt-0.5 text-[11px] text-white/30">{item.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/15" />
              </div>
            ))}
          </div>
        )}

        {/* ── 메시지 (통합) ── */}
        {activeTab === 'notifications' && (
          <div>
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={async () => {
                    const { createClient } = await import('@/lib/supabase/client');
                    const { data: { session } } = await createClient().auth.getSession();
                    if (!session) return;
                    await fetch('/api/badak/notifications', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                      body: JSON.stringify({ readAll: true }),
                    });
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setUnreadCount(0);
                  }}
                  className="text-[11px] text-white/30 hover:text-white/50"
                >
                  모두 읽음
                </button>
              </div>
            )}
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="py-16 text-center"><Bell className="mx-auto mb-3 h-8 w-8 text-white/15" /><p className="text-sm text-white/30">알림이 없습니다</p></div>
              ) : notifications.map((noti) => {
                const typeStyles: Record<string, { label: string; color: string; bg: string }> = {
                  join_request: { label: '참여 신청', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
                  join_approved: { label: '승인', color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)' },
                  join_rejected: { label: '거절', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
                  comment: { label: '댓글', color: '#ffd93d', bg: 'rgba(255,217,61,0.1)' },
                  like: { label: '좋아요', color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
                  group_update: { label: '모임', color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)' },
                  system: { label: '시스템', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
                };
                const s = typeStyles[noti.type] || typeStyles.system;
                const ago = (() => {
                  const diff = Date.now() - new Date(noti.created_at).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 60) return `${mins}분 전`;
                  const hours = Math.floor(mins / 60);
                  if (hours < 24) return `${hours}시간 전`;
                  return `${Math.floor(hours / 24)}일 전`;
                })();
                return (
                  <div key={noti.id} className="rounded-xl border p-4 transition-colors" style={{
                    background: noti.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,217,61,0.02)',
                    borderColor: noti.read ? 'rgba(255,255,255,0.06)' : 'rgba(255,217,61,0.1)',
                  }}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!noti.read && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      <span className="text-[10px] text-white/20">{ago}</span>
                    </div>
                    <p className="text-xs font-medium text-white/70">{noti.title}</p>
                    {noti.body && <p className="mt-0.5 text-[11px] text-white/40">{noti.body}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 내 모임 (바닥장) ── */}
        {activeTab === 'mygroups' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/40">
                개설한 모임 {myGroups.length}개
                {pendingApplicants > 0 && <span className="ml-2 text-amber-400">· 대기 {pendingApplicants}건</span>}
              </div>
              <button
                onClick={() => { router.push('/badak/groups/create'); }}
                className="flex items-center gap-1 rounded-lg border-none px-3 py-1.5 text-[11px] font-semibold"
                style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d' }}
              >
                <UserPlus className="h-3 w-3" /> 새 모임 개설
              </button>
            </div>

            {myGroups.map((group) => (
              <GroupManageCard
                key={group.id}
                group={group}
                onUpdate={handleGroupUpdate}
                onApplicantAction={handleApplicantAction}
              />
            ))}
          </div>
        )}

        {/* ── 설정 ── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-xs text-green-400">
                <Check className="h-4 w-4" /> 프로필이 저장되었습니다
              </div>
            )}

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/80">프로필 정보</h3>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="rounded-lg border border-white/10 bg-transparent px-3 py-1 text-[11px] text-white/50 hover:text-white/70">수정</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancelEdit} className="rounded-lg border border-white/10 bg-transparent px-3 py-1 text-[11px] text-white/40">취소</button>
                    <button onClick={handleSave} className="rounded-lg border-none px-3 py-1 text-[11px] font-semibold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>저장</button>
                  </div>
                )}
              </div>

              {/* 닉네임 */}
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Briefcase className="h-3 w-3" /> 닉네임</label>
                {editMode ? <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none focus:border-amber-400/30" />
                  : <p className="text-xs text-white/70">{nickname || '미설정'}</p>}
              </div>
              {/* 이메일 */}
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Mail className="h-3 w-3" /> 이메일</label>
                <p className="flex items-center gap-1.5 text-xs text-white/70">{user?.email}<span className="flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] text-green-400"><Check className="h-2.5 w-2.5" /> 인증됨</span></p>
              </div>
              {/* 연락처 */}
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Phone className="h-3 w-3" /> 연락처</label>
                {editMode ? <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none focus:border-amber-400/30" />
                  : <p className="text-xs text-white/70">{phone || '미설정'}</p>}
              </div>
              {/* 산업군 */}
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Building2 className="h-3 w-3" /> 산업군</label>
                {editMode ? (
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map((ind) => (
                      <button key={ind} onClick={() => setIndustry(ind)} className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                        style={{ background: industry === ind ? 'rgba(255,217,61,0.12)' : 'transparent', borderColor: industry === ind ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.1)', color: industry === ind ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>{ind}</button>
                    ))}
                  </div>
                ) : <p className="text-xs text-white/70">{industry || '미설정'}</p>}
              </div>
              {/* 직무 */}
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Briefcase className="h-3 w-3" /> 직무</label>
                {editMode ? (
                  <div className="flex flex-wrap gap-1.5">
                    {JOB_FUNCTIONS.map((job) => (
                      <button key={job} onClick={() => setJobFunction(job)} className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                        style={{ background: jobFunction === job ? 'rgba(255,217,61,0.12)' : 'transparent', borderColor: jobFunction === job ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.1)', color: jobFunction === job ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>{job}</button>
                    ))}
                  </div>
                ) : <p className="text-xs text-white/70">{jobFunction || '미설정'}</p>}
              </div>
              {/* 관심사 */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Tag className="h-3 w-3" /> 관심사</label>
                {editMode ? (
                  <div className="flex flex-wrap gap-1.5">
                    {EXPECTATIONS.map((exp) => {
                      const selected = interests.includes(exp);
                      return <button key={exp} onClick={() => handleToggleInterest(exp)} className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                        style={{ background: selected ? 'rgba(255,217,61,0.12)' : 'transparent', borderColor: selected ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.1)', color: selected ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>{exp}</button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {interests.length > 0 ? interests.map((i) => <span key={i} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/50">{i}</span>)
                      : <p className="text-xs text-white/40">미설정</p>}
                  </div>
                )}
              </div>
            </div>

            {/* 이메일 인증 플로우 */}
            {verifyStep === 'confirm' && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="mb-2 flex items-center gap-2"><Shield className="h-4 w-4 text-amber-400" /><span className="text-xs font-semibold text-amber-400">프로필 변경 인증</span></div>
                <p className="mb-1 text-[11px] text-white/60">프로필 정보 변경을 위해 본인 인증이 필요합니다.</p>
                <p className="mb-4 text-[11px] text-white/40">가입 이메일 <span className="font-medium text-white/60">{user?.email}</span> 로 인증 코드를 보내드립니다.</p>
                <div className="flex gap-2">
                  <button onClick={() => setVerifyStep('idle')} className="flex-1 rounded-lg border border-white/10 bg-transparent py-2.5 text-xs text-white/40">취소</button>
                  <button onClick={handleSendCode} className="flex-1 rounded-lg border-none py-2.5 text-xs font-semibold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}><Mail className="mr-1.5 inline h-3.5 w-3.5" />인증 코드 보내기</button>
                </div>
              </div>
            )}
            {verifyStep === 'sending' && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-center">
                <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" /><p className="text-xs text-white/50">인증 코드를 발송하고 있습니다...</p>
              </div>
            )}
            {verifyStep === 'input' && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="mb-2 flex items-center gap-2"><Mail className="h-4 w-4 text-amber-400" /><span className="text-xs font-semibold text-amber-400">인증 코드 발송 완료</span></div>
                <p className="mb-1 text-[11px] text-white/60"><span className="font-medium text-white/70">{user?.email}</span> 로 인증 코드를 보냈습니다.</p>
                <p className="mb-4 text-[10px] text-white/30">메일함에서 인증 코드 6자리를 확인 후 아래에 입력해주세요.</p>
                <div className="mb-3">
                  <input value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value.replace(/[^0-9]/g, '')); setVerifyError(''); }}
                    placeholder="인증 코드 6자리 입력" maxLength={6} inputMode="numeric"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center text-base font-bold tracking-[0.3em] text-white/90 outline-none focus:border-amber-400/40" />
                  {verifyError && <p className="mt-1.5 text-[11px] text-red-400">{verifyError}</p>}
                </div>
                <button onClick={handleVerifyAndSave} disabled={verificationCode.length < 6}
                  className="mb-3 w-full rounded-lg border-none py-2.5 text-xs font-semibold transition-opacity disabled:opacity-30" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>변경 확인</button>
                <div className="flex items-center justify-between text-[10px]">
                  <button onClick={() => setVerifyStep('idle')} className="text-white/30 hover:text-white/50">취소</button>
                  <button onClick={handleSendCode} disabled={codeResendCooldown > 0} className="text-white/30 hover:text-white/50 disabled:opacity-30">
                    {codeResendCooldown > 0 ? `재발송 (${codeResendCooldown}초)` : '인증 코드 재발송'}
                  </button>
                </div>
              </div>
            )}
            {verifyStep === 'verifying' && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-center">
                <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" /><p className="text-xs text-white/50">인증 확인 중...</p>
              </div>
            )}

            <button onClick={() => { logout(); router.push('/badak'); }}
              className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-xs text-red-400/70 hover:bg-white/[0.06]">
              <LogOut className="h-4 w-4" /> 로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
