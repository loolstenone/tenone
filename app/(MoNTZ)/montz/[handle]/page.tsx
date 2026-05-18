"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ExternalLink, Send, Share2, Check } from "lucide-react";
import { getCreatorByHandle, getCreatorWorks, type MontzCreator, type MontzWork, type MontzAvailability } from "@/lib/supabase/montz";
import { useAuth } from "@/lib/auth-context";
import { ContactModal } from "@/features/montz/ContactModal";

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

export default function MontzProfilePage() {
    const { handle } = useParams<{ handle: string }>();
    const { user } = useAuth();
    const [creator, setCreator] = useState<MontzCreator | null>(null);
    const [works, setWorks] = useState<MontzWork[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactOpen, setContactOpen] = useState(false);
    const [shareState, setShareState] = useState<"idle" | "copied">("idle");

    const handleShare = async () => {
        if (!creator) return;
        const url = typeof window !== "undefined" ? window.location.href : "";
        const shareData = {
            title: `MoNTZ — ${creator.display_name}`,
            text: `${creator.display_name} (@${creator.handle}) · MoNTZ 포트폴리오`,
            url,
        };
        // navigator.share 가능하면 우선 사용 (모바일)
        if (typeof navigator !== "undefined" && navigator.share) {
            try { await navigator.share(shareData); return; } catch { /* 취소 등은 무시 */ }
        }
        // 폴백: 클립보드 복사
        try {
            await navigator.clipboard.writeText(url);
            setShareState("copied");
            setTimeout(() => setShareState("idle"), 2000);
        } catch {
            // 클립보드 실패 — 그냥 무시 (브라우저 제약)
        }
    };

    useEffect(() => {
        getCreatorByHandle(handle).then(async (c) => {
            setCreator(c);
            if (c) {
                const w = await getCreatorWorks(c.id);
                setWorks(w);
            }
            setLoading(false);
        });
    }, [handle]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!creator) {
        const isOwnHandle = user?.email?.split("@")[0] === handle || user?.name?.toLowerCase().replace(/\s/g, "") === handle;
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-8 text-center">
                {isOwnHandle ? (
                    <>
                        <p className="text-[20px] font-black text-neutral-900">@{handle}</p>
                        <p className="text-[13px] text-neutral-500 mb-2">아직 MoNTZ 프로필이 없습니다.<br />지금 바로 만들어보세요.</p>
                        <Link href="/montz/profile" className="text-[13px] font-bold text-white bg-neutral-900 px-6 py-2.5 hover:bg-neutral-700 transition-colors">
                            프로필 만들기
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-[16px] font-bold text-neutral-900">크리에이터를 찾을 수 없습니다.</p>
                        <Link href="/montz/explore" className="text-[13px] text-neutral-500 hover:text-neutral-900">
                            탐색 페이지로 돌아가기
                        </Link>
                    </>
                )}
            </div>
        );
    }

    const hasMeasurements = creator.height || creator.bust || (creator.show_weight && creator.weight) || creator.shoe_size;

    return (
        <div className="min-h-screen bg-white">
            {/* Back */}
            <div className="px-5 pt-5 pb-1">
                <Link href="/montz/explore" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="h-3 w-3" />
                    탐색으로
                </Link>
            </div>

            {/* Cover */}
            {creator.cover_url && (
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
                        {creator.avatar_url ? (
                            <Image
                                src={creator.avatar_url}
                                alt={creator.display_name}
                                width={72}
                                height={72}
                                className="object-cover object-top w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[20px] font-black text-neutral-400">
                                {creator.display_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[18px] font-black text-neutral-900 leading-none">
                                {creator.display_name}
                            </p>
                            {creator.is_verified && (
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
                        <p className="text-[12px] font-mono text-neutral-500 mb-2">@{creator.handle}</p>
                        <div className="flex flex-wrap gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 ${AVAIL_COLOR[creator.availability_status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${AVAIL_DOT[creator.availability_status]}`} />
                                {AVAIL_LABEL[creator.availability_status]}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-700">
                                {TYPE_LABEL[creator.type]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between border-y border-neutral-100 py-3 mb-4">
                    {[
                        { label: "게시물", value: creator.work_count },
                        { label: "팔로워", value: creator.follower_count.toLocaleString() },
                        { label: "팔로잉", value: "—" },
                    ].map((s) => (
                        <div key={s.label} className="flex-1 text-center">
                            <p className="text-[18px] font-black text-neutral-900 leading-none">{s.value}</p>
                            <p className="text-[11px] text-neutral-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Measurements — 본인이 공개 설정한 항목만 표시 */}
                {hasMeasurements && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {creator.height && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">키</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.height} cm</p>
                            </div>
                        )}
                        {creator.show_weight && creator.weight && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">몸무게</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.weight} kg</p>
                            </div>
                        )}
                        {creator.bust && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">바스트·웨스트·힙</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.bust} / {creator.waist} / {creator.hip}</p>
                            </div>
                        )}
                        {creator.shoe_size && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">신발</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.shoe_size} mm</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Bio */}
                {creator.bio && (
                    <p className="text-[13px] text-neutral-900 leading-relaxed mb-4">{creator.bio}</p>
                )}

                {/* Portfolio Links */}
                {creator.portfolio_links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {creator.portfolio_links.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 border border-neutral-300 px-2 py-1 hover:border-neutral-900 transition-colors">
                                <ExternalLink className="h-3 w-3" />
                                링크
                            </a>
                        ))}
                    </div>
                )}

                {/* Action — 캐스팅 제안 (메인) + 공유 (보조) */}
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setContactOpen(true)}
                        className="flex-1 py-2.5 text-[13px] font-bold text-neutral-900 bg-[#c8a97e] hover:bg-[#d4b88c] transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Send size={13} />
                        캐스팅 제안 보내기
                    </button>
                    <button
                        onClick={handleShare}
                        className="px-4 py-2.5 text-[13px] font-bold text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-1.5 min-w-[88px]"
                        aria-label="프로필 공유"
                    >
                        {shareState === "copied" ? (
                            <><Check size={13} /> 복사됨</>
                        ) : (
                            <><Share2 size={13} /> 공유</>
                        )}
                    </button>
                </div>
            </div>

            {/* 캐스팅 컨택 모달 */}
            <ContactModal
                isOpen={contactOpen}
                onClose={() => setContactOpen(false)}
                targetCreatorId={creator.id}
                targetDisplayName={creator.display_name}
            />

            {/* Portfolio Grid */}
            <div className="border-t border-neutral-200">
            <div className="px-5 py-3 border-b border-neutral-100">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">포트폴리오</p>
            </div>
                {works.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-[13px] text-neutral-500">아직 등록된 작업이 없습니다.</p>
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

            {/* Bottom padding */}
            <div className="h-16" />
        </div>
    );
}
