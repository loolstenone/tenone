"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Loader2, X, AtSign, Mail, Phone, Calendar, Tag, Newspaper, ExternalLink, CircleDollarSign } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

/* ── 유형 정의 ── */
type MemberType = "잠재" | "서비스" | "멤버십" | "구독" | "복합" | "기타";

interface TypeDef {
    id: MemberType;
    label: string;
    desc: string;
    color: string;       // bar 색상 (tailwind bg-)
    badge: string;       // 뱃지 색상 (tailwind bg-/text-)
    cta: string;         // 업셀/크로스셀 힌트
    count: number;
}

/* 브랜드 site ID → 표시명 매핑 */
const BRAND_LABEL: Record<string, string> = {
    madleague: "MADLeague", madleap: "MADLeap", badak: "Badak",
    smarcomm: "SmarComm", wio: "WIO", "wio-orbi": "WIO Orbi",
    hero: "HeRo", "planners": "Planner's", evschool: "Evolution School",
    mindle: "Mindle", rook: "RooK", changeup: "ChangeUp",
    youinone: "YouInOne", domo: "Domo", myverse: "Myverse",
    brandgravity: "BrandGravity", "0gamja": "0gamja", fwn: "FWN",
    montz: "MoNTZ", mullaesian: "Mullaesian", trendhunter: "TrendHunter",
    seoul360: "Seoul360", townity: "Townity", jakka: "Jakka", naturebox: "NatureBox",
};
const VALID_BRAND_IDS = new Set(Object.keys(BRAND_LABEL));

/* 구독 서비스명 → 표시명 (subscriptions.service 필드 값 기준) */
const SUB_LABEL: Record<string, string> = {
    smarcomm: "SmarComm", SmarComm: "SmarComm",
    wio: "WIO", WIO: "WIO", "wio-orbi": "WIO Orbi", "WIO Orbi": "WIO Orbi",
    youinone: "YouInOne", YouInOne: "YouInOne",
    "evolution-school": "Evolution School", "Evolution School": "Evolution School",
    mindle: "Mindle", Mindle: "Mindle",
    brandgravity: "BrandGravity", BrandGravity: "BrandGravity",
};

/* 브랜드 → 유형 매핑 (표시명 기준) */
const POTENTIAL_BRANDS  = new Set(["MADLeague", "MADLeap", "ChangeUp", "Evolution School"]);
const SERVICE_BRANDS    = new Set(["Badak", "HeRo", "Planner's", "Mindle", "RooK", "0gamja", "FWN", "MoNTZ", "Mullaesian", "TrendHunter", "Seoul360", "Townity", "Jakka", "NatureBox"]);
const MEMBERSHIP_BRANDS = new Set(["YouInOne", "Domo", "Myverse"]);
const SUBSCRIBE_BRANDS  = new Set(["SmarComm", "WIO", "WIO Orbi", "BrandGravity"]);

/* 소속(커뮤니티/멤버십) vs 이용(구독/구매) 구분 */
const BELONGS_TO_BRANDS = new Set(["MADLeague", "MADLeap", "YouInOne", "Domo", "Myverse", "Badak"]);

function classifyMember(brands: string[]): MemberType {
    const hasPotential  = brands.some(b => POTENTIAL_BRANDS.has(b));
    const hasService    = brands.some(b => SERVICE_BRANDS.has(b));
    const hasMembership = brands.some(b => MEMBERSHIP_BRANDS.has(b));
    const hasSubscribe  = brands.some(b => SUBSCRIBE_BRANDS.has(b));

    const typeCount = [hasPotential, hasService, hasMembership, hasSubscribe].filter(Boolean).length;
    if (typeCount >= 2) return "복합";
    if (hasSubscribe)  return "구독";
    if (hasMembership) return "멤버십";
    if (hasService)    return "서비스";
    if (hasPotential)  return "잠재";
    return "기타";
}

/** affiliations 배열에서 유효한 브랜드 표시명만 추출 */
function affiliationsToBrands(affiliations: string[]): string[] {
    return (affiliations || [])
        .filter(a => VALID_BRAND_IDS.has(a.toLowerCase()))
        .map(a => BRAND_LABEL[a.toLowerCase()] ?? a);
}

const TYPE_META: Record<MemberType, Omit<TypeDef, "id" | "count">> = {
    잠재:   { label: "잠재",   desc: "커뮤니티/교육 이용 중",  color: "bg-slate-400",   badge: "bg-slate-100 text-slate-600",    cta: "유료 서비스 전환 유도" },
    서비스: { label: "서비스", desc: "개별 서비스 이용 중",    color: "bg-blue-400",    badge: "bg-blue-100 text-blue-700",      cta: "SmarComm / WIO 구독 제안" },
    멤버십: { label: "멤버십", desc: "YouInOne / Domo 멤버", color: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700", cta: "구독형 서비스 크로스셀" },
    구독:   { label: "구독",   desc: "SmarComm / WIO 구독",  color: "bg-violet-400",  badge: "bg-violet-100 text-violet-700",  cta: "플랜 업그레이드 제안" },
    복합:   { label: "복합",   desc: "2개 이상 유형 이용",    color: "bg-amber-400",   badge: "bg-amber-100 text-amber-700",    cta: "핵심 고객 — 유지 집중" },
    기타:   { label: "기타",   desc: "분류 미해당",           color: "bg-neutral-300", badge: "bg-neutral-100 text-neutral-500", cta: "브랜드 연결 필요" },
};

/* ── 브랜드 뱃지 색상 ── */
const brandColors: Record<string, string> = {
    MADLeague: "bg-violet-100 text-violet-700",
    MADLeap: "bg-indigo-100 text-indigo-700",
    Badak: "bg-amber-100 text-amber-700",
    SmarComm: "bg-emerald-100 text-emerald-700",
    "WIO Orbi": "bg-blue-100 text-blue-700",
    WIO: "bg-blue-100 text-blue-700",
    HeRo: "bg-rose-100 text-rose-700",
    "Planner's": "bg-teal-100 text-teal-700",
    "Evolution School": "bg-orange-100 text-orange-700",
    Mindle: "bg-cyan-100 text-cyan-700",
    RooK: "bg-pink-100 text-pink-700",
    ChangeUp: "bg-lime-100 text-lime-700",
    YouInOne: "bg-purple-100 text-purple-700",
    Domo: "bg-sky-100 text-sky-700",
};

const brandOptions = ["MADLeague", "MADLeap", "Badak", "SmarComm", "WIO", "WIO Orbi", "HeRo", "Planner's", "Evolution School", "Mindle", "RooK", "ChangeUp", "YouInOne", "Domo"];
const TYPE_ORDER: MemberType[] = ["잠재", "서비스", "멤버십", "구독", "복합", "기타"];

interface RoleEntry { role: string; context: string | null; }

interface MemberDisplay {
    id: string;
    name: string;
    email: string;
    handle: string | null;
    phone: string | null;
    bio: string | null;
    company: string | null;
    position: string | null;
    type: MemberType;
    brands: string[];
    subs: { service: string; plan: string }[];
    lastActive: string;
    createdAt: string;
    roles: string[];
    memberRoles: RoleEntry[];
    isNewsletterSub: boolean;
    signupSource: string | null;
    ucBalance: number;
}

/* ── Mock fallback ── */
const mockMembers: MemberDisplay[] = [
    { id: "1",  name: "김민지", email: "minji@example.com",    handle: "@minji",   phone: "010-1234-5678", bio: null, company: "텐원", position: "마케터", type: "복합",   brands: ["MADLeap", "SmarComm"],  subs: [{ service: "SmarComm", plan: "Pro" }], lastActive: "2026-03-29", createdAt: "2025-01-10", roles: [], memberRoles: [], isNewsletterSub: true,  signupSource: null, ucBalance: 0 },
    { id: "2",  name: "이준혁", email: "junhyuk@example.com",  handle: "@junhyuk", phone: null,           bio: null, company: null,  position: null,    type: "구독",   brands: ["WIO Orbi"],            subs: [{ service: "WIO Orbi", plan: "Business" }], lastActive: "2026-03-29", createdAt: "2025-02-01", roles: [], memberRoles: [], isNewsletterSub: false, signupSource: null, ucBalance: 0 },
    { id: "3",  name: "박서윤", email: "seoyoon@example.com",  handle: null,       phone: "010-9999-0001", bio: null, company: null,  position: null,    type: "서비스", brands: ["Evolution School", "HeRo"], subs: [{ service: "Evolution School", plan: "Standard" }], lastActive: "2026-03-28", createdAt: "2025-03-05", roles: [], memberRoles: [], isNewsletterSub: false, signupSource: "MADLeague 추천", ucBalance: 0 },
    { id: "4",  name: "정하은", email: "haeun@example.com",    handle: "@haeun",   phone: null,           bio: null, company: null,  position: null,    type: "서비스", brands: ["Mindle"],              subs: [], lastActive: "2026-03-27", createdAt: "2025-04-11", roles: [], memberRoles: [], isNewsletterSub: true,  signupSource: null, ucBalance: 0 },
    { id: "5",  name: "최다운", email: "dawoon@example.com",   handle: null,       phone: null,           bio: null, company: null,  position: null,    type: "서비스", brands: ["HeRo", "Badak"],       subs: [], lastActive: "2026-03-28", createdAt: "2025-05-20", roles: [], memberRoles: [], isNewsletterSub: false, signupSource: null, ucBalance: 0 },
];

export default function UniverseMembers() {
    const [search, setSearch]           = useState("");
    const [typeFilter, setTypeFilter]   = useState<MemberType | null>(null);
    const [brandFilter, setBrandFilter] = useState<string | null>(null);
    const [roleFilter, setRoleFilter]   = useState<string | null>(null);
    const [loading, setLoading]         = useState(true);
    const [typeDefs, setTypeDefs]       = useState<TypeDef[]>([]);
    const [members, setMembers]         = useState<MemberDisplay[]>(mockMembers);
    const [selected, setSelected]       = useState<MemberDisplay | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/intra/members');
                if (!res.ok) {
                    console.error('Members API error:', res.status);
                    return;
                }
                const json = await res.json();
                const rawMembers = json.members ?? [];
                if (!rawMembers.length) return;

                const subsMap: Record<string, { service: string; plan: string }[]> = {};
                (json.subscriptions || []).forEach((s: { member_id: string; service: string; plan: string }) => {
                    if (!subsMap[s.member_id]) subsMap[s.member_id] = [];
                    subsMap[s.member_id].push({ service: s.service, plan: s.plan });
                });

                const newsletterEmails = new Set<string>(json.newsletterEmails ?? []);
                const ucBalances: Record<string, number> = json.ucBalances ?? {};
                const memberRolesMap: Record<string, RoleEntry[]> = json.memberRoles ?? {};

                const typeCounts: Record<MemberType, number> = { 잠재: 0, 서비스: 0, 멤버십: 0, 구독: 0, 복합: 0, 기타: 0 };

                const memberList: MemberDisplay[] = rawMembers.map((m: {
                    id: string; name: string; email: string;
                    handle: string | null; phone: string | null;
                    bio: string | null; company: string | null; position: string | null;
                    affiliations: string[]; roles: string[]; last_login_at: string | null; created_at: string;
                    signup_source?: string | null;
                }) => {
                    // 브랜드: affiliations 중 유효한 brand ID + 구독 서비스명 합산
                    const affBrands = affiliationsToBrands(m.affiliations || []);
                    const subBrands = (subsMap[m.id] || []).map(s => SUB_LABEL[s.service] ?? s.service);
                    const brands = Array.from(new Set([...affBrands, ...subBrands]));

                    const type = classifyMember(brands);
                    typeCounts[type]++;
                    return {
                        id: m.id,
                        name: m.name,
                        email: m.email,
                        handle: m.handle ?? null,
                        phone: m.phone ?? null,
                        bio: m.bio ?? null,
                        company: m.company ?? null,
                        position: m.position ?? null,
                        type,
                        brands,
                        subs: subsMap[m.id] || [],
                        lastActive: m.last_login_at ? m.last_login_at.split("T")[0] : "-",
                        createdAt: m.created_at ? m.created_at.split("T")[0] : "-",
                        roles: m.roles ?? [],
                        memberRoles: memberRolesMap[m.id] ?? [],
                        isNewsletterSub: newsletterEmails.has(m.email.toLowerCase()),
                        signupSource: m.signup_source ?? null,
                        ucBalance: ucBalances[m.id] ?? 0,
                    };
                });

                setMembers(memberList);
                setTypeDefs(TYPE_ORDER.map(t => ({ id: t, ...TYPE_META[t], count: typeCounts[t] })));
            } catch (err) {
                console.error("Members fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    /* mock 기반 typeDefs 초기화 */
    useEffect(() => {
        if (!loading || typeDefs.length > 0) return;
        const counts: Record<MemberType, number> = { 잠재: 0, 서비스: 0, 멤버십: 0, 구독: 0, 복합: 0, 기타: 0 };
        mockMembers.forEach(m => counts[m.type]++);
        setTypeDefs(TYPE_ORDER.map(t => ({ id: t, ...TYPE_META[t], count: counts[t] })));
    }, [loading, typeDefs.length]);

    const totalMembers = typeDefs.reduce((s, t) => s + t.count, 0) || members.length;

    const filtered = useMemo(() => members.filter(m => {
        if (search && !m.name.includes(search) && !m.email.includes(search)) return false;
        if (typeFilter && m.type !== typeFilter) return false;
        if (brandFilter && !m.brands.includes(brandFilter)) return false;
        if (roleFilter) {
            // brand:xxx 형태면 context 매칭, 그냥 role명이면 role 매칭
            if (roleFilter.startsWith('brand:')) {
                if (!m.memberRoles.some(r => r.context === roleFilter)) return false;
            } else {
                if (!m.memberRoles.some(r => r.role === roleFilter)) return false;
            }
        }
        return true;
    }), [search, typeFilter, brandFilter, roleFilter, members]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    const hasFilter = !!(typeFilter || brandFilter || roleFilter || search);

    return (
        <div className="space-y-6">
            <PageHeader title="통합 회원" description="전체 브랜드 통합 회원 관리" />

            {/* 유형별 분포 + 필터 통합 카드 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
                {/* 상단: 제목 + 검색/브랜드 필터 */}
                <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-neutral-900 shrink-0">유형별 분포</p>
                    <p className="text-xs text-neutral-400 shrink-0">전체 {totalMembers.toLocaleString()}명</p>
                    <div className="flex-1" />
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input type="text" placeholder="이름 또는 이메일"
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 w-44" />
                    </div>
                    <div className="relative">
                        <select value={brandFilter || ""} onChange={e => setBrandFilter(e.target.value || null)}
                            className={`appearance-none pl-3 pr-7 py-1.5 text-xs border rounded-md focus:outline-none focus:border-neutral-400 bg-white ${brandFilter ? "border-violet-400 text-violet-700" : "border-neutral-200 text-neutral-600"}`}>
                            <option value="">브랜드</option>
                            {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select value={roleFilter || ""} onChange={e => setRoleFilter(e.target.value || null)}
                            className={`appearance-none pl-3 pr-7 py-1.5 text-xs border rounded-md focus:outline-none focus:border-neutral-400 bg-white ${roleFilter ? "border-amber-400 text-amber-700" : "border-neutral-200 text-neutral-600"}`}>
                            <option value="">권한</option>
                            <optgroup label="Role">
                                <option value="approved_member">approved_member</option>
                                <option value="leader">leader</option>
                                <option value="staff">staff</option>
                                <option value="manager">manager</option>
                                <option value="super_admin">super_admin</option>
                            </optgroup>
                            <optgroup label="Brand Context">
                                <option value="brand:madleague">brand:madleague</option>
                                <option value="brand:madleap">brand:madleap</option>
                                <option value="brand:badak">brand:badak</option>
                                <option value="brand:rook">brand:rook</option>
                                <option value="brand:youinone">brand:youinone</option>
                                <option value="brand:domo">brand:domo</option>
                                <option value="brand:jakka">brand:jakka</option>
                                <option value="brand:hero">brand:hero</option>
                            </optgroup>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
                    </div>
                    {hasFilter && (
                        <button onClick={() => { setTypeFilter(null); setBrandFilter(null); setRoleFilter(null); setSearch(""); }}
                            className="text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1.5 flex items-center gap-1">
                            <X className="h-3 w-3" />초기화
                        </button>
                    )}
                </div>

                {/* 분포 바 */}
                <div className="flex h-5 rounded-full overflow-hidden bg-neutral-100">
                    {typeDefs.map(t => (
                        <div key={t.id}
                            className={`${t.color} relative group cursor-pointer transition-opacity ${typeFilter && typeFilter !== t.id ? "opacity-30" : ""}`}
                            style={{ width: `${totalMembers > 0 ? (t.count / totalMembers) * 100 : 0}%`, minWidth: t.count > 0 ? "4px" : "0" }}
                            onClick={() => setTypeFilter(typeFilter === t.id ? null : t.id)}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {t.label}: {t.count}명
                            </div>
                        </div>
                    ))}
                </div>

                {/* 유형 칩 */}
                <div className="flex flex-wrap gap-2">
                    {typeDefs.map(t => (
                        <button key={t.id}
                            onClick={() => setTypeFilter(typeFilter === t.id ? null : t.id)}
                            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                                typeFilter === t.id
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                            }`}>
                            <span className={`h-2 w-2 rounded-full ${t.color}`} />
                            {t.label} <span className="opacity-60">({t.count})</span>
                        </button>
                    ))}
                    {typeFilter && (
                        <span className="self-center text-xs text-violet-600 font-medium ml-1">
                            → {TYPE_META[typeFilter].cta}
                        </span>
                    )}
                </div>
            </div>

            {/* 테이블 */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이메일</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">유형</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">소속 · 이용</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">구독</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">마지막 활동</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filtered.map(m => {
                                const meta = TYPE_META[m.type];
                                return (
                                    <tr key={m.id}
                                        className="hover:bg-neutral-50 transition-colors cursor-pointer"
                                        onClick={() => setSelected(m)}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] font-medium shrink-0">
                                                    {m.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{m.name}</p>
                                                    {m.handle && <p className="text-[10px] text-neutral-400">{m.handle}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">{m.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {m.brands.length > 0 ? m.brands.map(b => (
                                                    <span key={b} className={`text-[10px] px-1.5 py-0.5 rounded ${brandColors[b] || "bg-neutral-100 text-neutral-600"}`}>
                                                        {b}
                                                    </span>
                                                )) : <span className="text-[10px] text-neutral-300">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {m.subs.length > 0
                                                ? <div className="flex flex-col gap-0.5">
                                                    {m.subs.map((s, i) => (
                                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                                                            {s.service} · {s.plan}
                                                        </span>
                                                    ))}
                                                </div>
                                                : <span className="text-[10px] text-neutral-300">-</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-400">{m.lastActive}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-sm text-neutral-400">검색 결과가 없습니다</div>
                )}
            </div>

            {/* 회원 상세 드로어 */}
            {selected && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />
                    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col overflow-y-auto">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-semibold">
                                    {selected.name[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-900">{selected.name}</p>
                                    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_META[selected.type].badge}`}>
                                        {selected.type}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 px-5 py-4 space-y-5">
                            {/* 기본정보 */}
                            <section>
                                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">기본정보</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5">
                                        <AtSign className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                        <span className="text-sm text-neutral-700">{selected.handle ?? <span className="text-neutral-300 italic text-xs">핸들 미설정</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                        <span className="text-sm text-neutral-700">{selected.email}</span>
                                        {selected.isNewsletterSub && (
                                            <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600">
                                                <Newspaper className="h-2.5 w-2.5" />뉴스레터
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                        <span className="text-sm text-neutral-700">{selected.phone ?? <span className="text-neutral-300 italic text-xs">전화번호 미등록</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                        <span className="text-sm text-neutral-700">가입 {selected.createdAt}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CircleDollarSign className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                        <span className="text-sm text-neutral-700">
                                            {selected.ucBalance.toLocaleString()} UC
                                        </span>
                                    </div>
                                    {selected.signupSource && (
                                        <div className="flex items-center gap-2.5">
                                            <ExternalLink className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                            <span className="text-sm text-neutral-700">{selected.signupSource}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 공통정보 */}
                            {(selected.company || selected.position || selected.bio) && (
                                <section>
                                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">공통정보</p>
                                    <div className="space-y-1.5 text-sm text-neutral-700">
                                        {selected.position && <p>{selected.position}{selected.company ? ` · ${selected.company}` : ""}</p>}
                                        {!selected.position && selected.company && <p>{selected.company}</p>}
                                        {selected.bio && <p className="text-neutral-500 text-xs leading-relaxed">{selected.bio}</p>}
                                    </div>
                                </section>
                            )}

                            {/* 소속 브랜드 (커뮤니티/멤버십) */}
                            {(() => {
                                const belongs = selected.brands.filter(b => BELONGS_TO_BRANDS.has(b));
                                const uses = selected.brands.filter(b => !BELONGS_TO_BRANDS.has(b));
                                return (
                                    <>
                                        <section>
                                            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">소속</p>
                                            {belongs.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {belongs.map(b => (
                                                        <span key={b} className={`text-xs px-2 py-1 rounded-md ${brandColors[b] || "bg-neutral-100 text-neutral-600"}`}>{b}</span>
                                                    ))}
                                                </div>
                                            ) : <p className="text-xs text-neutral-300 italic">소속 브랜드 없음</p>}
                                        </section>
                                        <section>
                                            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">이용</p>
                                            {uses.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {uses.map(b => (
                                                        <span key={b} className={`text-xs px-2 py-1 rounded-md ${brandColors[b] || "bg-neutral-100 text-neutral-600"}`}>{b}</span>
                                                    ))}
                                                </div>
                                            ) : <p className="text-xs text-neutral-300 italic">이용 서비스 없음</p>}
                                        </section>
                                    </>
                                );
                            })()}

                            {/* 구독 */}
                            {selected.subs.length > 0 && (
                                <section>
                                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">구독</p>
                                    <div className="space-y-1">
                                        {selected.subs.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-green-50 rounded-md">
                                                <span className="text-green-800 font-medium">{s.service}</span>
                                                <span className="text-green-600">{s.plan}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 역할 */}
                            {(selected.memberRoles?.length ?? 0) > 0 && (
                                <section>
                                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">권한</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.memberRoles.map((r, i) => (
                                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-1">
                                                <Tag className="h-2.5 w-2.5" />
                                                {r.role}{r.context ? <span className="opacity-60 ml-0.5">@ {r.context}</span> : null}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 업셀링 힌트 */}
                            <section className="border border-violet-100 rounded-lg p-3 bg-violet-50">
                                <p className="text-[11px] font-semibold text-violet-600 mb-1">영업 액션</p>
                                <p className="text-xs text-violet-700">{TYPE_META[selected.type].cta}</p>
                                <p className="text-[10px] text-violet-400 mt-0.5">{TYPE_META[selected.type].desc}</p>
                            </section>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
