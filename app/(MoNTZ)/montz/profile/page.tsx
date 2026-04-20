"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Globe, Plus, Settings, Share2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCreatorByUserId, getCreatorWorks, type MontzCreator, type MontzWork, type MontzAvailability } from "@/lib/supabase/montz";
import { LoginModal } from "@/components/LoginModal";
import { VerificationModal } from "@/features/montz/VerificationModal";
import { MontzOnboarding } from "@/features/montz/MontzOnboarding";

const AVAIL_LABEL: Record<MontzAvailability, string> = {
    active: "활동중",
    selective: "조건부",
    inactive: "휴식",
};
const AVAIL_COLOR: Record<MontzAvailability, string> = {
    active: "bg-emerald-50 text-emerald-700",
    selective: "bg-amber-50 text-amber-700",
    inactive: "bg-neutral-100 text-neutral-500",
};
const AVAIL_DOT: Record<MontzAvailability, string> = {
    active: "bg-emerald-400",
    selective: "bg-amber-400",
    inactive: "bg-neutral-300",
};
const TYPE_LABEL = { model: "모델", actor: "배우", both: "모델·배우" };

export default function MontzMyProfilePage() {
    const { isAuthenticated, user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [verifyOpen, setVerifyOpen] = useState(false);
    const [onboardOpen, setOnboardOpen] = useState(false);
    const [creator, setCreator] = useState<MontzCreator | null>(null);
    const [works, setWorks] = useState<MontzWork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        getCreatorByUserId(user.id).then(async (c) => {
            setCreator(c);
            if (c) {
                const w = await getCreatorWorks(c.id);
                setWorks(w);
            }
            setLoading(false);
        });
    }, [user?.id]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
                <p className="text-[16px] font-black text-neutral-900">로그인이 필요합니다</p>
                <p className="text-[13px] text-neutral-500">MoNTZ 프로필을 관리하려면 로그인하세요.</p>
                <button
                    onClick={() => setLoginOpen(true)}
                    className="text-[13px] font-bold text-white bg-neutral-900 px-6 py-2.5 hover:bg-neutral-700 transition-colors"
                >
                    로그인
                </button>
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    const handle = creator?.handle ?? user?.handle ?? user?.email?.split("@")[0] ?? "";
    const displayName = creator?.display_name ?? user?.name ?? "";
    const avatarUrl = user?.avatarUrl ?? creator?.avatar_url ?? null;
    const hasMeasurements = creator && (creator.height || creator.bust || (creator.show_weight && creator.weight) || creator.shoe_size);

    return (
        <div className="min-h-screen bg-white">
            {/* Cover */}
            {creator?.cover_url && (
                <div className="relative w-full aspect-[3/1] bg-neutral-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={creator.cover_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
                    />
                </div>
            )}

            {/* Profile Header */}
            <div className="px-5 pt-5 pb-0">
                {/* Avatar + Name Row */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-[72px] h-[72px] rounded-full bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt={displayName} width={72} height={72} className="object-cover object-top w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[20px] font-black text-neutral-400">
                                {displayName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[18px] font-black text-neutral-900 leading-none">{displayName}</p>
                            {creator?.is_verified && (
                                <div className="relative group">
                                    <BadgeCheck className="h-4 w-4 shrink-0 cursor-default" style={{ color: "#c8a97e" }} />
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                                        <div className="bg-neutral-900 text-white text-[11px] font-medium px-2.5 py-1.5 whitespace-nowrap">
                                            MoNTZ가 확인한 공식 계정
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="text-[12px] font-mono text-neutral-500">@{handle}</p>
                            <Link href="/profile" className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
                                <Globe className="h-3 w-3" />
                                Universe
                            </Link>
                        </div>
                        {creator && (
                            <div className="flex flex-wrap gap-1.5">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 ${AVAIL_COLOR[creator.availability_status]}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${AVAIL_DOT[creator.availability_status]}`} />
                                    {AVAIL_LABEL[creator.availability_status]}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-700">
                                    {TYPE_LABEL[creator.type]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between border-y border-neutral-100 py-3 mb-4">
                    {[
                        { label: "게시물", value: creator?.work_count ?? 0 },
                        { label: "팔로워", value: creator?.follower_count.toLocaleString() ?? 0 },
                        { label: "팔로잉", value: "—" },
                    ].map((s) => (
                        <div key={s.label} className="flex-1 text-center">
                            <p className="text-[18px] font-black text-neutral-900 leading-none">{s.value}</p>
                            <p className="text-[11px] text-neutral-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Bio */}
                {creator?.bio && (
                    <p className="text-[13px] text-neutral-700 leading-relaxed mb-3">{creator.bio}</p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mb-5">
                    {creator ? (
                        <>
                            <button
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                포트폴리오 올리기
                            </button>
                            <button className="p-2.5 border border-neutral-300 hover:border-neutral-600 transition-colors text-neutral-600">
                                <Share2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setOnboardOpen(true)}
                                className="p-2.5 border border-neutral-300 hover:border-neutral-600 transition-colors text-neutral-600"
                            >
                                <Settings className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setOnboardOpen(true)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                활동 정보 입력
                            </button>
                            <button
                                onClick={() => setOnboardOpen(true)}
                                className="p-2.5 border border-neutral-300 hover:border-neutral-600 transition-colors text-neutral-600"
                            >
                                <Settings className="h-3.5 w-3.5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Measurements */}
                {hasMeasurements && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {creator!.height && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">키</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator!.height} cm</p>
                            </div>
                        )}
                        {creator!.bust && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">바스트·웨스트·힙</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator!.bust}·{creator!.waist}·{creator!.hip}</p>
                            </div>
                        )}
                        {creator!.shoe_size && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">신발</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator!.shoe_size} mm</p>
                            </div>
                        )}
                        {(creator!.hair_color || creator!.eye_color) && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">헤어·눈</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator!.hair_color} · {creator!.eye_color}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Verification nudge */}
                {creator && !creator.is_verified && (
                    <button
                        onClick={() => setVerifyOpen(true)}
                        className="w-full mb-4 flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold text-neutral-500 border border-neutral-200 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        MoNTZ 공식 인증 신청
                    </button>
                )}
            </div>

            {/* Portfolio Grid */}
            <div className="border-t border-neutral-200">
                <div className="px-5 py-3 border-b border-neutral-100">
                    <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">포트폴리오</p>
                </div>
                {works.length === 0 ? (
                    <div className="py-16 text-center px-5">
                        <p className="text-[13px] text-neutral-500 mb-4">아직 등록된 작업이 없습니다.</p>
                        <button className="text-[13px] font-bold text-white bg-neutral-900 px-5 py-2.5 hover:bg-neutral-700 transition-colors">
                            첫 작업 올리기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-px bg-neutral-100">
                        {works.map((work) => (
                            <div key={work.id} className="relative aspect-square bg-neutral-50 overflow-hidden group cursor-pointer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={work.images[0]}
                                    alt={work.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-16" />

            {verifyOpen && <VerificationModal onClose={() => setVerifyOpen(false)} />}
            {onboardOpen && (
                <MontzOnboarding
                    onCreated={(c) => { setCreator(c); setOnboardOpen(false); }}
                    onClose={() => setOnboardOpen(false)}
                />
            )}
        </div>
    );
}
