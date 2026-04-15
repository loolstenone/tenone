'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import {
  FileText, Bookmark, Bell, Settings, LogOut,
  ChevronRight, ChevronDown, Eye, MessageCircle, Heart,
  Shield, Mail, Phone, Briefcase, Building2, Tag,
  Check, X, Crown, Users, CalendarDays, MapPin,
  UserCheck, UserX, Clock, Megaphone,
  ToggleLeft, ToggleRight, UserPlus, Pencil,
} from 'lucide-react';

type TabType = 'mygroups' | 'posts' | 'bookmarks' | 'connections' | 'talks' | 'notifications' | 'settings';
type ApplicantStatus = 'pending' | 'approved' | 'rejected';

// ── 이력 항목 ──
interface CareerEntry {
  id: string;
  company: string;   // 회사/조직
  title: string;     // 직함
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
  description: string; // 역할과 업적
}
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

// ── StatusBadge ──
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

// ── GroupManageCard ──
function GroupManageCard({
  group,
  onUpdate,
  onApplicantAction,
  onToggleJoinType,
}: {
  group: MyGroup;
  onUpdate: (g: MyGroup) => void;
  onApplicantAction?: (groupId: string, membershipId: string, action: 'approved' | 'rejected') => Promise<void>;
  onToggleJoinType?: (groupId: string, newType: JoinType) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'applicants' | 'members' | 'notice'>('applicants');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [togglingJoinType, setTogglingJoinType] = useState(false);
  const pendingCount = group.applicants.filter((a) => a.status === 'pending').length;
  const remaining = group.maxMembers - group.currentMembers;

  const handleApplicantAction = async (applicantId: string, action: ApplicantStatus) => {
    if (action !== 'approved' && action !== 'rejected') return;
    setProcessingId(applicantId);
    if (onApplicantAction) {
      await onApplicantAction(group.id, applicantId, action);
    } else {
      const updated = {
        ...group,
        applicants: group.applicants.map((a) => a.id === applicantId ? { ...a, status: action } : a),
        currentMembers: action === 'approved' ? group.currentMembers + 1 : group.currentMembers,
      };
      onUpdate(updated);
    }
    setProcessingId(null);
  };

  const toggleJoinType = async () => {
    const newType: JoinType = group.joinType === 'approval' ? 'firstcome' : 'approval';
    setTogglingJoinType(true);
    if (onToggleJoinType) {
      await onToggleJoinType(group.id, newType);
    } else {
      // fallback: 로컬만 변경
      onUpdate({ ...group, joinType: newType });
    }
    setTogglingJoinType(false);
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
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
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <span>참여 방식:</span>
              <button
                onClick={toggleJoinType}
                disabled={togglingJoinType}
                className="flex items-center gap-1 text-white/70 disabled:opacity-50"
              >
                {togglingJoinType ? (
                  <span className="text-[11px] text-white/30">변경 중...</span>
                ) : group.joinType === 'approval' ? (
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

          {activeSection === 'applicants' && (
            <div className="p-3 space-y-2">
              {group.applicants.length === 0 ? (
                <p className="py-6 text-center text-xs text-white/25">지원자가 없습니다</p>
              ) : (
                <>
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

// ── 심화 프로필 카드 ──
const CAREER_YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);
const CAREER_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const EMPTY_CAREER_FORM = {
  company: '', title: '', startYear: new Date().getFullYear(), startMonth: 1,
  endYear: null as number | null, endMonth: null as number | null,
  isCurrent: false, description: '',
};

function ProfileBoostCard({
  displayName,
  avatarUrl, onAvatarChange,
  bio, setBio,
  experienceYears, setExperienceYears,
  career, setCareer,
  lookingFor, onToggleLookingFor,
  canOffer, onToggleCanOffer,
  instagramUrl, setInstagramUrl,
  facebookUrl, setFacebookUrl,
  linkedinUrl, setLinkedinUrl,
  homepageUrl, setHomepageUrl,
  profilePublic, setProfilePublic,
  openToNeeds, setOpenToNeeds,
  openToPartner, setOpenToPartner,
  openToNetwork, setOpenToNetwork,
  onSave, saving,
}: {
  displayName: string;
  avatarUrl: string | null; onAvatarChange: (v: string | null) => void;
  bio: string; setBio: (v: string) => void;
  experienceYears: number | null; setExperienceYears: (v: number) => void;
  career: CareerEntry[]; setCareer: (v: CareerEntry[]) => void;
  lookingFor: string[]; onToggleLookingFor: (v: string) => void;
  canOffer: string[]; onToggleCanOffer: (v: string) => void;
  instagramUrl: string; setInstagramUrl: (v: string) => void;
  facebookUrl: string; setFacebookUrl: (v: string) => void;
  linkedinUrl: string; setLinkedinUrl: (v: string) => void;
  homepageUrl: string; setHomepageUrl: (v: string) => void;
  profilePublic: boolean; setProfilePublic: (v: boolean) => void;
  openToNeeds: boolean; setOpenToNeeds: (v: boolean) => void;
  openToPartner: boolean; setOpenToPartner: (v: boolean) => void;
  openToNetwork: boolean; setOpenToNetwork: (v: boolean) => void;
  onSave: () => void; saving: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCareerForm, setShowCareerForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [careerForm, setCareerForm] = useState({ ...EMPTY_CAREER_FORM });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 개인 입력 — 원하는 것 / 줄 수 있는 것 (프리셋에 없는 자유 입력)
  const [lookingForInput, setLookingForInput] = useState('');
  const [canOfferInput, setCanOfferInput] = useState('');
  const MAX_CUSTOM_LEN = 20;
  const addCustomItem = (raw: string, current: string[], onToggle: (v: string) => void) => {
    const trimmed = raw.trim().slice(0, MAX_CUSTOM_LEN);
    if (!trimmed) return;
    if (current.includes(trimmed)) return; // 중복 방지
    onToggle(trimmed);
  };
  const customLookingFor = lookingFor.filter((v) => !EXPECTATIONS.includes(v));
  const customCanOffer = canOffer.filter((v) => !EXPECTATIONS.includes(v));

  const hasData = !!(avatarUrl || bio || experienceYears !== null || lookingFor.length > 0 || canOffer.length > 0 || career.length > 0);

  const formatPeriod = (c: CareerEntry) => {
    const s = `${c.startYear}.${String(c.startMonth).padStart(2, '0')}`;
    const e = c.isCurrent ? '현재' : c.endYear ? `${c.endYear}.${String(c.endMonth ?? 1).padStart(2, '0')}` : '현재';
    return `${s} ~ ${e}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('1MB 이하 이미지만 가능합니다'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) onAvatarChange(ev.target.result as string); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const openCareerForm = (entry?: CareerEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setCareerForm({ company: entry.company, title: entry.title, startYear: entry.startYear, startMonth: entry.startMonth, endYear: entry.endYear, endMonth: entry.endMonth, isCurrent: entry.isCurrent, description: entry.description });
    } else {
      setEditingId(null);
      setCareerForm({ ...EMPTY_CAREER_FORM });
    }
    setShowCareerForm(true);
  };

  const submitCareer = () => {
    if (!careerForm.company.trim() || !careerForm.title.trim()) return;
    if (editingId) {
      setCareer(career.map(c => c.id === editingId ? { ...careerForm, id: editingId } : c));
    } else {
      setCareer([...career, { ...careerForm, id: Date.now().toString() }]);
    }
    setShowCareerForm(false);
    setEditingId(null);
    setCareerForm({ ...EMPTY_CAREER_FORM });
  };

  const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none focus:border-amber-400/30";
  const selectCls = "rounded-lg border border-white/10 bg-[#1a1a2e] px-2 py-1.5 text-xs text-white/70 outline-none";

  return (
    <>
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: hasData ? 'rgba(255,217,61,0.2)' : 'rgba(255,255,255,0.08)', background: hasData ? 'rgba(255,217,61,0.03)' : 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'rgba(255,217,61,0.1)' }}>
            <Crown className="h-4 w-4" style={{ color: '#ffd93d' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: hasData ? '#ffd93d' : 'rgba(255,255,255,0.6)' }}>
              {hasData ? '프로필 완성됨' : '프로필 보강하기'}
            </p>
            <p className="text-[11px] text-white/30">
              {hasData ? '사진·이력·소개가 등록되어 있어요' : '사진과 이력을 채워 나를 소개해보세요 (선택)'}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t px-4 pb-5 pt-4 space-y-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

          {/* ── 프로필 사진 ── */}
          <div>
            <label className="mb-3 flex items-center gap-1.5 text-[11px] text-white/40">프로필 사진</label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
                    style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-white/60 hover:border-white/30 transition-colors"
                >
                  사진 변경
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => onAvatarChange(null)}
                    className="rounded-lg border border-white/8 px-3 py-1.5 text-[11px] text-white/30 hover:text-red-400 transition-colors"
                  >
                    제거
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* ── 경력 연차 ── */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><Briefcase className="h-3 w-3" /> 경력 연차</label>
            <div className="flex flex-wrap gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yr) => (
                <button key={yr} onClick={() => setExperienceYears(yr)}
                  className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                  style={{ background: experienceYears === yr ? 'rgba(255,217,61,0.12)' : 'transparent', borderColor: experienceYears === yr ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.1)', color: experienceYears === yr ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>
                  {yr === 0 ? '신입' : `${yr}년차`}
                </button>
              ))}
              <button onClick={() => setExperienceYears(11)}
                className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                style={{ background: (experienceYears ?? -1) >= 11 ? 'rgba(255,217,61,0.12)' : 'transparent', borderColor: (experienceYears ?? -1) >= 11 ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.1)', color: (experienceYears ?? -1) >= 11 ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>
                10년차+
              </button>
            </div>
          </div>

          {/* ── 한 줄 소개 ── */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40"><FileText className="h-3 w-3" /> 한 줄 소개</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              placeholder="나를 한마디로 소개해보세요. 모임에서 어떤 사람인지 알 수 있어요."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none focus:border-amber-400/30 resize-none" />
          </div>

          {/* ── 이력 ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] text-white/40"><Briefcase className="h-3 w-3" /> 이력</label>
              <button
                type="button"
                onClick={() => openCareerForm()}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-white/50 hover:border-amber-400/30 hover:text-amber-400 transition-colors"
              >
                + 이력 추가
              </button>
            </div>

            {/* 이력 목록 */}
            {career.length > 0 && (
              <div className="mb-3 space-y-2">
                {career.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-white/8 px-3 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white/80">{c.company}</div>
                        <div className="text-[11px] text-amber-400/70">{c.title}</div>
                        <div className="mt-0.5 text-[10px] text-white/30">{formatPeriod(c)}</div>
                        {c.description && (
                          <p className="mt-1.5 text-[11px] leading-relaxed text-white/40 line-clamp-2">{c.description}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openCareerForm(c)}
                          className="rounded p-1 text-white/20 hover:text-amber-400 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCareer(career.filter(x => x.id !== c.id))}
                          className="rounded p-1 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 이력 추가/수정 폼 */}
            {showCareerForm && (
              <div className="rounded-xl border border-amber-400/15 px-4 py-4 space-y-3" style={{ background: 'rgba(255,217,61,0.03)' }}>
                <p className="text-[11px] font-semibold text-amber-400/60">{editingId ? '이력 수정' : '이력 추가'}</p>

                <input
                  placeholder="회사/조직"
                  value={careerForm.company}
                  onChange={(e) => setCareerForm(f => ({ ...f, company: e.target.value }))}
                  className={inputCls}
                />
                <input
                  placeholder="직함 (예: 마케팅 매니저)"
                  value={careerForm.title}
                  onChange={(e) => setCareerForm(f => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />

                {/* 시작 연월 */}
                <div>
                  <div className="mb-1 text-[10px] text-white/30">시작</div>
                  <div className="flex gap-2">
                    <select value={careerForm.startYear} onChange={(e) => setCareerForm(f => ({ ...f, startYear: Number(e.target.value) }))} className={selectCls}>
                      {CAREER_YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select value={careerForm.startMonth} onChange={(e) => setCareerForm(f => ({ ...f, startMonth: Number(e.target.value) }))} className={selectCls}>
                      {CAREER_MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
                    </select>
                  </div>
                </div>

                {/* 현재 여부 + 종료 연월 */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] text-white/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={careerForm.isCurrent}
                      onChange={(e) => setCareerForm(f => ({ ...f, isCurrent: e.target.checked, endYear: e.target.checked ? null : f.endYear, endMonth: e.target.checked ? null : f.endMonth }))}
                      className="accent-amber-400"
                    />
                    현재 재직/활동 중
                  </label>
                  {!careerForm.isCurrent && (
                    <div>
                      <div className="mb-1 text-[10px] text-white/30">종료</div>
                      <div className="flex gap-2">
                        <select value={careerForm.endYear ?? new Date().getFullYear()} onChange={(e) => setCareerForm(f => ({ ...f, endYear: Number(e.target.value) }))} className={selectCls}>
                          {CAREER_YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                        </select>
                        <select value={careerForm.endMonth ?? 1} onChange={(e) => setCareerForm(f => ({ ...f, endMonth: Number(e.target.value) }))} className={selectCls}>
                          {CAREER_MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 역할과 업적 */}
                <textarea
                  placeholder="역할과 업적 (선택)"
                  value={careerForm.description}
                  onChange={(e) => setCareerForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none focus:border-amber-400/30 resize-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={submitCareer}
                    disabled={!careerForm.company.trim() || !careerForm.title.trim()}
                    className="flex-1 rounded-xl py-2 text-xs font-semibold disabled:opacity-40 transition-colors"
                    style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                  >
                    {editingId ? '수정 완료' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCareerForm(false); setEditingId(null); }}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/40"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 원하는 것 ── */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs text-white/55">
              원하는 것 <span className="text-white/30">(모임에서 얻고 싶은 것)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXPECTATIONS.map((exp) => {
                const sel = lookingFor.includes(exp);
                return (
                  <button
                    key={exp}
                    onClick={() => onToggleLookingFor(exp)}
                    className="rounded-full border px-3 py-1.5 text-[11.5px] transition-colors"
                    style={{
                      background: sel ? 'rgba(96,165,250,0.12)' : 'transparent',
                      borderColor: sel ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.1)',
                      color: sel ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {exp}
                  </button>
                );
              })}
              {/* 개인 입력 커스텀 태그 */}
              {customLookingFor.map((exp) => (
                <button
                  key={exp}
                  onClick={() => onToggleLookingFor(exp)}
                  className="group inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px]"
                  style={{
                    background: 'rgba(96,165,250,0.18)',
                    borderColor: 'rgba(96,165,250,0.4)',
                    color: '#93c5fd',
                  }}
                  title="클릭하면 제거"
                >
                  {exp}
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={lookingForInput}
                onChange={(e) => setLookingForInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addCustomItem(lookingForInput, lookingFor, onToggleLookingFor);
                    setLookingForInput('');
                  }
                }}
                maxLength={MAX_CUSTOM_LEN}
                placeholder="직접 입력 (Enter 또는 ,)"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-blue-400/40"
              />
              <button
                type="button"
                onClick={() => {
                  addCustomItem(lookingForInput, lookingFor, onToggleLookingFor);
                  setLookingForInput('');
                }}
                className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] font-semibold text-white/60 hover:border-blue-400/30 hover:text-blue-300"
              >
                추가
              </button>
            </div>
          </div>

          {/* 줄 수 있는 것 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs text-white/55">
              줄 수 있는 것 <span className="text-white/30">(다른 멤버에게 도움이 될 것)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXPECTATIONS.map((exp) => {
                const sel = canOffer.includes(exp);
                return (
                  <button
                    key={exp}
                    onClick={() => onToggleCanOffer(exp)}
                    className="rounded-full border px-3 py-1.5 text-[11.5px] transition-colors"
                    style={{
                      background: sel ? 'rgba(74,222,128,0.12)' : 'transparent',
                      borderColor: sel ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)',
                      color: sel ? '#86efac' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {exp}
                  </button>
                );
              })}
              {/* 개인 입력 커스텀 태그 */}
              {customCanOffer.map((exp) => (
                <button
                  key={exp}
                  onClick={() => onToggleCanOffer(exp)}
                  className="group inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px]"
                  style={{
                    background: 'rgba(74,222,128,0.18)',
                    borderColor: 'rgba(74,222,128,0.4)',
                    color: '#86efac',
                  }}
                  title="클릭하면 제거"
                >
                  {exp}
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={canOfferInput}
                onChange={(e) => setCanOfferInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addCustomItem(canOfferInput, canOffer, onToggleCanOffer);
                    setCanOfferInput('');
                  }
                }}
                maxLength={MAX_CUSTOM_LEN}
                placeholder="직접 입력 (Enter 또는 ,)"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-green-400/40"
              />
              <button
                type="button"
                onClick={() => {
                  addCustomItem(canOfferInput, canOffer, onToggleCanOffer);
                  setCanOfferInput('');
                }}
                className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] font-semibold text-white/60 hover:border-green-400/30 hover:text-green-300"
              >
                추가
              </button>
            </div>
          </div>

          {/* ── 소셜 / 홈페이지 URL ── */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs text-white/55">
              소셜 / 홈페이지 <span className="text-white/30">(선택)</span>
            </label>
            <div className="space-y-2">
              {[
                { icon: '📷', label: 'Instagram', value: instagramUrl, setter: setInstagramUrl, placeholder: 'https://instagram.com/닉네임' },
                { icon: '👥', label: 'Facebook', value: facebookUrl, setter: setFacebookUrl, placeholder: 'https://facebook.com/아이디' },
                { icon: '💼', label: 'LinkedIn', value: linkedinUrl, setter: setLinkedinUrl, placeholder: 'https://linkedin.com/in/아이디' },
                { icon: '🌐', label: '홈페이지', value: homepageUrl, setter: setHomepageUrl, placeholder: 'https://your-site.com' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-[11.5px] text-white/45">{s.icon} {s.label}</span>
                  <input
                    type="url"
                    value={s.value}
                    onChange={(e) => s.setter(e.target.value)}
                    placeholder={s.placeholder}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── 탐색 매칭 모드 (누구와 연결되고 싶은가) ── */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs text-white/55">
              탐색에서 나를 노출할 관계 <span className="text-white/30">(니즈와 니즈가 만나 원츠가 돼요)</span>
            </label>
            <div className="space-y-2">
              {[
                {
                  key: 'needs',
                  label: '같은 니즈',
                  desc: '나와 같은 니즈를 가진 사람과 연결',
                  checked: openToNeeds,
                  setter: setOpenToNeeds,
                  color: '#fbbf24',
                },
                {
                  key: 'partner',
                  label: '상호 보완 (파트너)',
                  desc: '내가 원하는 것 ↔ 상대가 줄 수 있는 것 매칭',
                  checked: openToPartner,
                  setter: setOpenToPartner,
                  color: '#60a5fa',
                },
                {
                  key: 'network',
                  label: '업계 네트워킹',
                  desc: '같은 산업 · 직무 피어',
                  checked: openToNetwork,
                  setter: setOpenToNetwork,
                  color: '#86efac',
                },
              ].map((m) => (
                <label
                  key={m.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors"
                  style={{
                    background: m.checked ? `${m.color}11` : 'rgba(255,255,255,0.03)',
                    borderColor: m.checked ? `${m.color}40` : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={m.checked}
                    onChange={(e) => m.setter(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ accentColor: m.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-white/85">{m.label}</div>
                    <div className="mt-0.5 text-[11.5px] text-white/45">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── 프로필 정보 공개 여부 ── */}
          <div
            className="rounded-xl border px-4 py-3.5"
            style={{
              background: profilePublic ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
              borderColor: profilePublic ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={(e) => setProfilePublic(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-green-400"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-white/80">
                  프로필 정보 공개
                </div>
                <div className="mt-1 text-[11.5px] leading-relaxed text-white/45">
                  {profilePublic
                    ? '다른 바닥 멤버가 내 프로필(자기소개·경력·원하는 것·SNS 주소)을 볼 수 있어요.'
                    : '내 이름과 아바타만 공개됩니다. 경력·SNS·상세 정보는 숨겨져요.'}
                </div>
                <ul className="mt-2 space-y-0.5 text-[11px] text-white/35">
                  <li>• 자기소개 · 한줄소개</li>
                  <li>• 경력 이력 (HeRo Time)</li>
                  <li>• 원하는 것 / 줄 수 있는 것 태그</li>
                  <li>• SNS / 홈페이지 주소</li>
                </ul>
              </div>
            </label>
          </div>

          {/* ── 버튼 행 ── */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-white/50 hover:border-amber-400/20 hover:text-amber-400 transition-colors"
            >
              미리보기
            </button>
            <button onClick={onSave} disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
              {saving ? '저장 중...' : '프로필 저장'}
            </button>
          </div>
        </div>
      )}
    </div>

    {/* ── 미리보기 모달 ── */}
    {showPreview && (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center" onClick={() => setShowPreview(false)}>
        <div className="absolute inset-0 bg-black/70" />
        <div
          className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl px-6 py-7 mx-0 sm:mx-4"
          style={{ background: '#1e1e36', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400/60">간략 프로필 미리보기</span>
            <button onClick={() => setShowPreview(false)} className="p-1 text-white/30 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 아바타 + 이름 */}
          <div className="flex items-center gap-4 mb-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
                style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                {displayName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-white/90">{displayName || '이름 없음'}</div>
              {experienceYears !== null && (
                <div className="mt-0.5 text-[11px] text-amber-400/60">
                  {experienceYears === 0 ? '신입' : experienceYears >= 11 ? '10년차+' : `${experienceYears}년차`}
                </div>
              )}
            </div>
          </div>

          {/* 한 줄 소개 */}
          {bio && (
            <p className="mb-4 text-xs leading-relaxed text-white/55 border-l-2 border-amber-400/20 pl-3">{bio}</p>
          )}

          {/* 이력 목록 */}
          {career.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-2">이력</div>
              {career.map((c) => (
                <div key={c.id} className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs font-semibold text-white/80">{c.company}</div>
                  <div className="text-[11px] text-amber-400/60">{c.title}</div>
                  <div className="mt-0.5 text-[10px] text-white/25">{formatPeriod(c)}</div>
                </div>
              ))}
            </div>
          )}

          {!bio && career.length === 0 && (
            <p className="text-center text-xs text-white/25 py-4">소개와 이력을 채워주세요</p>
          )}
        </div>
      </div>
    )}
    </>
  );
}

// ── 메인 페이지 ──
export default function BadakMyPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('mygroups');
  const [showLogin, setShowLogin] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 설정
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobFunction, setJobFunction] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | null>(null);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [canOffer, setCanOffer] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [career, setCareer] = useState<CareerEntry[]>([]);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [profilePublic, setProfilePublic] = useState(true);
  const [openToNeeds, setOpenToNeeds] = useState(true);
  const [openToPartner, setOpenToPartner] = useState(false);
  const [openToNetwork, setOpenToNetwork] = useState(true);
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

  // 관심 (connections)
  interface ConnectionPeer {
    userId: string; memberId: string | null; displayName: string;
    avatarUrl: string | null; jobFunction: string | null; experienceYears: number | null;
  }
  interface Connection {
    id: string; type: string; status: string; message: string | null;
    wantId: string | null; createdAt: string; respondedAt: string | null;
    peer: ConnectionPeer;
  }
  const [connections, setConnections] = useState<{ sent: Connection[]; received: Connection[] }>({ sent: [], received: [] });
  const [pendingIncomingCount, setPendingIncomingCount] = useState(0);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  // 대화 (talks)
  interface TalkThread {
    id: string; peerUserId: string; peerName: string; peerAvatar: string | null;
    peerJob: string | null; subject: string | null; lastMessagePreview: string | null; lastMessageAt: string | null;
  }
  interface TalkMessage {
    id: string; senderId: string; body: string; readBy: string[]; createdAt: string;
  }
  const [threads, setThreads] = useState<TalkThread[]>([]);
  const [unreadTalkCount, setUnreadTalkCount] = useState(0);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TalkMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [talksLoading, setTalksLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!isLoading && !isAuthenticated) setShowLogin(true); }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const { data: { session } } = await createClient().auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const memberRes = await fetch('/api/badak/member', { headers });
        const memberData = await memberRes.json();
        if (memberData.member) {
          setNickname(memberData.member.display_name || user.name || '');
          setPhone(memberData.member.phone || '');
          setIndustry(memberData.member.industry || '');
          setJobFunction(memberData.member.job_function || '');
          setInterests(memberData.member.interests || []);
          setBio(memberData.member.bio || '');
          setExperienceYears(memberData.member.experience_years ?? null);
          setLookingFor(memberData.member.looking_for || []);
          setCanOffer(memberData.member.can_offer || []);
          setAvatarUrl(memberData.member.avatar_url || null);
          setCareer(memberData.member.career || []);
          setInstagramUrl(memberData.member.instagram_url || '');
          setFacebookUrl(memberData.member.facebook_url || '');
          setLinkedinUrl(memberData.member.linkedin_url || '');
          setHomepageUrl(memberData.member.homepage_url || '');
          setProfilePublic(memberData.member.profile_public !== false);
          setOpenToNeeds(memberData.member.open_to_needs !== false);
          setOpenToPartner(memberData.member.open_to_partner === true);
          setOpenToNetwork(memberData.member.open_to_network !== false);
          setMemberRole(memberData.member.role || 'member');
        } else {
          setNickname(user.name || '');
        }

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

        const notiRes = await fetch('/api/badak/notifications', { headers });
        const notiData = await notiRes.json();
        setNotifications(notiData.notifications || []);
        setUnreadCount(notiData.unreadCount || 0);

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

        const myGroupsRes = await fetch('/api/badak/my/groups', { headers });
        const myGroupsData = await myGroupsRes.json();
        setMyGroups(myGroupsData.ledGroups || []);
        setJoinedGroups(myGroupsData.joinedGroups || []);

        // 관심 (connections)
        setConnectionsLoading(true);
        try {
          const connRes = await fetch('/api/badak/connections', { headers });
          const connData = await connRes.json();
          setConnections({ sent: connData.sent || [], received: connData.received || [] });
          const pending = (connData.received || []).filter((c: { status: string }) => c.status === 'pending').length;
          setPendingIncomingCount(pending);
        } catch { /* silent */ } finally { setConnectionsLoading(false); }

        // 대화 (talks)
        setTalksLoading(true);
        try {
          const talksRes = await fetch('/api/badak/talks', { headers });
          const talksData = await talksRes.json();
          setThreads(talksData.threads || []);
          setUnreadTalkCount(talksData.unreadTotal ?? 0);
        } catch { /* silent */ } finally { setTalksLoading(false); }
      } catch {
        setNickname(user.name || '');
        setMyPostsLoading(false);
        setBookmarksLoading(false);
        setConnectionsLoading(false);
        setTalksLoading(false);
      }
    })();
  }, [user]);

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a2e] px-6">
      <Shield className="mx-auto mb-4 h-10 w-10 text-white/30" />
      <p className="mb-4 text-sm text-white/50">로그인이 필요합니다</p>
      <button onClick={() => setShowLogin(true)} className="rounded-xl border-none px-6 py-2.5 text-sm font-semibold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>로그인</button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );

  const initials = nickname?.substring(0, 1) || user?.name?.substring(0, 1) || '?';
  const displayName = nickname || user?.name || '회원';
  const pendingApplicants = myGroups.reduce((sum, g) => sum + g.applicants.filter((a) => a.status === 'pending').length, 0);
  const totalGroupCount = myGroups.length + joinedGroups.length;

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
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (session) {
        await fetch('/api/badak/member', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ displayName: nickname, phone, industry, jobFunction, interests, bio, experienceYears, lookingFor, canOffer, avatarUrl, career, instagramUrl, facebookUrl, linkedinUrl, homepageUrl, profilePublic, openToNeeds, openToPartner, openToNetwork }),
        });
      }
      setSaveSuccess(true); setVerifyStep('idle'); setEditMode(false); setVerificationCode('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setVerifyError('네트워크 오류가 발생했습니다.');
      setVerifyStep('input');
    }
  };
  const handleToggleLookingFor = (item: string) => setLookingFor((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);
  const handleToggleCanOffer = (item: string) => setCanOffer((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);
  const handleCancelEdit = () => { setEditMode(false); setVerifyStep('idle'); setVerificationCode(''); setVerifyError(''); };

  // 스레드 메시지 로드 + 폴링
  useEffect(() => {
    if (!activeThreadId || !user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const { data: { session } } = await createClient().auth.getSession();
        if (!session || cancelled) return;
        const res = await fetch(`/api/badak/talks/${activeThreadId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (!cancelled) {
          setMessages(data.messages || []);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      } catch { /* silent */ }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeThreadId, user]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeThreadId || sendingMessage) return;
    setSendingMessage(true);
    const text = messageText.trim();
    setMessageText('');
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/badak/talks/${activeThreadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } catch { setMessageText(text); } finally { setSendingMessage(false); }
  };

  const handleConnectionRespond = async (id: string, status: 'accepted' | 'declined' | 'blocked') => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) return;
      const res = await fetch('/api/badak/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setConnections((prev) => ({
          ...prev,
          received: prev.received.map((c) => c.id === id ? { ...c, status } : c),
        }));
        setPendingIncomingCount((p) => Math.max(0, p - 1));
        // 수락 시 대화 탭으로 이동 + 스레드 열기
        if (status === 'accepted' && data.threadId) {
          setActiveTab('talks');
          // 스레드 목록 새로고침
          const talksRes = await fetch('/api/badak/talks', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const talksData = await talksRes.json();
          setThreads(talksData.threads || []);
          setActiveThreadId(data.threadId);
        }
      }
    } catch { /* silent */ }
  };

  const handleGroupUpdate = (updated: MyGroup) => {
    setMyGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
  };

  const handleToggleJoinType = async (groupId: string, newType: JoinType) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/badak/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ join_type: newType }),
      });
      if (res.ok) {
        setMyGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, joinType: newType } : g));
      }
    } catch {
      // silent fail — 로컬 반영만
      setMyGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, joinType: newType } : g));
    }
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

  // ── 탭 정의 ──
  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: 'mygroups', label: '내 모임', badge: pendingApplicants },
    { id: 'posts', label: '내 글' },
    { id: 'connections', label: '관심', badge: pendingIncomingCount },
    { id: 'talks', label: '대화', badge: unreadTalkCount },
    { id: 'bookmarks', label: '북마크' },
    { id: 'notifications', label: '알림', badge: unreadCount },
    { id: 'settings', label: '설정' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">

      {/* ── 프로필 헤더 (트레바리 스타일: 중앙 정렬) ── */}
      <div className="px-4 pb-6 pt-8 text-center" style={{ background: 'linear-gradient(180deg, rgba(255,217,61,0.04) 0%, transparent 100%)' }}>
        {/* 아바타 */}
        <div className="relative inline-block mb-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" style={{ border: '2px solid rgba(255,217,61,0.2)' }} />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d', border: '2px solid rgba(255,217,61,0.2)' }}
            >
              {initials}
            </div>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/10"
            style={{ background: '#1e1e35' }}
          >
            <Pencil className="h-3 w-3 text-white/50" />
          </button>
        </div>

        {/* 이름 + 뱃지 */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-lg font-bold text-white">{displayName}</h1>
          {isLeader && (
            <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
              <Crown className="h-2.5 w-2.5" /> 바닥장
            </span>
          )}
        </div>
        {/* 직무 + 산업 */}
        <p className="text-xs text-white/40">
          {[jobFunction, industry].filter(Boolean).join(' · ') || '직무/산업군을 설정해보세요'}
        </p>
      </div>

      {/* ── 스탯 스트립 ── */}
      <div className="mx-4 mb-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="flex divide-x divide-white/6">
          {[
            { label: '내 모임', value: totalGroupCount },
            { label: '작성한 글', value: myPosts.length },
            { label: '북마크', value: bookmarks.length },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 py-4 text-center">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="mt-0.5 text-[10px] text-white/35">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 탭 바 (트레바리 언더라인 스타일) ── */}
      <div className="sticky top-14 z-30 border-b border-white/6" style={{ background: '#1a1a2e' }}>
        <div className="scrollbar-hide flex overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex shrink-0 items-center gap-1 px-4 py-3.5 text-[13px] font-medium transition-colors"
                style={{ color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: '#ffd93d' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">

        {/* ── 내 모임 ── */}
        {activeTab === 'mygroups' && (
          <div className="space-y-4">
            {/* 개설한 모임 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  개설한 모임
                  {pendingApplicants > 0 && <span className="ml-2 text-amber-400">· 대기 {pendingApplicants}건</span>}
                </h2>
                <button
                  onClick={() => router.push('/badak/groups/create')}
                  className="flex items-center gap-1 rounded-lg border-none px-3 py-1.5 text-[11px] font-semibold"
                  style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d' }}
                >
                  <UserPlus className="h-3 w-3" /> 새 모임 개설
                </button>
              </div>

              {myGroups.length === 0 ? (
                <div className="rounded-2xl border border-white/6 py-12 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(255,217,61,0.08)' }}>
                    <Crown className="h-6 w-6 text-amber-400/40" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-white/40">아직 개설한 모임이 없어요</p>
                  <p className="mb-4 text-xs text-white/20">같은 니즈를 가진 사람들을 모아보세요</p>
                  <button
                    onClick={() => router.push('/badak/groups/create')}
                    className="rounded-full border-none px-5 py-2 text-xs font-semibold"
                    style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                  >
                    첫 모임 개설하기
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myGroups.map((group) => (
                    <GroupManageCard
                      key={group.id}
                      group={group}
                      onUpdate={handleGroupUpdate}
                      onApplicantAction={handleApplicantAction}
                      onToggleJoinType={handleToggleJoinType}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 참여 중인 모임 */}
            <div>
              <h2 className="mb-3 text-xs font-semibold text-white/40 uppercase tracking-wider">참여 중인 모임</h2>
              {joinedGroups.length === 0 ? (
                <div className="rounded-2xl border border-white/6 py-10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    <Users className="h-6 w-6 text-indigo-400/40" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-white/40">참여한 모임이 없어요</p>
                  <p className="mb-4 text-xs text-white/20">바닥 니즈 클라우드에서 모임을 찾아보세요</p>
                  <button
                    onClick={() => router.push('/badak')}
                    className="rounded-full border-none px-5 py-2 text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                  >
                    모임 탐색하러 가기
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {joinedGroups.map((j) => (
                    <div key={j.id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white/80">{j.title}</span>
                          <StatusBadge status={j.myStatus} />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-white/25">
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {j.schedule}</span>
                          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {j.location}</span>
                        </div>
                      </div>
                      {j.nextDate && j.myStatus === 'approved' && (
                        <div className="text-right">
                          <div className="text-[10px] text-white/30">다음 모임</div>
                          <div className="text-xs font-semibold text-green-400">{j.nextDate}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 관심 (connections) ── */}
        {activeTab === 'connections' && (
          <div className="space-y-5">
            {connectionsLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            ) : (
              <>
                {/* 받은 제안 */}
                <div>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                    받은 제안
                    {pendingIncomingCount > 0 && <span className="ml-2 text-amber-400">· 대기 {pendingIncomingCount}건</span>}
                  </h2>
                  {connections.received.length === 0 ? (
                    <div className="rounded-2xl border border-white/6 py-10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <Heart className="mx-auto mb-3 h-8 w-8 text-white/10" />
                      <p className="text-sm text-white/30">받은 제안이 없어요</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connections.received.map((c) => (
                        <div key={c.id} className="rounded-xl border border-white/6 bg-white/[0.03] p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d' }}>
                              {c.peer.displayName.substring(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white/90">{c.peer.displayName}</span>
                                <span className="rounded-full px-2 py-0.5 text-[10px]" style={{
                                  background: c.type === 'partner' ? 'rgba(99,102,241,0.15)' : c.type === 'network' ? 'rgba(34,197,94,0.12)' : 'rgba(255,217,61,0.12)',
                                  color: c.type === 'partner' ? '#a5b4fc' : c.type === 'network' ? '#4ade80' : '#ffd93d',
                                }}>
                                  {c.type === 'partner' ? '파트너' : c.type === 'network' ? '네트워킹' : '관심'}
                                </span>
                                <StatusBadge status={c.status} />
                              </div>
                              <p className="text-[11px] text-white/35">{c.peer.jobFunction || '직무 미설정'}</p>
                            </div>
                          </div>
                          {c.message && (
                            <p className="mb-3 rounded-lg px-3 py-2 text-xs text-white/60" style={{ background: 'rgba(255,255,255,0.04)' }}>
                              &ldquo;{c.message}&rdquo;
                            </p>
                          )}
                          {c.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConnectionRespond(c.id, 'accepted')}
                                className="flex-1 rounded-lg py-2 text-xs font-semibold"
                                style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                              >
                                수락하기
                              </button>
                              <button
                                onClick={() => handleConnectionRespond(c.id, 'declined')}
                                className="rounded-lg px-4 py-2 text-xs text-white/30 hover:text-white/50"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                              >
                                거절
                              </button>
                            </div>
                          )}
                          {c.status === 'accepted' && (
                            <button
                              onClick={() => { setActiveTab('talks'); }}
                              className="w-full rounded-lg py-2 text-xs font-semibold"
                              style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
                            >
                              대화 보기
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 보낸 제안 */}
                <div>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">보낸 제안</h2>
                  {connections.sent.length === 0 ? (
                    <div className="rounded-2xl border border-white/6 py-10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <UserCheck className="mx-auto mb-3 h-8 w-8 text-white/10" />
                      <p className="mb-1 text-sm text-white/30">보낸 제안이 없어요</p>
                      <button
                        onClick={() => router.push('/badak/explore')}
                        className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold"
                        style={{ background: 'rgba(255,217,61,0.1)', color: '#ffd93d' }}
                      >
                        탐색하러 가기
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connections.sent.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] p-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                            {c.peer.displayName.substring(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white/80">{c.peer.displayName}</span>
                              <span className="rounded-full px-2 py-0.5 text-[10px]" style={{
                                background: c.type === 'partner' ? 'rgba(99,102,241,0.15)' : c.type === 'network' ? 'rgba(34,197,94,0.12)' : 'rgba(255,217,61,0.12)',
                                color: c.type === 'partner' ? '#a5b4fc' : c.type === 'network' ? '#4ade80' : '#ffd93d',
                              }}>
                                {c.type === 'partner' ? '파트너' : c.type === 'network' ? '네트워킹' : '관심'}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/35">{c.peer.jobFunction || '직무 미설정'}</p>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 대화 (talks) ── */}
        {activeTab === 'talks' && (
          <div>
            {talksLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            ) : threads.length === 0 ? (
              <div className="rounded-2xl border border-white/6 py-16 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-white/10" />
                <p className="mb-1 text-sm font-medium text-white/40">아직 대화가 없어요</p>
                <p className="mb-4 text-xs text-white/20">관심 제안을 수락하면 대화가 시작돼요</p>
                <button
                  onClick={() => setActiveTab('connections')}
                  className="rounded-full px-5 py-2 text-xs font-semibold"
                  style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d' }}
                >
                  제안 확인하기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-0 sm:flex-row sm:gap-4" style={{ minHeight: 480 }}>
                {/* 스레드 목록 */}
                <div className={`sm:w-48 shrink-0 space-y-1 ${activeThreadId ? 'hidden sm:block' : ''}`}>
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveThreadId(t.id)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors"
                      style={{
                        background: activeThreadId === t.id ? 'rgba(255,217,61,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${activeThreadId === t.id ? 'rgba(255,217,61,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d' }}>
                        {t.peerName.substring(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-semibold text-white/80">{t.peerName}</div>
                        {t.lastMessagePreview && (
                          <div className="truncate text-[11px] text-white/30">{t.lastMessagePreview}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 메시지 영역 */}
                {activeThreadId ? (
                  <div className="flex flex-1 flex-col rounded-2xl border border-white/6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {/* 헤더 */}
                    <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
                      <button onClick={() => setActiveThreadId(null)} className="sm:hidden mr-1 text-white/40 hover:text-white/60">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>
                      <span className="text-sm font-semibold text-white/80">
                        {threads.find((t) => t.id === activeThreadId)?.peerName || '대화'}
                      </span>
                      <span className="text-[11px] text-white/30">
                        {threads.find((t) => t.id === activeThreadId)?.peerJob || ''}
                      </span>
                    </div>

                    {/* 메시지 목록 */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: 360 }}>
                      {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-xs text-white/20">첫 메시지를 보내보세요</p>
                        </div>
                      ) : messages.map((m) => {
                        const isMine = m.senderId === user?.id;
                        return (
                          <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                              style={{
                                background: isMine ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.06)',
                                color: isMine ? '#ffd93d' : 'rgba(255,255,255,0.8)',
                                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              }}
                            >
                              {m.body}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* 입력창 */}
                    <div className="flex items-center gap-2 border-t border-white/6 px-3 py-3">
                      <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="메시지 입력..."
                        className="flex-1 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendingMessage}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:opacity-30"
                        style={{ background: 'rgba(255,217,61,0.2)', color: '#ffd93d' }}
                      >
                        {sendingMessage ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="hidden sm:flex flex-1 items-center justify-center rounded-2xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-sm text-white/20">대화를 선택해주세요</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 내 글 ── */}
        {activeTab === 'posts' && (
          <div className="space-y-2">
            {myPostsLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            ) : myPosts.length === 0 ? (
              <div className="rounded-2xl border border-white/6 py-16 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <FileText className="h-6 w-6 text-white/20" />
                </div>
                <p className="mb-1 text-sm font-medium text-white/40">작성한 글이 없어요</p>
                <p className="mb-4 text-xs text-white/20">업계 이야기를 나눠보세요</p>
                <button
                  onClick={() => router.push('/badak/community')}
                  className="rounded-full border-none px-5 py-2 text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  커뮤니티 가기
                </button>
              </div>
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
              <div className="flex justify-center py-16">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="rounded-2xl border border-white/6 py-16 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Bookmark className="h-6 w-6 text-white/20" />
                </div>
                <p className="mb-1 text-sm font-medium text-white/40">북마크한 항목이 없어요</p>
                <p className="mb-4 text-xs text-white/20">니즈, 모임, 게시글을 저장해보세요</p>
                <button
                  onClick={() => router.push('/badak')}
                  className="rounded-full border-none px-5 py-2 text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  바닥 탐색하기
                </button>
              </div>
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

        {/* ── 알림 ── */}
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
                <div className="rounded-2xl border border-white/6 py-16 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Bell className="h-6 w-6 text-white/20" />
                  </div>
                  <p className="text-sm font-medium text-white/40">알림이 없어요</p>
                  <p className="mt-1 text-xs text-white/20">모임 참여 신청이 오면 여기서 확인할 수 있어요</p>
                </div>
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

            {/* 심화 프로필 — 바닥장 준비 / 선택 입력 */}
            <ProfileBoostCard
              displayName={nickname}
              avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl}
              bio={bio} setBio={setBio}
              experienceYears={experienceYears} setExperienceYears={setExperienceYears}
              career={career} setCareer={setCareer}
              lookingFor={lookingFor} onToggleLookingFor={handleToggleLookingFor}
              canOffer={canOffer} onToggleCanOffer={handleToggleCanOffer}
              instagramUrl={instagramUrl} setInstagramUrl={setInstagramUrl}
              facebookUrl={facebookUrl} setFacebookUrl={setFacebookUrl}
              linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
              homepageUrl={homepageUrl} setHomepageUrl={setHomepageUrl}
              profilePublic={profilePublic} setProfilePublic={setProfilePublic}
              openToNeeds={openToNeeds} setOpenToNeeds={setOpenToNeeds}
              openToPartner={openToPartner} setOpenToPartner={setOpenToPartner}
              openToNetwork={openToNetwork} setOpenToNetwork={setOpenToNetwork}
              onSave={handleSave}
              saving={verifyStep !== 'idle'}
            />

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

            <button
              onClick={() => { logout(); router.push('/badak'); }}
              className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-xs text-red-400/70 hover:bg-white/[0.06]"
            >
              <LogOut className="h-4 w-4" /> 로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
