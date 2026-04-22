"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { MyProfileCard } from "@/components/MyProfileCard";
import HitProfileBadge from "@/features/hit/HitProfileBadge";
import { useRouter } from "next/navigation";
import {
    ArrowRight, ClipboardList,
    Clock, Shield, UserCheck, XCircle,
    LogOut, Users
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MadMemberInfo {
    role: string;
    club_id: string | null;
    club_name?: string;
    name?: string;
    activity_years?: number[];
    cohort?: number;
    university?: string;
}

export default function MadLeagueMyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [madInfo, setMadInfo] = useState<MadMemberInfo | null>(null);
    const [madStatus, setMadStatus] = useState<'loading' | 'none' | 'pending' | 'active'>('loading');
    const [pendingApps, setPendingApps] = useState<{ id: string; name: string; university: string; created_at: string }[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id || !user?.email) return;
        const sb = createClient();

        sb.from('mad_members')
            .select('role, club_id, name, activity_years, cohort, university')
            .eq('user_id', user.id)
            .maybeSingle()
            .then(async ({ data: member }: { data: any }) => {
                if (member) {
                    const info: MadMemberInfo = { ...member };
                    if (member.club_id) {
                        const { data: club } = await sb.from('mad_clubs').select('name').eq('id', member.club_id).maybeSingle();
                        if (club) info.club_name = club.name;
                    }
                    setMadInfo(info);
                    setMadStatus('active');
                } else {
                    const { data: app } = await sb
                        .from('mad_applications')
                        .select('id, status')
                        .eq('email', user.email!)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    setMadStatus(app ? 'pending' : 'none');
                }
            });
    }, [user?.id, user?.email]);

    useEffect(() => {
        if (!madInfo?.club_id || madInfo.role !== 'club_leader') return;
        const sb = createClient();
        sb.from('mad_applications')
            .select('id, name, university, created_at')
            .eq('club_id', madInfo.club_id)
            .eq('status', 'pending')
            .eq('applicant_role', 'member')
            .order('created_at', { ascending: false })
            .then(({ data }: { data: any[] | null }) => setPendingApps(data ?? []));
    }, [madInfo?.club_id, madInfo?.role]);

    async function handleApprove(appId: string) {
        setProcessingId(appId);
        await fetch(`/api/madleague/applications/${appId}/approve`, { method: 'POST' });
        setPendingApps(prev => prev.filter(a => a.id !== appId));
        setProcessingId(null);
    }

    async function handleReject(appId: string) {
        setProcessingId(appId);
        await fetch(`/api/madleague/applications/${appId}/reject`, { method: 'POST' });
        setPendingApps(prev => prev.filter(a => a.id !== appId));
        setProcessingId(null);
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="h-6 w-6 border-2 border-neutral-600 border-t-[#EC1D25] rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-black">
            <LoginModal isOpen={true} onClose={() => {}} accentColor="#EC1D25" />
        </div>
    );

    const roleLabel = madInfo?.role === 'mentor' ? '멘토'
        : madInfo?.role === 'club_leader' ? `${madInfo.club_name ?? ''} 회장`
        : madInfo?.role === 'corporate' ? '기업 파트너'
        : madInfo ? '매드리거'
        : undefined;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 pt-24 pb-4">
                {/* 공통 프로필 카드 + MADLeague 특화 정보 */}
                {user?.id && (
                    <div className="mb-4">
                        <HitProfileBadge memberId={user.id} respectOptIn />
                    </div>
                )}
                <MyProfileCard accentColor="#EC1D25" siteBadge={roleLabel}>
                    {madStatus === 'active' && madInfo && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                            {madInfo.club_name && (
                                <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-neutral-500 mb-0.5">소속 동아리</p>
                                    <p className="text-sm font-semibold">{madInfo.club_name}</p>
                                </div>
                            )}
                            {madInfo.cohort && (
                                <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-neutral-500 mb-0.5">기수</p>
                                    <p className="text-sm font-semibold">{madInfo.cohort}기</p>
                                </div>
                            )}
                            {madInfo.university && (
                                <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-neutral-500 mb-0.5">대학교</p>
                                    <p className="text-sm font-semibold">{madInfo.university}</p>
                                </div>
                            )}
                            {madInfo.activity_years && madInfo.activity_years.length > 0 && (
                                <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-neutral-500 mb-0.5">활동연도</p>
                                    <p className="text-sm font-semibold">{madInfo.activity_years.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </MyProfileCard>

                {/* 매드리거 미가입 */}
                {madStatus === 'none' && (
                    <div className="mb-6 bg-neutral-950 border border-[#EC1D25]/30 p-5">
                        <div className="flex items-start gap-4">
                            <ClipboardList className="h-7 w-7 text-[#EC1D25] shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">매드리거로 참여하려면 신청이 필요합니다</p>
                                <p className="mt-1 text-sm text-neutral-400">소속 동아리 운영진 확인 후 커뮤니티 접근이 가능합니다.</p>
                                <Link href="/madleague/apply" className="mt-3 inline-flex items-center gap-1.5 bg-[#EC1D25] text-white font-bold text-sm px-5 py-2.5 transition hover:bg-[#d01820]">
                                    신청하기 <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {madStatus === 'pending' && (
                    <div className="mb-6 bg-neutral-950 border border-[#FFC000]/30 p-5 flex items-start gap-4">
                        <Clock className="h-7 w-7 text-[#FFC000] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">신청서 검토 중</p>
                            <p className="mt-1 text-sm text-neutral-400">소속 동아리 운영진이 확인 후 이메일로 연락드립니다.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

                {/* 동아리 회장 패널 */}
                {madStatus === 'active' && madInfo?.role === 'club_leader' && madInfo.club_id && (
                    <div className="bg-neutral-950 border border-neutral-800 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-[#EC1D25]" />
                            <h3 className="font-black text-base">{madInfo.club_name} · 신청서 대기</h3>
                            {pendingApps.length > 0 && (
                                <span className="ml-auto bg-[#EC1D25] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingApps.length}
                                </span>
                            )}
                        </div>
                        {pendingApps.length === 0 ? (
                            <p className="text-sm text-neutral-500">대기 중인 신청서가 없습니다.</p>
                        ) : (
                            <div className="divide-y divide-neutral-800">
                                {pendingApps.map(app => (
                                    <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold">{app.name}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{app.university} · {app.created_at?.substring(0, 10)}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleApprove(app.id)} disabled={processingId === app.id}
                                                className="flex items-center gap-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 transition">
                                                <UserCheck className="h-3.5 w-3.5" /> 승인
                                            </button>
                                            <button onClick={() => handleReject(app.id)} disabled={processingId === app.id}
                                                className="flex items-center gap-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 transition">
                                                <XCircle className="h-3.5 w-3.5" /> 거절
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 아레나 바로가기 */}
                {madStatus === 'active' && (
                    <Link href="/madleague/arena" className="group flex items-center justify-between bg-neutral-950 border border-neutral-800 hover:border-[#EC1D25] px-6 py-5 transition">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-[#EC1D25]" />
                            <div>
                                <p className="font-bold text-sm">매드 아레나</p>
                                <p className="text-xs text-neutral-500 mt-0.5">게시판·프로젝트·경쟁PT 워크스페이스</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#EC1D25] group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}

                {/* 로그아웃 */}
                <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-neutral-950 border border-neutral-800 text-red-400 hover:bg-neutral-900 transition text-sm"
                >
                    <LogOut className="h-4 w-4" /> 로그아웃
                </button>
            </div>
        </div>
    );
}
