"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ExternalLink, Megaphone, Users, ImageIcon, BadgeCheck, Star, RefreshCw, Check } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { getAllMontzCreatorsAdmin, getAllMontzAuditions, setHeroCreator, type MontzCreator, type MontzCreatorType, type MontzAvailability, type MontzHeroMode } from "@/lib/supabase/montz";

const TYPE_LABEL: Record<MontzCreatorType, string> = { model: "모델", actor: "배우", both: "모델·배우" };
const AVAIL_LABEL: Record<MontzAvailability, string> = { active: "활동중", selective: "조건부", inactive: "휴식" };
const AVAIL_DOT: Record<MontzAvailability, string> = {
    active: "bg-emerald-400", selective: "bg-amber-400", inactive: "bg-neutral-300"
};

type FilterType = "전체" | MontzCreatorType | MontzAvailability;
const TYPE_FILTERS: FilterType[] = ["전체", "model", "actor", "both"];
const AVAIL_FILTERS: MontzAvailability[] = ["active", "selective", "inactive"];

function CreatorRow({ creator }: { creator: MontzCreator }) {
    return (
        <div className="flex items-center gap-3 py-3 px-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
            <div className="w-9 h-9 shrink-0 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
                {creator.avatar_url ? (
                    <Image src={creator.avatar_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-neutral-900 truncate">{creator.display_name}</span>
                    {creator.is_verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#c8a97e" }} />}
                    <span className="text-[11px] text-neutral-400 font-mono shrink-0">@{creator.handle}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-neutral-500">{TYPE_LABEL[creator.type]}</span>
                    {creator.age_group && <span className="text-[11px] text-neutral-400">{creator.age_group}</span>}
                    {creator.height && <span className="text-[11px] text-neutral-400">{creator.height}cm</span>}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 border border-neutral-200`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${AVAIL_DOT[creator.availability_status]}`} />
                    {AVAIL_LABEL[creator.availability_status]}
                </span>
                <span className="text-[11px] text-neutral-400 w-12 text-right">{creator.work_count}작업</span>
                <Link
                    href={`/montz/${creator.handle}`}
                    target="_blank"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                </Link>
            </div>
        </div>
    );
}

const HERO_MODES: { mode: MontzHeroMode; label: string; desc: string }[] = [
    { mode: "latest",    label: "최신 등록",    desc: "가장 최근에 가입한 크리에이터" },
    { mode: "followers", label: "팔로워 최다",  desc: "팔로워 수가 가장 많은 크리에이터" },
    { mode: "verified",  label: "인증 크리에이터", desc: "MoNTZ 공식 인증 크리에이터 중 팔로워 최다" },
    { mode: "manual",    label: "수동 선택",    desc: "아래 목록에서 직접 지정" },
];

function HeroPanel({ creators, onUpdated }: { creators: MontzCreator[]; onUpdated: () => void }) {
    const [saving, setSaving] = useState(false);
    const [savedMode, setSavedMode] = useState<MontzHeroMode | null>(null);
    const [manualSearch, setManualSearch] = useState("");

    const currentHero = creators.find((c) => c.is_hero);

    async function applyMode(mode: MontzHeroMode) {
        setSaving(true);
        let target: MontzCreator | undefined;
        if (mode === "latest") {
            target = [...creators].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
        } else if (mode === "followers") {
            target = [...creators].sort((a, b) => b.follower_count - a.follower_count)[0];
        } else if (mode === "verified") {
            target = [...creators].filter((c) => c.is_verified).sort((a, b) => b.follower_count - a.follower_count)[0];
        }
        if (target) {
            await setHeroCreator(target.id);
            setSavedMode(mode);
            onUpdated();
        }
        setSaving(false);
    }

    async function applyManual(id: string) {
        setSaving(true);
        await setHeroCreator(id);
        setSavedMode("manual");
        onUpdated();
        setSaving(false);
    }

    const manualFiltered = manualSearch
        ? creators.filter((c) =>
            c.display_name.toLowerCase().includes(manualSearch.toLowerCase()) ||
            c.handle.toLowerCase().includes(manualSearch.toLowerCase())
          )
        : creators.slice(0, 6);

    return (
        <div className="mb-6 border border-neutral-200 bg-white">
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[12px] font-bold text-neutral-900">히어로 크리에이터</span>
                </div>
                {currentHero && (
                    <span className="text-[11px] text-neutral-500">
                        현재: <strong className="text-neutral-900">{currentHero.display_name}</strong> @{currentHero.handle}
                    </span>
                )}
            </div>

            {/* 선정 가이드 버튼 */}
            <div className="p-4 border-b border-neutral-100">
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3">선정 가이드</p>
                <div className="grid grid-cols-2 gap-2">
                    {HERO_MODES.filter((m) => m.mode !== "manual").map(({ mode, label, desc }) => (
                        <button
                            key={mode}
                            onClick={() => applyMode(mode)}
                            disabled={saving}
                            className={`flex items-start gap-2 p-3 border text-left transition-colors hover:border-neutral-400 disabled:opacity-40 ${
                                savedMode === mode ? "border-emerald-500 bg-emerald-50" : "border-neutral-200"
                            }`}
                        >
                            {savedMode === mode
                                ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                : <RefreshCw className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            }
                            <div>
                                <p className="text-[12px] font-bold text-neutral-900">{label}</p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">{desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 수동 선택 */}
            <div className="p-4">
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3">수동 선택</p>
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                    <input
                        type="text"
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        placeholder="이름 또는 핸들 검색"
                        className="w-full border border-neutral-200 pl-7 pr-3 py-1.5 text-[12px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                    />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {manualFiltered.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => applyManual(c.id)}
                            disabled={saving}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-neutral-50 disabled:opacity-40 ${
                                c.is_hero ? "bg-amber-50 border border-amber-200" : "border border-transparent"
                            }`}
                        >
                            <div className="w-7 h-7 shrink-0 rounded-full bg-neutral-100 overflow-hidden">
                                {c.avatar_url
                                    ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">{c.display_name.charAt(0)}</div>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-neutral-900 truncate">{c.display_name}</p>
                                <p className="text-[10px] text-neutral-400 font-mono">@{c.handle}</p>
                            </div>
                            {c.is_hero && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function MontzIntraPage() {
    const [creators, setCreators] = useState<MontzCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<FilterType>("전체");
    const [availFilter, setAvailFilter] = useState<MontzAvailability | "전체">("전체");
    const [auditionCount, setAuditionCount] = useState(0);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const [c, a] = await Promise.all([
            getAllMontzCreatorsAdmin(),
            getAllMontzAuditions(),
        ]);
        setCreators(c);
        setAuditionCount(a.filter((x) => x.is_active).length);
        setLoading(false);
    }

    const filtered = creators.filter((c) => {
        const matchSearch =
            !search ||
            c.display_name.toLowerCase().includes(search.toLowerCase()) ||
            c.handle.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "전체" || c.type === (typeFilter as MontzCreatorType) || c.type === "both";
        const matchAvail = availFilter === "전체" || c.availability_status === availFilter;
        return matchSearch && matchType && matchAvail;
    });

    return (
        <div className="p-6 max-w-3xl">
            <PageHeader title="MoNTZ" description="모델·배우 크리에이터 관리">
                <Link
                    href="/intra/ums/montz/auditions"
                    className="flex items-center gap-1.5 text-[12px] text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:border-neutral-400 transition-colors"
                >
                    <Megaphone className="w-3.5 h-3.5" />
                    오디션 공고 관리
                </Link>
            </PageHeader>

            {!loading && <HeroPanel creators={creators} onUpdated={load} />}

            <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard
                    label="전체 크리에이터"
                    value={loading ? "—" : creators.length}
                    icon={<Users className="w-4 h-4 text-neutral-400" />}
                />
                <StatCard
                    label="활동중"
                    value={loading ? "—" : creators.filter((c) => c.availability_status === "active").length}
                />
                <StatCard
                    label="활성 공고"
                    value={loading ? "—" : auditionCount}
                    icon={<Megaphone className="w-4 h-4 text-neutral-400" />}
                    href="/intra/ums/montz/auditions"
                />
            </div>

            <div className="flex flex-col gap-2 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="이름, 핸들 검색"
                        className="w-full border border-neutral-200 pl-8 pr-3 py-2 text-[13px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {TYPE_FILTERS.map((f) => (
                        <button key={f} onClick={() => setTypeFilter(f)}
                            className={`text-[11px] px-2.5 py-1 border transition-colors ${
                                typeFilter === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                            }`}>
                            {f === "전체" ? "전체" : TYPE_LABEL[f as MontzCreatorType]}
                        </button>
                    ))}
                    <span className="text-neutral-300 self-center">|</span>
                    {(["전체", ...AVAIL_FILTERS] as const).map((f) => (
                        <button key={f} onClick={() => setAvailFilter(f)}
                            className={`text-[11px] px-2.5 py-1 border transition-colors ${
                                availFilter === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                            }`}>
                            {f === "전체" ? "전체" : AVAIL_LABEL[f]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-neutral-200 bg-white">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50">
                    <div className="w-9 shrink-0" />
                    <span className="flex-1 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">크리에이터</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest shrink-0 w-32 text-right">상태 / 작업</span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">불러오는 중…</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">크리에이터가 없습니다</div>
                ) : (
                    filtered.map((c) => <CreatorRow key={c.id} creator={c} />)
                )}

                {!loading && (
                    <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-400">
                        {filtered.length}명 / 전체 {creators.length}명
                    </div>
                )}
            </div>
        </div>
    );
}
