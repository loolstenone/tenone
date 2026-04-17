'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { siteConfigs, type SiteIdentifier } from '@/lib/site-config';
import { getAllServiceProfiles, type ServiceProfileData, getBadakActivity, type BadakActivityData, checkHandleAvailable } from '@/lib/supabase/universe-profile';
import { getAllSiteConfigs, type SiteConfigRow } from '@/lib/supabase/site-configs';
import { createClient } from '@/lib/supabase/client';
import { JOB_FUNCTIONS, INDUSTRIES } from '@/lib/badak-constants';
import Image from 'next/image';
import {
    Globe, User, Shield, ExternalLink, Pencil, Check, X, Camera,
    Building2, GraduationCap, Megaphone, Users, Briefcase,
    Sparkles, Palette, BookOpen, Rocket, Zap, Clock, Lock, Eye, EyeOff,
    Share2, Link as LinkIcon, ChevronDown, ChevronUp, CheckCircle2,
    AlertCircle, Plus, Minus,
} from 'lucide-react';

/* ── 전화번호 포맷 ── */
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/* ── 아바타 리사이즈 + WebP 압축 ── */
function resizeAvatar(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            const MAX = 256;
            let w = img.width, h = img.height;
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                blob => blob ? resolve(blob) : reject(new Error('Blob failed')),
                'image/webp', 0.8,
            );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
    });
}

/* ── 접근 모델 ── */
type AccessType = 'open' | 'subscription' | 'purchase' | 'membership' | 'staff' | 'internal';
const ACCESS_LABELS: Record<AccessType, { label: string; color: string }> = {
    open:         { label: '오픈',    color: '#22c55e' },
    subscription: { label: '구독',    color: '#3b82f6' },
    purchase:     { label: '구매',    color: '#f59e0b' },
    membership:   { label: '멤버십', color: '#8b5cf6' },
    staff:        { label: '직원',    color: '#64748b' },
    internal:     { label: '내부',    color: '#94a3b8' },
};

const SERVICE_META: Record<string, { icon: typeof Globe; desc: string; intro: string; access: AccessType; accessDetail?: string }> = {
    ogamja:        { icon: Palette,       desc: '공감 블로그',               intro: '하찮고 귀여운 감자들의 공감 이야기.',                             access: 'open' },
    fwn:           { icon: Globe,         desc: 'Fashion Week Network',     intro: '전 세계 패션 위크를 네트워크로 연결합니다.',                       access: 'open' },
    jakka:         { icon: Palette,       desc: '포토그래퍼 포트폴리오',     intro: '인물, 스튜디오, 스포츠 등 사진 작업 포트폴리오입니다.',            access: 'open' },
    mindle:        { icon: Sparkles,      desc: '데이터·트렌드',             intro: '시장 데이터와 트렌드 인사이트를 제공합니다.',                      access: 'open' },
    montz:         { icon: Palette,       desc: 'MoNTZ 포토그래피',         intro: '개인적이고 상상적인 다양한 사진 촬영 브랜드입니다.',              access: 'open' },
    mullaesian:    { icon: Globe,         desc: '문래동 로컬 프로젝트',      intro: '문래동의 철공소, 골목, 예술가들의 이야기를 기록합니다.',           access: 'open' },
    myverse:       { icon: Sparkles,      desc: 'AI 에이전트 플랫폼',        intro: '나만의 AI 에이전트를 만들고 활용하는 플랫폼입니다.',              access: 'open' },
    namingfactory: { icon: Sparkles,      desc: '네이밍 서비스',             intro: '브랜드, 제품, 서비스의 이름을 짓는 전문 네이밍 서비스입니다.',    access: 'open' },
    rook:          { icon: Palette,       desc: 'AI 크리에이터',             intro: 'AI 기반 콘텐츠 제작과 크리에이티브 워크를 지원합니다.',           access: 'open' },
    seoul360:      { icon: Globe,         desc: '서울/360° 관광 가이드',     intro: '서울 지하철역 주변 관광 명소를 360° 뷰로 안내합니다.',            access: 'open' },
    townity:       { icon: Globe,         desc: '동네 커뮤니티',             intro: '우리 동네 이웃과 연결되는 하이퍼로컬 커뮤니티입니다.',            access: 'open' },
    trendhunter:   { icon: Sparkles,      desc: '트렌드 헌터',               intro: '최신 트렌드를 발굴하고 큐레이션하는 미디어입니다.',               access: 'open' },
    luki:          { icon: Sparkles,      desc: 'AI 아이돌 그룹',            intro: 'AI 기반 엔터테인먼트 프로젝트입니다.',                            access: 'open' },
    evschool:      { icon: GraduationCap, desc: 'Evolution School',         intro: '실무 중심 마케팅·비즈니스 교육 프로그램입니다.',                  access: 'open' },
    brandgravity:  { icon: Palette,       desc: '브랜딩 컨설팅',             intro: '데이터 기반 브랜드 전략 컨설팅 서비스입니다.',                    access: 'subscription' },
    smarcomm:      { icon: Megaphone,     desc: '마케팅 커뮤니케이션',       intro: '마케팅 자동화와 캠페인 관리를 위한 올인원 솔루션입니다.',          access: 'subscription' },
    wio:           { icon: Rocket,        desc: '업무 자동화 솔루션',        intro: '기업 업무를 자동화하는 디지털 솔루션 플랫폼입니다.',              access: 'subscription' },
    hero:          { icon: Users,         desc: '인재 매칭 플랫폼',          intro: '기업과 인재를 연결하는 커리어 매칭 서비스입니다.',                access: 'purchase',      accessDetail: '상담' },
    planners:      { icon: BookOpen,      desc: "Planner's",                intro: '기획자를 위한 실무 교육 프로그램입니다.',                          access: 'purchase',      accessDetail: '교육' },
    changeup:      { icon: Rocket,        desc: '스타트업 액셀러레이팅',     intro: '초기 스타트업의 성장을 돕는 액셀러레이팅 프로그램입니다.',        access: 'purchase',      accessDetail: '교육' },
    naturebox:     { icon: Globe,         desc: '자연함 NatureBox',          intro: '자연 원료 기반의 건강한 라이프스타일 제품을 제공합니다.',          access: 'purchase',      accessDetail: '제품' },
    badak:         { icon: Briefcase,     desc: '마케팅·광고 네트워킹',      intro: '현업 마케터·광고인이 모이는 업계 네트워킹 커뮤니티입니다.',      access: 'purchase',      accessDetail: '모임' },
    madleague:     { icon: GraduationCap, desc: '대학 동아리 연합',          intro: '전국 대학 마케팅·광고 동아리가 함께 성장하는 연합 플랫폼입니다.', access: 'membership' },
    madleap:       { icon: GraduationCap, desc: '매드리그 동문 네트워크',    intro: '매드리그 졸업 후에도 이어지는 동문 커리어 네트워크입니다.',       access: 'membership' },
    youinone:      { icon: Building2,     desc: '프리랜서 얼라이언스',       intro: '프리랜서와 전문가 크루의 프로젝트 협업 플랫폼입니다.',            access: 'membership' },
    domo:          { icon: Users,         desc: '시니어 비즈니스맨 네트워크', intro: '경영진과 시니어 전문가의 비즈니스 네트워킹 플랫폼입니다.',       access: 'membership' },
    wiki:          { icon: BookOpen,      desc: '유니버스 위키',             intro: '유니버스 내부 지식 베이스입니다.',                                access: 'staff' },
    dokdae:        { icon: Shield,        desc: '독대',                      intro: '내부 운영 전용 서비스입니다.',                                    access: 'internal' },
};

const INTERNAL_ONLY = new Set(
    Object.entries(SERVICE_META)
        .filter(([, m]) => m.access === 'staff' || m.access === 'internal')
        .map(([id]) => id),
);

/* ── 공유 프로필 데이터 (공개 뷰용 외부 전달) ── */
export interface PublicProfileData {
    id: string;
    name: string;
    handle?: string;
    email: string;
    company?: string;
    bio?: string;
    avatarUrl?: string;
    affiliations?: string[];
    interestsIndustry?: string[];
    interestsJob?: string[];
    profileVisibility: 'public' | 'private';
    role?: string;
    createdAt?: string;
    privacySettings?: Record<string, boolean>;
    socialLinks?: Record<string, string>;
}

/* ── 작은 InfoItem ── */
function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub">{label}</div>
            <div className="text-sm tn-text">{value || '-'}</div>
        </div>
    );
}

function EditField({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">{label}</div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full text-sm tn-text bg-transparent border tn-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400" />
        </div>
    );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">{label}</div>
            <div className="relative">
                <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm tn-text bg-transparent border tn-border rounded-lg px-3 py-1.5 pr-9 focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 tn-text-sub hover:opacity-80">
                    {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
}

/* ── 서비스 카드 ── */
function ServiceCard({ siteId, siteName, color, serviceData, isClosed }: {
    siteId: string; siteName: string; color: string;
    serviceData?: ServiceProfileData; isClosed?: boolean;
}) {
    const meta = SERVICE_META[siteId];
    const Icon = meta?.icon || Globe;
    const summaryFields = serviceData?.fields
        ? Object.entries(serviceData.fields).filter(([, v]) => v != null && v !== '').slice(0, 3)
        : [];
    return (
        <div className="rounded-xl border tn-border tn-surface overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-1" style={{ backgroundColor: color }} />
            <div className="p-4">
                <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold tn-text">{siteName}</span>
                            {isClosed && (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-500">닫힘</span>
                            )}
                            {meta?.access && (() => {
                                const a = ACCESS_LABELS[meta.access];
                                const detail = meta.accessDetail ? ` · ${meta.accessDetail}` : '';
                                return (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap"
                                        style={{ backgroundColor: a.color + '15', color: a.color }}>
                                        {a.label}{detail}
                                    </span>
                                );
                            })()}
                        </div>
                        <p className="text-[11px] tn-text-sub leading-snug mt-0.5">{meta?.intro || meta?.desc}</p>
                    </div>
                </div>
                {serviceData && (summaryFields.length > 0 || serviceData.joinedAt) && (
                    <div className="grid grid-cols-2 gap-2 mb-3 p-3 rounded-lg bg-neutral-50">
                        {serviceData.joinedAt && (
                            <div className="flex items-center gap-1.5 text-[11px] tn-text-sub">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{serviceData.joinedAt.substring(0, 10)} 등록</span>
                            </div>
                        )}
                        {summaryFields.map(([label, value]) => (
                            <div key={label} className="flex items-center gap-1.5 text-[11px] tn-text-sub">
                                <Zap className="h-3 w-3 shrink-0" style={{ color }} />
                                <span className="truncate">{label}: {String(value)}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <a href={`/${siteId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                        style={{ color }}>
                        바로가기 <ExternalLink className="h-3 w-3" />
                    </a>
                    {serviceData && (
                        <a href={`/${siteId}/my`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium tn-text-sub hover:opacity-80 transition-colors">
                            마이페이지 <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── 관심 태그 칩 ── */
function InterestChip({ label, color = '#6b7280' }: { label: string; color?: string }) {
    return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: color + '18', color }}>
            {label}
        </span>
    );
}

/* ── 태그 입력 (interests 편집) ── */
function TagSelector({ label, values, all, onChange }: {
    label: string; values: string[]; all: readonly string[]; onChange: (v: string[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filtered = all.filter(x => x.includes(query) && !values.includes(x));

    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">{label}</div>
            <div className="flex flex-wrap gap-1 mb-1.5">
                {values.map(v => (
                    <span key={v} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border tn-border tn-text">
                        {v}
                        <button type="button" onClick={() => onChange(values.filter(x => x !== v))}>
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </span>
                ))}
                {values.length < 5 && (
                    <button type="button" onClick={() => setOpen(!open)}
                        className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full border border-dashed tn-border tn-text-sub hover:opacity-80">
                        <Plus className="h-2.5 w-2.5" /> 추가
                    </button>
                )}
            </div>
            {open && (
                <div className="border tn-border rounded-lg overflow-hidden">
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="검색..."
                        className="w-full text-xs px-3 py-1.5 bg-transparent border-b tn-border focus:outline-none tn-text" />
                    <div className="max-h-32 overflow-y-auto">
                        {filtered.slice(0, 20).map(x => (
                            <button key={x} type="button"
                                onClick={() => { onChange([...values, x]); setQuery(''); }}
                                className="w-full text-left text-xs px-3 py-1.5 hover:bg-neutral-50 tn-text">
                                {x}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-xs tn-text-sub px-3 py-2">결과 없음</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════════════ */
interface UniverseProfileProps {
    isOwner?: boolean;
    publicData?: PublicProfileData;
    /** 프로필 카드와 유니버스 서비스 아코디언 사이에 렌더링 (방명록 등) */
    children?: React.ReactNode;
}

export function UniverseProfile({ isOwner = true, publicData, children }: UniverseProfileProps) {
    const { user, isStaff, updateProfile } = useAuth();

    /* ── 표시용 프로필 (소유자=user, 공개=publicData) ── */
    const DEFAULT_PRIVACY: Record<string, boolean> = {
        email: false, phone: false, company: true, bio: true,
        hero: true, badak: true, madleague: true, madleap: true, youinone: true,
    };

    const profile = isOwner ? (user ? {
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        company: user.company,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        affiliations: user.affiliations,
        interestsIndustry: user.interestsIndustry || [],
        interestsJob: user.interestsJob || [],
        profileVisibility: user.profileVisibility || 'public',
        role: user.role,
        createdAt: user.createdAt,
        privacySettings: { ...DEFAULT_PRIVACY, ...(user.privacySettings || {}) },
        socialLinks: user.socialLinks || {},
    } : null) : (publicData ? {
        ...publicData,
        privacySettings: { ...DEFAULT_PRIVACY, ...(publicData.privacySettings || {}) },
        socialLinks: publicData.socialLinks || {},
    } : null);

    const [serviceProfiles, setServiceProfiles] = useState<ServiceProfileData[]>([]);
    const [openSiteIds, setOpenSiteIds] = useState<Set<string>>(new Set());
    const [siteConfigsLoaded, setSiteConfigsLoaded] = useState(false);
    const [badakActivity, setBadakActivity] = useState<BadakActivityData | null>(null);

    /* ── 편집 상태 (소유자 전용) ── */
    const [editing, setEditing] = useState(false);
    const [bioExpanded, setBioExpanded] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '', phone: '', company: '', bio: '',
        handle: '', interestsIndustry: [] as string[], interestsJob: [] as string[],
        privacySettings: { ...DEFAULT_PRIVACY } as Record<string, boolean | undefined>,
        socialLinks: {} as Record<string, string | undefined>,
    });
    const [handleChecking, setHandleChecking] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [handleError, setHandleError] = useState('');

    /* ── 아바타 미리보기 상태 ── */
    const [pendingAvatar, setPendingAvatar] = useState<{ file: File; previewUrl: string } | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── 공개 범위 토글 ── */
    const [visibilityUpdating, setVisibilityUpdating] = useState(false);

    /* ── 공유 복사 ── */
    const [copied, setCopied] = useState(false);

    /* ── 유니버스 서비스 패널 ── */
    const [sitesOpen, setSitesOpen] = useState(false);

    /* ── 공개 프로필 미리보기 ── */
    const [previewOpen, setPreviewOpen] = useState(false);

    /* ── 비밀번호 변경 ── */
    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    /* ── 서비스 프로필 로드 ── */
    useEffect(() => {
        const email = profile?.email;
        if (!email) return;
        getAllServiceProfiles(email).then(setServiceProfiles).catch(() => {});
    }, [profile?.email]);

    /* ── 사이트 오픈 상태 ── */
    useEffect(() => {
        getAllSiteConfigs()
            .then((configs: SiteConfigRow[]) => {
                setOpenSiteIds(new Set(configs.filter(c => c.is_open).map(c => c.site_id)));
                setSiteConfigsLoaded(true);
            })
            .catch(() => setSiteConfigsLoaded(true));
    }, []);

    /* ── Badak 활동 (소유자만) ── */
    useEffect(() => {
        if (!isOwner || !user) return;
        const supabase = createClient();
        supabase.auth.getSession().then((res: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
            const token = res.data.session?.access_token;
            getBadakActivity(user.id, token).then(setBadakActivity).catch(() => {});
        });
    }, [isOwner, user]);

    /* ── 핸들 중복 체크 (debounce) ── */
    useEffect(() => {
        const handle = editForm.handle.trim();
        if (!handle || handle === (user?.handle || '')) {
            setHandleAvailable(null);
            setHandleError('');
            return;
        }
        if (!/^[a-z0-9_.-]{3,30}$/.test(handle)) {
            setHandleError('3~30자, 영문 소문자·숫자·_·.·- 만 허용');
            setHandleAvailable(false);
            return;
        }
        setHandleError('');
        setHandleChecking(true);
        const timer = setTimeout(() => {
            checkHandleAvailable(handle, user?.id)
                .then(ok => { setHandleAvailable(ok); setHandleChecking(false); })
                .catch(() => { setHandleChecking(false); });
        }, 500);
        return () => clearTimeout(timer);
    }, [editForm.handle, user?.handle, user?.id]);

    if (!profile) return null;

    const initials = profile.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';

    /* ── 아바타: 파일 선택 → 미리보기 ── */
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setPendingAvatar({ file, previewUrl });
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    /* ── 아바타: 확인 → 업로드 ── */
    async function handleAvatarConfirm() {
        if (!pendingAvatar || !user) return;
        setAvatarUploading(true);
        try {
            const supabase = createClient();
            const resized = await resizeAvatar(pendingAvatar.file);
            const filePath = `${user.id}/${Date.now()}.webp`;
            const { error } = await supabase.storage.from('avatars').upload(filePath, resized, {
                upsert: true, contentType: 'image/webp',
            });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            updateProfile({ avatarUrl: publicUrl });
            URL.revokeObjectURL(pendingAvatar.previewUrl);
            setPendingAvatar(null);
        } catch (err) {
            console.error('Avatar upload failed:', err);
        } finally {
            setAvatarUploading(false);
        }
    }

    /* ── 아바타: 취소 ── */
    function handleAvatarCancel() {
        if (pendingAvatar) URL.revokeObjectURL(pendingAvatar.previewUrl);
        setPendingAvatar(null);
    }

    /* ── 공개 범위 토글 ── */
    async function toggleVisibility() {
        if (!user || !profile) return;
        const next = profile.profileVisibility === 'public' ? 'private' : 'public';
        setVisibilityUpdating(true);
        try {
            const supabase = createClient();
            await supabase.from('members').update({ profile_visibility: next }).eq('id', user.id);
            updateProfile({ profileVisibility: next });
        } catch { /* silent */ }
        finally { setVisibilityUpdating(false); }
    }

    /* ── 공유 URL 복사 ── */
    function handleShareCopy() {
        const handle = profile?.handle;
        const url = handle
            ? `${window.location.origin}/@${handle}`
            : `${window.location.origin}/profile`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    /* ── 편집 시작 ── */
    function startEditing() {
        setEditForm({
            name: user?.name || '',
            phone: user?.phone ? formatPhone(user.phone) : '',
            company: user?.company || '',
            bio: user?.bio || '',
            handle: user?.handle || '',
            interestsIndustry: user?.interestsIndustry || [],
            interestsJob: user?.interestsJob || [],
            privacySettings: { ...DEFAULT_PRIVACY, ...(user?.privacySettings || {}) } as Record<string, boolean>,
            socialLinks: { ...(user?.socialLinks || {}) } as Record<string, string>,
        });
        setHandleAvailable(null);
        setHandleError('');
        setEditing(true);
    }

    /* ── 편집 저장 ── */
    async function saveEditing() {
        if (handleError || handleChecking) return;
        const supabase = createClient();
        const updates: Record<string, unknown> = {
            name: editForm.name,
            phone: editForm.phone,
            company: editForm.company,
            bio: editForm.bio,
            interests_industry: editForm.interestsIndustry,
            interests_job: editForm.interestsJob,
            privacy_settings: editForm.privacySettings,
            social_links: editForm.socialLinks,
        };
        if (editForm.handle.trim()) updates.handle = editForm.handle.trim();
        await supabase.from('members').update(updates).eq('id', user!.id);
        updateProfile({
            name: editForm.name,
            phone: editForm.phone,
            company: editForm.company,
            bio: editForm.bio,
            handle: editForm.handle.trim() || undefined,
            interestsIndustry: editForm.interestsIndustry,
            interestsJob: editForm.interestsJob,
            privacySettings: editForm.privacySettings as import('@/types/auth').PrivacySettings,
            socialLinks: editForm.socialLinks as import('@/types/auth').SocialLinks,
        });
        setEditing(false);
    }

    /* ── 비밀번호 변경 ── */
    async function handlePasswordChange() {
        setPwdError(''); setPwdSuccess('');
        if (!pwdForm.current) { setPwdError('현재 비밀번호를 입력하세요.'); return; }
        if (pwdForm.next.length < 6) { setPwdError('새 비밀번호는 6자 이상이어야 합니다.'); return; }
        if (pwdForm.next !== pwdForm.confirm) { setPwdError('새 비밀번호가 일치하지 않습니다.'); return; }
        setPwdLoading(true);
        try {
            const sb = createClient();
            const { error: signInErr } = await sb.auth.signInWithPassword({ email: user?.email || '', password: pwdForm.current });
            if (signInErr) { setPwdError('현재 비밀번호가 올바르지 않습니다.'); return; }
            const { error: updateErr } = await sb.auth.updateUser({ password: pwdForm.next });
            if (updateErr) { setPwdError(`변경 실패: ${updateErr.message}`); return; }
            setPwdSuccess('비밀번호가 변경되었습니다.');
            setPwdForm({ current: '', next: '', confirm: '' });
            setTimeout(() => { setPwdSuccess(''); setPwdOpen(false); }, 2000);
        } catch { setPwdError('비밀번호 변경 중 오류가 발생했습니다.'); }
        finally { setPwdLoading(false); }
    }

    /* ── 사이트 목록 필터/정렬 ── */
    const allSites = (Object.values(siteConfigs) as (typeof siteConfigs)[SiteIdentifier][])
        .filter(s => s.id !== 'tenone')
        .map(s => ({ id: s.id, name: s.name, path: s.homePath, color: s.colors.primary }));

    const visibleSites = allSites.filter(s => {
        if (INTERNAL_ONLY.has(s.id) && !isStaff) return false;
        if (isOwner && siteConfigsLoaded && !openSiteIds.has(s.id) && !isStaff) return false;
        if (!isOwner && (!siteConfigsLoaded || !openSiteIds.has(s.id))) return false;
        if (!isOwner && profile?.privacySettings?.[s.id] === false) return false;
        return true;
    });

    const sortedSites = [...visibleSites].sort((a, b) => {
        const aOpen = openSiteIds.has(a.id);
        const bOpen = openSiteIds.has(b.id);
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
        const aHas = serviceProfiles.some(sp => sp.siteId === a.id);
        const bHas = serviceProfiles.some(sp => sp.siteId === b.id);
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return 0;
    });

    /* ── 서비스 프로필에서 HeRo 추출 ── */
    const heroProfile = serviceProfiles.find(sp => sp.siteId === 'hero');
    const heroType = heroProfile?.fields?.['영웅 유형'] || heroProfile?.fields?.['HIT 유형'] || null;

    /* ── Badak 프로필 (job, industry) ── */
    const badakProfile = serviceProfiles.find(sp => sp.siteId === 'badak');

    /* ── 배너 칩 표시용 ── */
    const bannerChips: { label: string; color: string }[] = [];
    if (heroType) bannerChips.push({ label: `⚔ ${heroType}`, color: '#dc2626' });
    if (badakProfile?.fields?.['직무']) bannerChips.push({ label: String(badakProfile.fields['직무']), color: '#f59e0b' });
    (profile.interestsJob || []).slice(0, 2).forEach(j => bannerChips.push({ label: j, color: '#3b82f6' }));
    (profile.interestsIndustry || []).slice(0, 2).forEach(i => bannerChips.push({ label: i, color: '#8b5cf6' }));

    const isPublic = profile.profileVisibility !== 'private';

    /* ── 미리보기용 publicData 구성 ── */
    const previewPublicData: PublicProfileData | null = isOwner && user ? {
        id: user.id,
        name: user.name,
        handle: user.handle || '',
        email: user.email,
        company: user.company || undefined,
        bio: user.bio || undefined,
        avatarUrl: user.avatarUrl || undefined,
        affiliations: user.affiliations || [],
        interestsIndustry: user.interestsIndustry || [],
        interestsJob: user.interestsJob || [],
        profileVisibility: (user.profileVisibility as 'public' | 'private') || 'public',
        role: user.role || 'Member',
        createdAt: user.createdAt || '',
        privacySettings: (editing
            ? editForm.privacySettings
            : user.privacySettings) as Record<string, boolean> | undefined,
        socialLinks: (editing
            ? editForm.socialLinks
            : user.socialLinks) as Record<string, string> | undefined,
    } : null;

    return (
        <>
        {/* ── 미리보기 모달 ── */}
        {previewOpen && previewPublicData && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
                onClick={e => { if (e.target === e.currentTarget) setPreviewOpen(false); }}>
                <div className="w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> 외부인에게 보이는 화면
                        </span>
                        <button onClick={() => setPreviewOpen(false)}
                            className="text-white/60 hover:text-white transition-colors cursor-pointer">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <UniverseProfile isOwner={false} publicData={previewPublicData} />
                </div>
            </div>
        )}
        <div className="space-y-5">

            {/* ════════════════════════════════
                프로필 카드 (전체 통합)
            ════════════════════════════════ */}
            <div className="rounded-2xl border tn-border tn-surface overflow-hidden">

                {/* ── 배너 ── */}
                <div className="h-24 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Globe className="h-20 w-20 text-white" />
                    </div>

                    {/* 배너 우측: 공유 버튼만 */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                        {(isPublic || isOwner) && (
                            <button
                                onClick={handleShareCopy}
                                title="프로필 링크 복사"
                                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.1)', color: copied ? '#22c55e' : '#d1d5db', border: '1px solid rgba(255,255,255,0.15)' }}>
                                {copied ? <CheckCircle2 className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                                {copied ? '복사됨!' : '공유'}
                            </button>
                        )}
                    </div>

                    {/* 아바타 */}
                    <div className="absolute bottom-0 left-8 translate-y-1/2">
                        <div className="relative group/avatar">
                            {(pendingAvatar?.previewUrl || profile.avatarUrl) ? (
                                <Image
                                    src={pendingAvatar?.previewUrl || profile.avatarUrl!}
                                    alt={profile.name || ''}
                                    width={80} height={80}
                                    unoptimized={!!pendingAvatar}
                                    className={`h-20 w-20 rounded-full border-4 shadow-lg object-cover transition-all ${
                                        pendingAvatar ? 'border-blue-400' : 'border-white'
                                    }`} />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-neutral-900 border-4 border-white flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                    {initials}
                                </div>
                            )}
                            {isOwner && !pendingAvatar && (
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-5 w-5 text-white" />
                                </button>
                            )}
                            {pendingAvatar && (
                                <>
                                    <button onClick={handleAvatarCancel} title="취소"
                                        className="absolute -bottom-1 -left-1 h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer shadow-md z-10">
                                        <X className="h-3 w-3 text-white" />
                                    </button>
                                    <button onClick={handleAvatarConfirm} disabled={avatarUploading} title="저장"
                                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-md z-10 disabled:opacity-60">
                                        {avatarUploading
                                            ? <div className="h-2.5 w-2.5 border border-white/40 border-t-white rounded-full animate-spin" />
                                            : <Check className="h-3 w-3 text-white" />}
                                    </button>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </div>
                    </div>
                </div>

                {/* ── 이름 + 편집 버튼 행 ── */}
                <div className="px-8 pt-12 pb-0 flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold tn-text">{profile.name}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {profile.handle && <p className="text-xs tn-text-sub">@{profile.handle}</p>}
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isStaff ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                                {isStaff ? 'Staff' : 'Member'}
                            </span>
                        </div>
                    </div>
                    {isOwner && !editing && (
                        <div className="flex items-center gap-1.5 mt-1 shrink-0">
                            {/* 공개 설정 토글 */}
                            <button
                                onClick={toggleVisibility}
                                disabled={visibilityUpdating}
                                title={isPublic ? '공개 — 클릭해서 비공개로 전환' : '비공개 — 클릭해서 공개로 전환'}
                                className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isPublic
                                        ? 'text-emerald-600 border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:hover:bg-emerald-950/50'
                                        : 'tn-text-sub tn-border hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}>
                                {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                {isPublic ? '공개' : '비공개'}
                            </button>
                            {/* 미리보기 */}
                            <button onClick={() => setPreviewOpen(true)}
                                title="외부인 뷰로 미리보기"
                                className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                <Eye className="h-3 w-3" /> 미리보기
                            </button>
                            {/* 수정 */}
                            <button onClick={startEditing}
                                className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                <Pencil className="h-3 w-3" /> 수정
                            </button>
                        </div>
                    )}
                    {isOwner && editing && (
                        <div className="flex items-center gap-2 mt-1 shrink-0">
                            <button onClick={saveEditing}
                                disabled={handleChecking || (handleError !== '' && editForm.handle.trim() !== '')}
                                className="text-xs text-white bg-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                                <Check className="h-3 w-3" /> 저장
                            </button>
                            <button onClick={() => setEditing(false)}
                                className="text-xs tn-text-sub border tn-border px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer">
                                <X className="h-3 w-3" /> 취소
                            </button>
                        </div>
                    )}
                </div>

                {/* ── 상세 정보 영역 ── */}
                <div className="px-8 py-5">
                {editing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField label="이름" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} />
                            <InfoItem label="이메일 (로그인 ID)" value={user?.email || '-'} />
                            <EditField label="연락처" value={editForm.phone}
                                onChange={v => setEditForm(f => ({ ...f, phone: formatPhone(v) }))}
                                placeholder="010-0000-0000" />
                            <EditField label="소속" value={editForm.company} onChange={v => setEditForm(f => ({ ...f, company: v }))} placeholder="회사/조직명" />
                        </div>
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">자기소개</div>
                            <textarea value={editForm.bio}
                                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                                rows={3} placeholder="자유롭게 자신을 소개해주세요."
                                className="w-full text-sm tn-text bg-transparent border tn-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none" />
                        </div>

                        {/* 개인 ID (handle) */}
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">개인 ID (@username)</div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm tn-text-sub">@</span>
                                <input value={editForm.handle}
                                    onChange={e => setEditForm(f => ({ ...f, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') }))}
                                    placeholder="your-handle"
                                    className="w-full text-sm tn-text bg-transparent border tn-border rounded-lg pl-7 pr-9 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {handleChecking && <div className="h-3.5 w-3.5 border border-neutral-400 border-t-transparent rounded-full animate-spin" />}
                                    {!handleChecking && handleAvailable === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                    {!handleChecking && handleAvailable === false && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                                </span>
                            </div>
                            {handleError && <p className="text-[11px] text-red-500 mt-1">{handleError}</p>}
                            {!handleError && handleAvailable === true && <p className="text-[11px] text-emerald-600 mt-1">사용 가능한 ID입니다.</p>}
                            {!handleError && handleAvailable === false && editForm.handle && <p className="text-[11px] text-red-500 mt-1">이미 사용 중인 ID입니다.</p>}
                            <p className="text-[10px] tn-text-sub mt-0.5">URL: tenone.biz/@{editForm.handle || 'your-handle'}</p>
                        </div>

                        {/* 관심 분야 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TagSelector label="관심 직무" values={editForm.interestsJob} all={JOB_FUNCTIONS}
                                onChange={v => setEditForm(f => ({ ...f, interestsJob: v }))} />
                            <TagSelector label="관심 산업" values={editForm.interestsIndustry} all={INDUSTRIES}
                                onChange={v => setEditForm(f => ({ ...f, interestsIndustry: v }))} />
                        </div>

                        {/* 소셜 링크 */}
                        <div className="border-t tn-border pt-4 mt-2 space-y-3">
                            <div className="text-[10px] font-semibold uppercase tracking-wider tn-text-sub flex items-center gap-1.5">
                                <LinkIcon className="h-3 w-3" /> 소셜 링크
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                                {[
                                    { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/username' },
                                    { key: 'x',         label: 'X (Twitter)', placeholder: 'x.com/username' },
                                    { key: 'linkedin',  label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
                                    { key: 'youtube',   label: 'YouTube', placeholder: 'youtube.com/@channel' },
                                    { key: 'github',    label: 'GitHub', placeholder: 'github.com/username' },
                                    { key: 'website',   label: '웹사이트', placeholder: 'https://yoursite.com' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="text-[11px] tn-text-sub w-24 shrink-0">{label}</span>
                                        <input
                                            type="text"
                                            value={editForm.socialLinks[key] || ''}
                                            onChange={e => setEditForm(f => ({
                                                ...f,
                                                socialLinks: { ...f.socialLinks, [key]: e.target.value }
                                            }))}
                                            placeholder={placeholder}
                                            className="flex-1 text-xs tn-text bg-transparent border tn-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 placeholder:text-neutral-400" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 공개 범위 설정 */}
                        <div className="border-t tn-border pt-4 mt-2 space-y-3">
                            <div className="text-[10px] font-semibold uppercase tracking-wider tn-text-sub flex items-center gap-1.5">
                                <Eye className="h-3 w-3" /> 공개 범위 설정
                            </div>
                            <p className="text-[11px] tn-text-sub -mt-1">공개 프로필에서 외부에 보여줄 항목을 선택하세요.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                {[
                                    { key: 'email',      label: '이메일' },
                                    { key: 'phone',      label: '연락처' },
                                    { key: 'company',    label: '소속' },
                                    { key: 'bio',        label: '자기소개' },
                                    { key: 'socialLinks',label: '소셜 링크' },
                                    { key: 'hero',       label: 'HeRo 활동' },
                                    { key: 'badak',      label: 'Badak 활동' },
                                    { key: 'madleague',  label: 'MAD League 활동' },
                                    { key: 'madleap',    label: 'MAD Leap 활동' },
                                    { key: 'youinone',   label: 'YouInOne 활동' },
                                ].map(({ key, label }) => {
                                    const isOn = !!editForm.privacySettings[key];
                                    const toggle = () => setEditForm(f => ({
                                        ...f,
                                        privacySettings: { ...f.privacySettings, [key]: !f.privacySettings[key] }
                                    }));
                                    return (
                                        <div key={key}
                                            className="flex items-center justify-between gap-3 cursor-pointer group"
                                            onClick={toggle}>
                                            <span className="text-xs tn-text group-hover:opacity-80 select-none">{label}</span>
                                            <button type="button" role="switch" aria-checked={isOn}
                                                onClick={e => { e.stopPropagation(); toggle(); }}
                                                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none ${
                                                    isOn ? 'bg-emerald-500' : 'bg-neutral-500/40'
                                                }`}>
                                                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                                    isOn ? 'translate-x-4' : 'translate-x-0'
                                                }`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 비밀번호 변경 (편집 모드 내) */}
                        <div className="border-t tn-border pt-4 mt-4">
                            <button onClick={() => setPwdOpen(!pwdOpen)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-neutral-700 cursor-pointer">
                                <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 tn-text-sub" /> 비밀번호 변경</span>
                                {pwdOpen ? <ChevronUp className="h-3.5 w-3.5 tn-text-sub" /> : <ChevronDown className="h-3.5 w-3.5 tn-text-sub" />}
                            </button>
                            {pwdOpen && (
                                <div className="mt-4 space-y-3">
                                    <PasswordField label="현재 비밀번호" value={pwdForm.current}
                                        onChange={v => setPwdForm(f => ({ ...f, current: v }))} />
                                    <PasswordField label="새 비밀번호" value={pwdForm.next}
                                        onChange={v => setPwdForm(f => ({ ...f, next: v }))} />
                                    <PasswordField label="새 비밀번호 확인" value={pwdForm.confirm}
                                        onChange={v => setPwdForm(f => ({ ...f, confirm: v }))} />
                                    {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
                                    {pwdSuccess && <p className="text-xs text-emerald-600">{pwdSuccess}</p>}
                                    <button onClick={handlePasswordChange} disabled={pwdLoading}
                                        className="text-xs text-white bg-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer">
                                        {pwdLoading ? '변경 중...' : '비밀번호 변경'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 프라이버시 설정 helper */}
                        {(() => {
                            const ps = profile.privacySettings || {};
                            const showEmail   = isOwner || ps.email   !== false;
                            const showPhone       = isOwner || ps.phone       !== false;
                            const showCompany     = isOwner || ps.company     !== false;
                            const showBio         = isOwner || ps.bio         !== false;
                            const showSocialLinks = isOwner || ps.socialLinks !== false;
                            const phone = user?.phone ?? (profile as PublicProfileData & { phone?: string }).phone;
                            return (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {showEmail && <InfoItem label="이메일" value={profile.email || '-'} />}
                                        {showPhone && <InfoItem label="연락처" value={phone ? formatPhone(phone) : '-'} />}
                                        {showCompany && <InfoItem label="소속" value={profile.company || '-'} />}
                                        {isOwner && <InfoItem label="가입일" value={profile.createdAt?.substring(0, 10) || '-'} />}
                                    </div>
                                    {(() => {
                                        const showBadakCareer = isOwner || ps.badak !== false;
                                        const careerJob = badakProfile?.fields?.['직무'] as string | null;
                                        const careerIndustry = badakProfile?.fields?.['산업군'] as string | null;
                                        const careerLevel = badakProfile?.fields?.['경력'] as string | null;
                                        const hasCareer = showBadakCareer && (careerJob || careerIndustry || careerLevel);
                                        const hasInterests = (profile.interestsJob?.length ?? 0) > 0 || (profile.interestsIndustry?.length ?? 0) > 0;
                                        if (!hasCareer && !hasInterests) return null;
                                        return (
                                            <div className="mt-4 pt-4 border-t tn-border space-y-3">
                                                {hasCareer && (
                                                    <div>
                                                        <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-2">경력 정보</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {careerJob && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium"
                                                                    style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}>
                                                                    <Briefcase className="h-3 w-3" /> {careerJob}
                                                                </span>
                                                            )}
                                                            {careerIndustry && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium"
                                                                    style={{ backgroundColor: '#8b5cf618', color: '#8b5cf6' }}>
                                                                    <Building2 className="h-3 w-3" /> {careerIndustry}
                                                                </span>
                                                            )}
                                                            {careerLevel && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium"
                                                                    style={{ backgroundColor: '#64748b18', color: '#64748b' }}>
                                                                    <Clock className="h-3 w-3" /> {careerLevel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {hasInterests && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {(profile.interestsJob?.length ?? 0) > 0 && (
                                                            <div>
                                                                <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1.5">관심 직무</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {profile.interestsJob!.map(j => <InterestChip key={j} label={j} color="#3b82f6" />)}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {(profile.interestsIndustry?.length ?? 0) > 0 && (
                                                            <div>
                                                                <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1.5">관심 산업</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {profile.interestsIndustry!.map(i => <InterestChip key={i} label={i} color="#8b5cf6" />)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                    {showBio && profile.bio && (
                                        <div className="mt-4 pt-4 border-t tn-border">
                                            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">자기소개</div>
                                            <p className={`text-sm tn-text leading-relaxed whitespace-pre-wrap break-words overflow-hidden transition-all ${bioExpanded ? '' : 'line-clamp-3'}`}>
                                                {profile.bio}
                                            </p>
                                            {profile.bio.length > 120 && (
                                                <button onClick={() => setBioExpanded(v => !v)}
                                                    className="mt-1 text-[11px] tn-text-sub hover:tn-text flex items-center gap-0.5 transition-colors cursor-pointer">
                                                    {bioExpanded
                                                        ? <><ChevronUp className="h-3 w-3" /> 접기</>
                                                        : <><ChevronDown className="h-3 w-3" /> 더 보기</>}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {showSocialLinks && Object.entries(profile.socialLinks || {}).filter(([, v]) => v).length > 0 && (
                                        <div className="mt-4 pt-4 border-t tn-border">
                                            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-2">소셜 링크</div>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { key: 'instagram', label: 'Instagram' },
                                                    { key: 'x',        label: 'X' },
                                                    { key: 'linkedin', label: 'LinkedIn' },
                                                    { key: 'youtube',  label: 'YouTube' },
                                                    { key: 'github',   label: 'GitHub' },
                                                    { key: 'website',  label: '웹사이트' },
                                                ].filter(s => (profile.socialLinks || {})[s.key]).map(({ key, label }) => {
                                                    const raw = (profile.socialLinks || {})[key] || '';
                                                    const href = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
                                                    return (
                                                    <a key={key} href={href}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs border tn-border rounded-full px-3 py-1 tn-text-sub hover:tn-text transition-colors">
                                                        <ExternalLink className="h-3 w-3" /> {label}
                                                    </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </>
                )}
                </div>{/* /px-8 py-5 */}

                {/* ── HeRo 유형 ── */}
                {heroProfile && (isOwner || (profile?.privacySettings?.hero !== false)) && (
                    <div className="px-8 py-5 border-t tn-border">
                        <h2 className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 tn-text-sub" style={{ color: '#dc2626' }} /> HeRo 영웅 유형
                        </h2>
                        <div className="flex items-start gap-4">
                            {heroType && (
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                                    style={{ background: 'rgba(220,38,38,0.1)' }}>⚔</div>
                            )}
                            <div className="flex-1 min-w-0">
                                {heroType && <div className="text-base font-bold tn-text mb-1">{String(heroType)}</div>}
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(heroProfile.fields || {})
                                        .filter(([, v]) => v != null && v !== '')
                                        .map(([label, value]) => (
                                            <div key={label} className="text-[11px] tn-text-sub">
                                                <span className="font-medium">{label}:</span> {String(value)}
                                            </div>
                                        ))}
                                </div>
                                <a href="/hero" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold transition-colors hover:opacity-80"
                                    style={{ color: '#dc2626' }}>
                                    HeRo 바로가기 <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Badak 활동 ── */}
                {badakActivity && (isOwner || (profile?.privacySettings?.badak !== false)) && (badakActivity.ledGroups.length > 0 || badakActivity.joinedGroups.length > 0) && (
                    <div className="px-8 py-5 border-t tn-border">
                        <h2 className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 tn-text-sub" style={{ color: '#f59e0b' }} /> Badak 활동
                        </h2>
                        {badakActivity.ledGroups.length > 0 && (
                            <div className="mb-4">
                                <div className="text-[11px] font-semibold tn-text-sub mb-2 uppercase tracking-wide">개설한 모임 ({badakActivity.ledGroups.length})</div>
                                <div className="space-y-2">
                                    {badakActivity.ledGroups.map(g => (
                                        <a key={g.id} href={`/badak/groups/${g.id}`}
                                            className="flex items-center justify-between rounded-xl border tn-border px-4 py-3 hover:bg-neutral-50 transition-colors group">
                                            <div>
                                                <div className="text-sm font-semibold tn-text group-hover:text-amber-600 transition-colors">{g.title}</div>
                                                <div className="text-[11px] tn-text-sub mt-0.5">{g.currentMembers}/{g.maxMembers}명</div>
                                            </div>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                style={g.status === 'recruiting'
                                                    ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                                                    : g.status === 'confirmed'
                                                        ? { background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }
                                                        : { background: 'rgba(107,114,128,0.12)', color: '#6b7280' }
                                                }>
                                                {g.status === 'recruiting' ? '모집 중' : g.status === 'confirmed' ? '확정' : '마감'}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {badakActivity.joinedGroups.length > 0 && (
                            <div>
                                <div className="text-[11px] font-semibold tn-text-sub mb-2 uppercase tracking-wide">참여한 모임 ({badakActivity.joinedGroups.length})</div>
                                <div className="space-y-2">
                                    {badakActivity.joinedGroups.map(g => (
                                        <a key={g.id} href={`/badak/groups/${g.id}`}
                                            className="flex items-center justify-between rounded-xl border tn-border px-4 py-3 hover:bg-neutral-50 transition-colors group">
                                            <div>
                                                <div className="text-sm font-semibold tn-text group-hover:text-amber-600 transition-colors">{g.title}</div>
                                                {g.leaderName && <div className="text-[11px] tn-text-sub mt-0.5">바닥장: {g.leaderName}</div>}
                                            </div>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                style={g.myStatus === 'approved'
                                                    ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                                                    : g.myStatus === 'pending'
                                                        ? { background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }
                                                        : { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                                                }>
                                                {g.myStatus === 'approved' ? '참여 중' : g.myStatus === 'pending' ? '승인 대기' : '거절됨'}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── 직원 정보 ── */}
                {isOwner && isStaff && (
                    <div className="px-8 py-5 border-t tn-border">
                        <h2 className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5" /> 직원 정보
                        </h2>
                        <p className="text-[10px] text-neutral-400 mb-3">직원 정보는 관리자만 수정할 수 있습니다.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <InfoItem label="사번" value="-" />
                            <InfoItem label="부서" value="-" />
                            <InfoItem label="직위" value="-" />
                            <InfoItem label="입사일" value="-" />
                            <InfoItem label="권한" value={user?.role || '-'} />
                            <InfoItem label="브랜드 접근" value="전체" />
                        </div>
                    </div>
                )}

            </div>{/* /프로필 카드 */}

            {/* ════════════════════════════════
                유니버스 서비스 (소유자만, 아코디언)
            ════════════════════════════════ */}
            {/* 방명록 등 슬롯 */}
            {children}

            {isOwner && sortedSites.length > 0 && (
                <div className="rounded-2xl border tn-border tn-surface overflow-hidden">
                    <button
                        onClick={() => setSitesOpen(o => !o)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                        <span className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 tn-text-sub" />
                            유니버스 서비스
                            <span className="font-normal tn-text-sub">({sortedSites.length})</span>
                        </span>
                        {sitesOpen
                            ? <ChevronUp className="h-4 w-4 tn-text-sub" />
                            : <ChevronDown className="h-4 w-4 tn-text-sub" />}
                    </button>
                    {sitesOpen && (
                        <div className="px-6 pb-6 border-t tn-border">
                            <p className="text-[11px] tn-text-sub mt-4 mb-4">가입한 계정으로 모든 서비스를 이용할 수 있습니다.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sortedSites.map(s => (
                                    <ServiceCard
                                        key={s.id}
                                        siteId={s.id}
                                        siteName={s.name}
                                        color={s.color}
                                        serviceData={serviceProfiles.find(sp => sp.siteId === s.id)}
                                        isClosed={siteConfigsLoaded && !openSiteIds.has(s.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        </>
    );
}
