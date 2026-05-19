"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Sparkles, ArrowRight, ShoppingBag, Search, BarChart3, Mail,
    CheckCircle2, Clock, ChevronRight, Lock,
} from "lucide-react";
import SmarCommHeader from "@/features/smarcomm/SmarCommHeader";
import SmarCommFooter from "@/features/smarcomm/SmarCommFooter";
import { LoginModal } from "@/components/LoginModal";
import { useAuth } from "@/lib/auth-context";

// ──────────────────────────────────────────────
// 정직성 SSOT: 이 페이지는 Phase 0 (스캐폴딩) 상태.
// 카페24/아임웹 연동·RFM 백엔드·재구매 시나리오 미구현.
// 모든 숫자·후보 리스트는 "아직 연동되지 않음" 안내로 노출. 가짜 Mock 금지.
// ──────────────────────────────────────────────

type ConnectionState = "not_connected" | "connecting" | "connected";

export default function MarvisDashboard() {
    const { isAuthenticated, user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    // 연동 상태는 Phase 1에서 실제 카페24 OAuth로 교체. 현재는 정직하게 'not_connected' 고정.
    const connection: ConnectionState = "not_connected";

    return (
        <div className="min-h-screen bg-white">
            <SmarCommHeader />

            <main className="mx-auto max-w-5xl px-5 py-12">
                {/* 헤더 인사 */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase mb-3">
                        <Sparkles size={12} /> Marvis · Marketing Jarvis
                    </div>
                    <h1 className="text-[32px] font-bold leading-tight text-neutral-900">
                        {isAuthenticated ? `${user?.name || "사장님"}, 좋은 아침입니다.` : "사장님, 좋은 아침입니다."}
                    </h1>
                    <p className="mt-2 text-[15px] text-neutral-600">
                        오늘 매출을 만들 마케팅 액션 3가지를 제가 준비합니다. 사장님은 [승인] 버튼만 누르세요.
                    </p>
                </div>

                {/* 연동 상태 배너 */}
                <ConnectionBanner state={connection} onLogin={() => setLoginOpen(true)} authed={isAuthenticated} />

                {/* 오늘의 To-Do (Phase 1 전 placeholder — 정직성) */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[18px] font-bold text-neutral-900">오늘의 To-Do</h2>
                        <span className="text-[11px] text-neutral-400 uppercase tracking-wider">AI 추천</span>
                    </div>
                    <TodoEmptyState connected={connection === "connected"} />
                </section>

                {/* 4기능 카드 */}
                <section className="mb-12">
                    <h2 className="text-[18px] font-bold text-neutral-900 mb-3">Marvis 4기능</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FeatureCard
                            icon={BarChart3}
                            title="마케팅 대시보드"
                            desc="방문·주문·매출·재구매 후보 4개 핵심 지표"
                            status="planned"
                            statusLabel="Phase 1"
                        />
                        <FeatureCard
                            icon={Search}
                            title="진단 — SEO·GEO·퍼널"
                            desc="종합 점수 1개 + 등급 + 핵심 권고 3개"
                            status="lite_available"
                            statusLabel="Pro에 풀 진단"
                            href="/smarcomm/marvis/scan"
                        />
                        <FeatureCard
                            icon={Sparkles}
                            title="오늘의 행동 3개"
                            desc="재구매·이탈·신상품 후보 자동 추출"
                            status="planned"
                            statusLabel="Phase 1"
                        />
                        <FeatureCard
                            icon={Mail}
                            title="이메일 1탭 발송"
                            desc="AI 초안 → 사장님 승인 → Resend 발송"
                            status="planned"
                            statusLabel="Phase 1"
                        />
                    </div>
                </section>

                {/* 안내 */}
                <section className="mb-12 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                    <div className="flex items-start gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                            <Lock size={14} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-neutral-900 mb-1">왜 지금은 비어 있나요?</p>
                            <p className="text-[13px] text-neutral-600 leading-relaxed">
                                Marvis는 카페24·아임웹과 연동된 후부터 실시간 분석을 시작합니다. 연동 전까지는
                                가짜 데이터를 보여드리지 않습니다(SmarComm 정직성 원칙). 연동은 Phase 1 — 곧 열립니다.
                            </p>
                            <Link
                                href="/smarcomm"
                                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-neutral-900 hover:underline"
                            >
                                Marvis 소개 보기 <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <SmarCommFooter />

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </div>
    );
}

// ──────────────────────────────────────────────
// 연동 상태 배너
// ──────────────────────────────────────────────
function ConnectionBanner({
    state, onLogin, authed,
}: { state: ConnectionState; onLogin: () => void; authed: boolean }) {
    if (state === "connected") {
        return (
            <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-[13px] font-bold text-emerald-900">쇼핑몰 연동 완료 — 매일 아침 분석 결과를 보내드립니다.</p>
            </div>
        );
    }
    return (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                    <p className="text-[13px] font-bold text-amber-900">아직 쇼핑몰이 연동되지 않았습니다</p>
                    <p className="text-[12px] text-amber-800 mt-0.5">
                        카페24·아임웹 계정 1회 연동 후 매일 아침 분석이 시작됩니다. Phase 1에서 OAuth 연동이 열립니다.
                    </p>
                </div>
            </div>
            {!authed && (
                <button
                    onClick={onLogin}
                    className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-neutral-700"
                >
                    가입 / 로그인
                </button>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────
// To-Do 빈 상태
// ──────────────────────────────────────────────
function TodoEmptyState({ connected }: { connected: boolean }) {
    return (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-10 text-center">
            <Sparkles className="h-7 w-7 text-neutral-300 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-neutral-700 mb-1">
                {connected ? "오늘 처리할 액션을 분석 중입니다…" : "쇼핑몰을 연동하면 매일 To-Do 3개가 여기에 표시됩니다"}
            </p>
            <p className="text-[12px] text-neutral-500">
                예: 장바구니 이탈 12명 구출 · 단골 5명 감사 쿠폰 · 한 달 무방문 단골 8명 리마인드
            </p>
        </div>
    );
}

// ──────────────────────────────────────────────
// 기능 카드
// ──────────────────────────────────────────────
function FeatureCard({
    icon: Icon, title, desc, status, statusLabel, href,
}: {
    icon: typeof Sparkles;
    title: string;
    desc: string;
    status: "lite_available" | "planned";
    statusLabel: string;
    href?: string;
}) {
    const cardCls =
        "group relative overflow-hidden rounded-2xl border bg-white px-5 py-4 transition-colors " +
        (status === "lite_available"
            ? "border-neutral-200 hover:border-neutral-900"
            : "border-neutral-150 cursor-default");

    const inner = (
        <>
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                    <Icon size={18} />
                </div>
                <span
                    className={
                        status === "lite_available"
                            ? "text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                            : "text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full"
                    }
                >
                    {statusLabel}
                </span>
            </div>
            <p className="text-[14px] font-bold text-neutral-900">{title}</p>
            <p className="mt-1 text-[12px] text-neutral-500 leading-relaxed">{desc}</p>
            {status === "lite_available" && href && (
                <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-neutral-900 group-hover:underline">
                    바로 가기 <ChevronRight size={12} />
                </div>
            )}
        </>
    );

    if (status === "lite_available" && href) {
        return (
            <Link href={href} className={cardCls}>
                {inner}
            </Link>
        );
    }
    return <div className={cardCls}>{inner}</div>;
}
