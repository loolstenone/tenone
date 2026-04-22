"use client";

/**
 * JD 관리 페이지 — 특정 기업의 JD 목록 + 신규 작성 진입
 */

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, Plus, Edit, ArrowRight, CheckCircle2, Clock, Archive } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const HERO_RED = "#E53935";

interface JD {
    id: string;
    position_title: string;
    summary: string | null;
    status: string;
    employment_type: string | null;
    experience_range: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
    draft: { label: "작성 중", icon: Edit, className: "text-neutral-500 bg-neutral-100" },
    published: { label: "공개", icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50" },
    archived: { label: "보관", icon: Archive, className: "text-neutral-400 bg-neutral-50" },
};

export default function CompanyJdListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: companyId } = use(params);
    const { user, isLoading, isAuthenticated } = useAuth();
    const [jds, setJds] = useState<JD[]>([]);
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                const res = await fetch(`/api/hero/jd?companyId=${companyId}&memberId=${user.id}`);
                const data = await res.json();
                if (res.status === 403) { setForbidden(true); setLoading(false); return; }
                if (!res.ok) throw new Error(data.error);
                setJds(data.jds ?? []);
            } catch { /* ignore */ }
            setLoading(false);
        })();
    }, [user?.id, companyId]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginModal isOpen={true} onClose={() => {}} accentColor={HERO_RED} /></div>;

    if (forbidden) {
        return (
            <div className="min-h-screen bg-neutral-50 pt-24 pb-20 flex items-center justify-center">
                <div className="max-w-md text-center px-6">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                    <h1 className="text-xl font-bold mb-2">접근 권한이 없습니다</h1>
                    <p className="text-sm text-neutral-500 mb-6">이 기업의 담당자로 등록된 회원만 JD를 관리할 수 있습니다.</p>
                    <Link href="/hero/company" className="inline-block px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: HERO_RED }}>
                        기업 허브로
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <Link href="/hero/company" className="flex items-center gap-1 text-xs text-neutral-500 mb-4 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 기업 허브
                </Link>

                <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-xs font-bold rounded-full mb-3" style={{ color: HERO_RED }}>
                            <FileText className="h-3.5 w-3.5" /> 직무 설명 (Job Description)
                        </div>
                        <h1 className="text-2xl font-extrabold mb-1">자리의 내용을 적어 주세요</h1>
                        <p className="text-sm text-neutral-500">
                            TIH가 "왜 사람이 필요한가"라면, 직무 설명은 "어떤 자리인가"입니다. 7개 블록, 500~800자로 지원자가 읽게 될 소개를 작성합니다.
                        </p>
                    </div>
                    <Link href={`/hero/company/${companyId}/jd/new`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                        style={{ backgroundColor: HERO_RED }}>
                        <Plus className="h-4 w-4" /> 새 직무 설명 작성
                    </Link>
                </div>

                {loading ? (
                    <div className="py-20 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : jds.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-neutral-200 rounded-xl p-12 text-center">
                        <FileText className="h-10 w-10 mx-auto mb-3 text-neutral-300" />
                        <p className="text-sm text-neutral-400 mb-5">아직 작성된 직무 설명이 없습니다</p>
                        <Link href={`/hero/company/${companyId}/jd/new`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                            style={{ backgroundColor: HERO_RED }}>
                            <Plus className="h-4 w-4" /> 첫 번째 직무 설명 작성
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jds.map(jd => {
                            const st = STATUS[jd.status] ?? STATUS.draft;
                            const Icon = st.icon;
                            return (
                                <Link key={jd.id} href={`/hero/company/${companyId}/jd/${jd.id}`}
                                    className="block bg-white border border-neutral-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-sm transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-base mb-0.5">{jd.position_title}</h3>
                                            {jd.summary && <p className="text-xs text-neutral-500 line-clamp-1">{jd.summary}</p>}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${st.className}`}>
                                            <Icon className="h-3 w-3" /> {st.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                                            {jd.employment_type && <span>{jd.employment_type}</span>}
                                            {jd.experience_range && <span>{jd.experience_range}</span>}
                                            <span>수정 {new Date(jd.updated_at).toLocaleDateString("ko-KR")}</span>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 p-4 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-600">
                    <strong className="block mb-1">📄 JD 7블록 구조</strong>
                    ① 타이틀·한 줄 · ② 우리는 지금 · ③ 풀어야 하는 문제 · ④ 실제 하는 일
                    · ⑤ 어울리는 사람 · ⑥ 함께 일할 사람들 · ⑦ 조건과 환경
                </div>
            </div>
        </div>
    );
}
