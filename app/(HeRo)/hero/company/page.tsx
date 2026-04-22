"use client";

/**
 * 기업 허브 페이지
 * - 내가 소속된 기업 목록 · 가입 신청 상태 · 신규 등록 진입
 * - 각 기업의 JD 관리·TIH 제출 진입
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Loader2, ArrowRight, Clock, CheckCircle2, FileText, Compass } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { createClient } from "@/lib/supabase/client";

const HERO_RED = "#E53935";

interface MyCompany {
    id: string;
    role: string;
    status: string;
    position_title: string | null;
    joined_at: string | null;
    invited_at: string;
    hero_companies: {
        id: string;
        company_name: string;
        industry: string | null;
        size_category: string | null;
    } | null;
}

export default function HeroCompanyHubPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [myCompanies, setMyCompanies] = useState<MyCompany[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        createClient()
            .from("hero_company_members")
            .select("id, role, status, position_title, joined_at, invited_at, hero_companies(id, company_name, industry, size_category)")
            .eq("member_id", user.id)
            .order("invited_at", { ascending: false })
            .then(res => {
                setMyCompanies((res.data ?? []) as unknown as MyCompany[]);
                setLoading(false);
            });
    }, [user?.id]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginModal isOpen={true} onClose={() => {}} accentColor={HERO_RED} /></div>;

    const active = myCompanies.filter(c => c.status === "active");
    const pending = myCompanies.filter(c => c.status === "pending");

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-xs font-bold rounded-full mb-3" style={{ color: HERO_RED }}>
                        <Building2 className="h-3.5 w-3.5" /> 기업 회원 허브
                    </div>
                    <h1 className="text-2xl font-extrabold mb-2">당신의 자리를 서술하세요</h1>
                    <p className="text-sm text-neutral-500">
                        TIH로 자리의 이유를, JD로 자리의 실체를 적습니다.<br />
                        HeRo가 당신의 고민과 맞닿는 영웅을 조용히 연결합니다.
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : (
                    <>
                        {/* 활성 소속 기업 */}
                        {active.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-semibold text-neutral-700 mb-3">내가 소속된 기업</h2>
                                <div className="space-y-3">
                                    {active.map(c => (
                                        <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg">{c.hero_companies?.company_name}</h3>
                                                    <p className="text-xs text-neutral-500">
                                                        {c.hero_companies?.industry || "-"} · {c.hero_companies?.size_category || "-"}
                                                        {c.position_title && ` · ${c.position_title}`}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> {roleLabel(c.role)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link href={`/hero/search-light/tih?company=${c.hero_companies?.id}`}
                                                    className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Compass className="h-4 w-4 text-rose-500" />
                                                        <span className="text-sm font-medium">TIH 제출</span>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                                                </Link>
                                                <Link href={`/hero/company/${c.hero_companies?.id}/jd`}
                                                    className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-rose-500" />
                                                        <span className="text-sm font-medium">JD 관리</span>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 승인 대기 */}
                        {pending.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-semibold text-neutral-700 mb-3">승인 대기 중</h2>
                                <div className="space-y-2">
                                    {pending.map(c => (
                                        <div key={c.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{c.hero_companies?.company_name}</p>
                                                <p className="text-xs text-amber-700">기업 대표 · 관리자의 승인을 기다리는 중</p>
                                            </div>
                                            <Clock className="h-4 w-4 text-amber-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 신규 등록 CTA */}
                        <div className="border-t border-neutral-200 pt-8">
                            <Link href="/hero/company/register"
                                className="flex items-center justify-between p-5 bg-white border-2 border-dashed border-neutral-300 hover:border-rose-400 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">기업 신규 등록</p>
                                        <p className="text-xs text-neutral-500">우리 회사를 등록하고 영웅을 찾아보세요</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-neutral-400" />
                            </Link>
                        </div>
                    </>
                )}

                {/* 안내 */}
                <div className="mt-10 p-4 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-600 space-y-2">
                    <p><strong>Matching Tetrad — 기업 측 입력:</strong></p>
                    <p>• <strong>TIH</strong> (자리의 이유): 조직 현재, 고민, 3축 배분 · 22문항 · 7~8분</p>
                    <p>• <strong>JD</strong> (자리의 실체): 7블록 서사 · 500~800자 · 영웅이 읽는 문서</p>
                    <p className="text-neutral-400 mt-1">TIH와 JD는 함께 읽힙니다 — 둘 다 있어야 매칭 품질이 올라갑니다.</p>
                </div>
            </div>
        </div>
    );
}

function roleLabel(role: string) {
    switch (role) {
        case "representative": return "대표";
        case "hiring_manager": return "채용 담당";
        case "viewer": return "조회";
        default: return role;
    }
}
