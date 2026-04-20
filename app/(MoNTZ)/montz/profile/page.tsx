"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Edit2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCreatorByHandle, getCreatorWorks, type MontzCreator, type MontzWork, type MontzAvailability } from "@/lib/supabase/montz";
import { LoginModal } from "@/components/LoginModal";

const AVAIL_LABEL: Record<MontzAvailability, string> = {
    active: "활동중",
    selective: "외부활동",
    inactive: "비활동",
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

const MOCK_HANDLE = "jiwon.oh";

export default function MontzMyProfilePage() {
    const { isAuthenticated, user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [creator, setCreator] = useState<MontzCreator | null>(null);
    const [works, setWorks] = useState<MontzWork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCreatorByHandle(MOCK_HANDLE).then(async (c) => {
            setCreator(c);
            if (c) {
                const w = await getCreatorWorks(c.id);
                setWorks(w);
            }
            setLoading(false);
        });
    }, []);

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

    if (!creator) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5 text-center">
                <p className="text-[16px] font-black text-neutral-900">프로필을 설정하세요</p>
                <p className="text-[13px] text-neutral-500">MoNTZ 핸들을 등록하고 포트폴리오를 시작하세요.</p>
                <button className="text-[13px] font-bold text-white bg-neutral-900 px-6 py-2.5 hover:bg-neutral-700 transition-colors">
                    프로필 만들기
                </button>
            </div>
        );
    }

    const hasMeasurements = creator.height || creator.bust;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="px-5 pt-5 pb-1 flex items-center justify-between border-b border-neutral-200 pb-4">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">내 프로필</p>
                <button className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white transition-colors">
                    <Edit2 className="h-3 w-3" />
                    편집
                </button>
            </div>

            {/* Cover */}
            {creator.cover_url && (
                <div className="relative w-full aspect-[3/1] bg-neutral-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={creator.cover_url} alt="" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Profile Header */}
            <div className="px-5 pt-5">
                {/* Avatar + Name Row */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-[72px] h-[72px] rounded-full bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.name || ""} width={72} height={72} className="object-cover w-full h-full" />
                        ) : creator.avatar_url ? (
                            <Image src={creator.avatar_url} alt={creator.display_name} width={72} height={72} className="object-cover object-top w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[20px] font-black text-neutral-400">
                                {creator.display_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[18px] font-black text-neutral-900 leading-none">{creator.display_name}</p>
                            {creator.is_verified && (
                                <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "#c8a97e" }} />
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

                {/* Measurements */}
                {hasMeasurements && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {creator.height && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">키</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.height} cm</p>
                            </div>
                        )}
                        {creator.bust && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">가슴·허리·엉덩이</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.bust}·{creator.waist}·{creator.hip}</p>
                            </div>
                        )}
                        {creator.shoe_size && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">신발</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.shoe_size} mm</p>
                            </div>
                        )}
                        {(creator.hair_color || creator.eye_color) && (
                            <div className="border border-neutral-100 px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">헤어·눈</p>
                                <p className="text-[14px] font-black text-neutral-900">{creator.hair_color} · {creator.eye_color}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Bio */}
                {creator.bio && (
                    <p className="text-[13px] text-neutral-700 leading-relaxed mb-5">{creator.bio}</p>
                )}
            </div>

            {/* Portfolio Grid */}
            <div className="border-t border-neutral-200">
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
        </div>
    );
}
