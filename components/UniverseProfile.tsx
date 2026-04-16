'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { siteConfigs, type SiteIdentifier } from '@/lib/site-config';
import { getAllServiceProfiles, type ServiceProfileData } from '@/lib/supabase/universe-profile';
import { getAllSiteConfigs, type SiteConfigRow } from '@/lib/supabase/site-configs';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import {
    Globe, User, Shield, ExternalLink, ArrowRight, Pencil, Check, X, Camera,
    Building2, GraduationCap, Megaphone, Users, Briefcase,
    Sparkles, Palette, BookOpen, Rocket, Zap, Clock, Lock, Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react';

/** 전화번호 자동 포맷: 010-1234-5678 */
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 프로필 이미지 리사이즈 + 압축 (최대 256x256, WebP, ~50KB) */
function resizeAvatar(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            const MAX = 256;
            let w = img.width, h = img.height;
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                blob => blob ? resolve(blob) : reject(new Error('Blob conversion failed')),
                'image/webp', 0.8
            );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
    });
}

/* ── 접근 모델 유형 ── */
type AccessType = 'open' | 'subscription' | 'purchase' | 'membership' | 'staff' | 'internal';
const ACCESS_LABELS: Record<AccessType, { label: string; color: string }> = {
    open: { label: '오픈', color: '#22c55e' },
    subscription: { label: '구독', color: '#3b82f6' },
    purchase: { label: '구매', color: '#f59e0b' },
    membership: { label: '멤버십', color: '#8b5cf6' },
    staff: { label: '직원', color: '#64748b' },
    internal: { label: '내부', color: '#94a3b8' },
};

/* ── 서비스별 아이콘·소개·접근모델 매핑 ── */
const SERVICE_META: Record<string, { icon: typeof Globe; desc: string; intro: string; access: AccessType; accessDetail?: string }> = {
    // 오픈
    ogamja:        { icon: Palette, desc: '공감 블로그', intro: '하찮고 귀여운 감자들의 공감 이야기. 소소하지만 따뜻한 일상 블로그입니다.', access: 'open' },
    fwn:           { icon: Globe, desc: 'Fashion Week Network', intro: '전 세계 패션 위크를 네트워크로 연결합니다.', access: 'open' },
    jakka:         { icon: Palette, desc: '포토그래퍼 포트폴리오', intro: '인물, 스튜디오, 스포츠, 항공, 콘서트 등 다양한 사진 작업 포트폴리오입니다.', access: 'open' },
    mindle:        { icon: Sparkles, desc: '데이터·트렌드', intro: '시장 데이터와 트렌드 인사이트를 제공하는 분석 서비스입니다.', access: 'open' },
    montz:         { icon: Palette, desc: 'MoNTZ 포토그래피', intro: '개인적이고 상상적인 다양한 사진 촬영 작업을 하는 포토그래피 브랜드입니다.', access: 'open' },
    mullaesian:    { icon: Globe, desc: '문래동 로컬 프로젝트', intro: '문래동의 철공소, 골목, 예술가들의 이야기를 기록하는 로컬 프로젝트입니다.', access: 'open' },
    myverse:       { icon: Sparkles, desc: 'AI 에이전트 플랫폼', intro: '나만의 AI 에이전트를 만들고 활용하는 플랫폼입니다.', access: 'open' },
    namingfactory: { icon: Sparkles, desc: '네이밍 서비스', intro: '브랜드, 제품, 서비스의 이름을 짓는 전문 네이밍 서비스입니다.', access: 'open' },
    rook:          { icon: Palette, desc: 'AI 크리에이터', intro: 'AI 기반 콘텐츠 제작과 크리에이티브 워크를 지원합니다.', access: 'open' },
    seoul360:      { icon: Globe, desc: '서울/360° 관광 가이드', intro: '서울 지하철역 주변 관광 명소를 360° 뷰로 안내하는 가이드 서비스입니다.', access: 'open' },
    townity:       { icon: Globe, desc: '동네 커뮤니티', intro: '우리 동네 이웃과 연결되는 하이퍼로컬 커뮤니티 플랫폼입니다.', access: 'open' },
    trendhunter:   { icon: Sparkles, desc: '트렌드 헌터', intro: '최신 트렌드를 발굴하고 큐레이션하는 트렌드 미디어입니다.', access: 'open' },
    // 구독
    brandgravity:  { icon: Palette, desc: '브랜딩 컨설팅', intro: '데이터 기반 브랜드 전략 컨설팅 서비스입니다.', access: 'subscription' },
    smarcomm:      { icon: Megaphone, desc: '마케팅 커뮤니케이션', intro: '마케팅 자동화와 캠페인 관리를 위한 올인원 솔루션입니다.', access: 'subscription' },
    wio:           { icon: Rocket, desc: '업무 자동화 솔루션', intro: '기업 업무를 자동화하는 디지털 솔루션 플랫폼입니다.', access: 'subscription' },
    // 구매
    hero:          { icon: Users, desc: '인재 매칭 플랫폼', intro: '기업과 인재를 연결하는 커리어 매칭 서비스입니다.', access: 'purchase', accessDetail: '상담' },
    planners:      { icon: BookOpen, desc: "Planner's", intro: '기획자를 위한 실무 교육 프로그램입니다.', access: 'purchase', accessDetail: '교육' },
    changeup:      { icon: Rocket, desc: '스타트업 액셀러레이팅', intro: '초기 스타트업의 성장을 돕는 액셀러레이팅 프로그램입니다.', access: 'purchase', accessDetail: '교육' },
    naturebox:     { icon: Globe, desc: '자연함 NatureBox', intro: '자연 원료 기반의 건강한 라이프스타일 제품을 제공합니다.', access: 'purchase', accessDetail: '제품' },
    // 구매(모임) + 역할
    badak:         { icon: Briefcase, desc: '마케팅·광고 네트워킹', intro: '현업 마케터·광고인이 모이는 업계 네트워킹 커뮤니티입니다.', access: 'purchase', accessDetail: '모임' },
    // 승인 멤버십
    madleague:     { icon: GraduationCap, desc: '대학 동아리 연합', intro: '전국 대학 마케팅·광고 동아리가 모여 함께 성장하는 연합 플랫폼입니다.', access: 'membership' },
    madleap:       { icon: GraduationCap, desc: '매드리그 동문 네트워크', intro: '매드리그 졸업 후에도 이어지는 동문 커리어 네트워크입니다.', access: 'membership' },
    youinone:      { icon: Building2, desc: '프리랜서 얼라이언스', intro: '프리랜서와 전문가 크루의 프로젝트 협업 플랫폼입니다.', access: 'membership' },
    domo:          { icon: Users, desc: '시니어 비즈니스맨 네트워크', intro: '경영진과 시니어 전문가의 비즈니스 네트워킹 플랫폼입니다.', access: 'membership' },
    // 직원·내부
    wiki:          { icon: BookOpen, desc: '유니버스 위키', intro: '유니버스 내부 지식 베이스입니다.', access: 'staff' },
    dokdae:        { icon: Shield, desc: '독대', intro: '내부 운영 전용 서비스입니다.', access: 'internal' },
    luki:          { icon: Sparkles, desc: 'AI 아이돌 그룹', intro: 'AI 기반 엔터테인먼트 프로젝트입니다.', access: 'open' },
    evschool:      { icon: GraduationCap, desc: 'Evolution School', intro: '실무 중심 마케팅·비즈니스 교육 프로그램입니다.', access: 'open' },
};

/** 내부 전용 사이트 (Staff만 노출): staff, internal 접근 모델 */
const INTERNAL_ONLY_SITES = new Set(
    Object.entries(SERVICE_META)
        .filter(([, m]) => m.access === 'staff' || m.access === 'internal')
        .map(([id]) => id)
);

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub">{label}</div>
            <div className="text-sm tn-text">{value}</div>
        </div>
    );
}

function EditField({ label, value, onChange, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">{label}</div>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full text-sm tn-text bg-transparent border tn-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400" />
        </div>
    );
}

function PasswordField({ label, value, onChange }: {
    label: string; value: string; onChange: (v: string) => void;
}) {
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

/* ── 서비스 카드 (통합) ── */
function ServiceCard({ siteId, siteName, color, serviceData, isClosed }: {
    siteId: string; siteName: string; color: string;
    serviceData?: ServiceProfileData; isClosed?: boolean;
}) {
    const meta = SERVICE_META[siteId];
    const Icon = meta?.icon || Globe;
    const hasData = !!serviceData;

    // 주요 필드 2~3개만 요약 표시
    const summaryFields = serviceData?.fields
        ? Object.entries(serviceData.fields)
            .filter(([, v]) => v != null && v !== '')
            .slice(0, 3)
        : [];

    return (
        <div className="rounded-xl border tn-border tn-surface overflow-hidden hover:shadow-md transition-shadow group">
            {/* 컬러 스트라이프 */}
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

                {/* 서비스 프로필 데이터가 있으면 요약 표시 */}
                {hasData && (summaryFields.length > 0 || serviceData?.joinedAt) && (
                    <div className="grid grid-cols-2 gap-2 mb-3 p-3 rounded-lg bg-neutral-50">
                        {serviceData?.joinedAt && (
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
                    {hasData && (
                        <a href={`/${siteId}/my`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium tn-text-sub hover:opacity-80 transition-colors">
                            마이페이지 <ArrowRight className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── 메인 컴포넌트 ── */
export function UniverseProfile() {
    const { user, isStaff, updateProfile } = useAuth();
    const [serviceProfiles, setServiceProfiles] = useState<ServiceProfileData[]>([]);
    const [openSiteIds, setOpenSiteIds] = useState<Set<string>>(new Set());
    const [siteConfigsLoaded, setSiteConfigsLoaded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', company: '', bio: '' });
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 비밀번호 변경
    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    const handlePasswordChange = async () => {
        setPwdError('');
        setPwdSuccess('');
        if (!pwdForm.current) { setPwdError('현재 비밀번호를 입력하세요.'); return; }
        if (pwdForm.next.length < 6) { setPwdError('새 비밀번호는 6자 이상이어야 합니다.'); return; }
        if (pwdForm.next !== pwdForm.confirm) { setPwdError('새 비밀번호가 일치하지 않습니다.'); return; }
        setPwdLoading(true);
        try {
            const sb = createClient();
            // 현재 비밀번호 확인 (재로그인)
            const { error: signInErr } = await sb.auth.signInWithPassword({
                email: user?.email || '',
                password: pwdForm.current,
            });
            if (signInErr) { setPwdError('현재 비밀번호가 올바르지 않습니다.'); setPwdLoading(false); return; }
            // 비밀번호 업데이트
            const { error: updateErr } = await sb.auth.updateUser({ password: pwdForm.next });
            if (updateErr) { setPwdError(`변경 실패: ${updateErr.message}`); setPwdLoading(false); return; }
            setPwdSuccess('비밀번호가 변경되었습니다.');
            setPwdForm({ current: '', next: '', confirm: '' });
            setTimeout(() => { setPwdSuccess(''); setPwdOpen(false); }, 2000);
        } catch { setPwdError('비밀번호 변경 중 오류가 발생했습니다.'); }
        finally { setPwdLoading(false); }
    };

    // 서비스 프로필 + 사이트 오픈 상태 동시 로드
    useEffect(() => {
        if (!user?.email) return;
        getAllServiceProfiles(user.email)
            .then(setServiceProfiles)
            .catch(() => {});
    }, [user?.email]);

    useEffect(() => {
        getAllSiteConfigs()
            .then((configs: SiteConfigRow[]) => {
                const openIds = new Set(
                    configs.filter(c => c.is_open).map(c => c.site_id)
                );
                setOpenSiteIds(openIds);
                setSiteConfigsLoaded(true);
            })
            .catch(() => setSiteConfigsLoaded(true));
    }, []);

    if (!user) return null;

    const initials = user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !user?.email) return;
        setAvatarUploading(true);
        try {
            const supabase = createClient();
            // 리사이즈 + WebP 압축 (256x256, ~50KB)
            const resized = await resizeAvatar(file);
            const filePath = `${user.id}/${Date.now()}.webp`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, resized, {
                upsert: true, contentType: 'image/webp',
            });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            updateProfile({ avatarUrl: publicUrl });
        } catch (err) {
            console.error('Avatar upload failed:', err);
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    // 표시할 사이트 필터링 (authMethods 무관 — 모든 유니버스 서비스 표시)
    const allSites = (Object.values(siteConfigs) as (typeof siteConfigs)[SiteIdentifier][])
        .filter(s => s.id !== 'tenone')
        .map(s => ({ id: s.id, name: s.name, path: s.homePath, color: s.colors.primary }));

    const visibleSites = allSites.filter(s => {
        // 내부 전용 사이트 (staff/internal) — Staff만 노출
        if (INTERNAL_ONLY_SITES.has(s.id) && !isStaff) return false;
        // 닫힌 사이트: 일반 회원에게 숨김, Staff는 볼 수 있음
        if (siteConfigsLoaded && !openSiteIds.has(s.id) && !isStaff) return false;
        return true;
    });

    // 정렬: ① 열림→닫힘  ② 프로필 데이터 있는 서비스 우선
    const sortedSites = [...visibleSites].sort((a, b) => {
        const aOpen = !siteConfigsLoaded || openSiteIds.has(a.id);
        const bOpen = !siteConfigsLoaded || openSiteIds.has(b.id);
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
        const aHasData = serviceProfiles.some(sp => sp.siteId === a.id);
        const bHasData = serviceProfiles.some(sp => sp.siteId === b.id);
        if (aHasData && !bHasData) return -1;
        if (!aHasData && bHasData) return 1;
        return 0;
    });

    return (
        <div className="space-y-5">
            {/* ── 프로필 배너 ── */}
            <div className="rounded-2xl border tn-border tn-surface overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Globe className="h-20 w-20 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-8 translate-y-1/2">
                        <div className="relative group/avatar">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.name || ''} width={80} height={80}
                                    className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover" />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-neutral-900 border-4 border-white flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                    {initials}
                                </div>
                            )}
                            <button onClick={() => fileInputRef.current?.click()}
                                disabled={avatarUploading}
                                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                {avatarUploading
                                    ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <Camera className="h-5 w-5 text-white" />}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </div>
                    </div>
                </div>
                <div className="pt-12 pb-6 px-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-bold tn-text">{user.name}</h1>
                            <p className="text-sm tn-text-sub">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isStaff ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                                    {isStaff ? 'Staff' : 'Member'}
                                </span>
                                {user.company && (
                                    <span className="text-xs tn-text-sub flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> {user.company}
                                    </span>
                                )}
                            </div>
                        </div>
                        {!editing ? (
                            <button onClick={() => {
                                setEditForm({
                                    name: user.name || '',
                                    phone: user.phone ? formatPhone(user.phone) : '',
                                    company: user.company || '',
                                    bio: user.bio || '',
                                });
                                setEditing(true);
                            }} className="text-xs tn-text-sub border tn-border px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5">
                                <Pencil className="h-3 w-3" /> 프로필 수정
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={() => {
                                    updateProfile({
                                        name: editForm.name,
                                        phone: editForm.phone,
                                        company: editForm.company,
                                        bio: editForm.bio,
                                    });
                                    setEditing(false);
                                }} className="text-xs text-white bg-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5">
                                    <Check className="h-3 w-3" /> 저장
                                </button>
                                <button onClick={() => setEditing(false)}
                                    className="text-xs tn-text-sub border tn-border px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5">
                                    <X className="h-3 w-3" /> 취소
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 기본 정보 ── */}
            <div className="rounded-2xl border tn-border tn-surface p-6">
                <h2 className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 tn-text-sub" /> 기본 정보
                </h2>
                {editing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField label="이름" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} />
                            <InfoItem label="이메일 (로그인 ID)" value={user.email || '-'} />
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
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <InfoItem label="이름" value={user.name || '-'} />
                            <InfoItem label="이메일" value={user.email || '-'} />
                            <InfoItem label="연락처" value={user.phone ? formatPhone(user.phone) : '-'} />
                            <InfoItem label="소속" value={user.company || '-'} />
                            <InfoItem label="가입일" value={user.createdAt?.substring(0, 10) || '-'} />
                            <InfoItem label="역할" value={user.role || 'Member'} />
                        </div>
                        {user.bio && (
                            <div className="mt-4 pt-4 border-t tn-border">
                                <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">자기소개</div>
                                <p className="text-sm tn-text">{user.bio}</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── 비밀번호 변경 ── */}
            <div className="rounded-2xl border tn-border tn-surface p-6">
                <button onClick={() => setPwdOpen(!pwdOpen)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-neutral-700">
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
                            className="text-xs text-white bg-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                            {pwdLoading ? '변경 중...' : '비밀번호 변경'}
                        </button>
                    </div>
                )}
            </div>

            {/* ── 유니버스 서비스 ── */}
            {sortedSites.length > 0 && (
                <div className="rounded-2xl border tn-border tn-surface p-6">
                    <h2 className="text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 tn-text-sub" /> 유니버스 서비스
                    </h2>
                    <p className="text-[11px] tn-text-sub mb-4">가입한 계정으로 모든 서비스를 이용할 수 있습니다.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sortedSites.map(s => {
                            const spData = serviceProfiles.find(sp => sp.siteId === s.id);
                            return (
                                <ServiceCard
                                    key={s.id}
                                    siteId={s.id}
                                    siteName={s.name}
                                    color={s.color}
                                    serviceData={spData}
                                    isClosed={siteConfigsLoaded && !openSiteIds.has(s.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── 직원 정보 (직원만) ── */}
            {isStaff && (
                <div className="rounded-2xl border tn-border tn-bg-alt p-6">
                    <h2 className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" /> 직원 정보
                    </h2>
                    <p className="text-[10px] text-neutral-400 mb-3">직원 정보는 관리자만 수정할 수 있습니다.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <InfoItem label="사번" value="-" />
                        <InfoItem label="부서" value="-" />
                        <InfoItem label="직위" value="-" />
                        <InfoItem label="입사일" value="-" />
                        <InfoItem label="권한" value={user.role || '-'} />
                        <InfoItem label="브랜드 접근" value="전체" />
                    </div>
                </div>
            )}
        </div>
    );
}
