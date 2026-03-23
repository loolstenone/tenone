"use client";

import { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Calendar, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const pastIssues = [
    { id: 1, title: "MADLeague 인사이트 투어링 — 영양군에서 만난 기획의 본질", date: "2026-03-15", category: "MADLeague" },
    { id: 2, title: "LUKI 2nd Single 비하인드 — AI 아이돌은 어떻게 만들어지는가", date: "2026-03-01", category: "LUKI" },
    { id: 3, title: "Badak 3월 밋업 리캡 — 퍼포먼스 마케팅의 미래", date: "2026-02-15", category: "Badak" },
    { id: 4, title: "GPR 가이드북 공개 — 우리의 성장 철학을 나눕니다", date: "2026-02-01", category: "Culture" },
    { id: 5, title: "리제로스 시즌1 결과 발표 — 5개 팀의 도전 이야기", date: "2026-01-15", category: "MADLeague" },
    { id: 6, title: "2026년 Ten:One™ Universe 로드맵 공개", date: "2026-01-01", category: "Universe" },
];

const categoryStyle: Record<string, string> = {
    MADLeague: "bg-violet-50 text-violet-600",
    LUKI: "bg-blue-50 text-blue-600",
    Badak: "bg-neutral-100 text-neutral-600",
    Culture: "bg-amber-50 text-amber-600",
    Universe: "bg-neutral-900 text-white",
};

export default function NewsletterPage() {
    const { user, isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [guestName, setGuestName] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);

    // 로그인 회원이면 이미 구독 중인지 확인
    const isMemberSubscribed = isAuthenticated && user?.newsletterSubscribed;

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAuthenticated) {
            // 회원 구독 → 프로필에 반영 (실제로는 updateProfile 호출)
            setSubscribed(true);
        } else {
            if (!email.trim() || !agreePrivacy) return;
            // 비회원 구독
            setSubscribed(true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            {/* 헤더 */}
            <div className="text-center mb-16">
                <p className="text-xs tracking-[0.3em] tn-text-sub uppercase mb-3">Newsletter</p>
                <h1 className="text-3xl font-bold tracking-tight mb-4">
                    Ten:One™ Universe의<br />이야기를 받아보세요
                </h1>
                <p className="text-sm tn-text-sub max-w-lg mx-auto">
                    프로젝트 소식, 크루 이야기, 업계 인사이트를 격주로 보내드립니다.
                </p>
            </div>

            {/* 구독 폼 */}
            <div className="tn-bg-alt border tn-border p-8 mb-16">
                {subscribed || isMemberSubscribed ? (
                    <div className="text-center py-4">
                        <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                        <h3 className="text-sm font-bold mb-1">
                            {isMemberSubscribed && !subscribed ? '이미 뉴스레터를 구독하고 있습니다' : '구독이 완료되었습니다!'}
                        </h3>
                        <p className="text-xs tn-text-sub">
                            {isAuthenticated ? user?.email : email}로 뉴스레터를 보내드립니다.
                        </p>
                        {isAuthenticated && (
                            <Link href="/profile" className="inline-block mt-3 text-xs tn-text-sub hover:text-neutral-700 underline underline-offset-2">
                                프로필에서 구독 관리 →
                            </Link>
                        )}
                    </div>
                ) : isAuthenticated ? (
                    /* 로그인 회원이지만 미구독 */
                    <div className="text-center py-2">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
                                {user?.avatarInitials}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs tn-text-sub">{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={handleSubscribe}
                            className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mx-auto">
                            <Mail className="h-4 w-4" /> 뉴스레터 구독하기
                        </button>
                        <p className="text-[10px] tn-text-sub mt-3">격주 발행 · 언제든 프로필에서 구독 취소 가능</p>
                    </div>
                ) : (
                    /* 비회원 구독 폼 */
                    <form onSubmit={handleSubscribe}>
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                            <Mail className="h-5 w-5 tn-text-sub shrink-0 hidden sm:block" />
                            <input
                                type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                                placeholder="이름 (선택)"
                                className="w-full sm:w-40 px-4 py-3 text-sm border tn-border tn-surface focus:outline-none focus:border-neutral-400 placeholder:tn-text-muted"
                            />
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="이메일 주소를 입력하세요 *"
                                required
                                className="flex-1 w-full px-4 py-3 text-sm border tn-border tn-surface focus:outline-none focus:border-neutral-400 placeholder:tn-text-muted"
                            />
                            <button type="submit" disabled={!email.trim() || !agreePrivacy}
                                className="w-full sm:w-auto px-8 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 shrink-0">
                                구독하기 <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                        {/* 개인정보 동의 */}
                        <div className="flex items-start gap-2 mt-2">
                            <button type="button" onClick={() => setAgreePrivacy(!agreePrivacy)}
                                className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors ${
                                    agreePrivacy ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300 tn-surface'
                                }`}>
                                {agreePrivacy && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            <p className="text-[10px] tn-text-sub leading-relaxed">
                                뉴스레터 발송을 위한 이메일 수집에 동의합니다. 수집된 정보는 뉴스레터 발송 목적으로만 사용되며, 구독 해지 시 즉시 삭제됩니다.
                            </p>
                        </div>
                        <p className="text-[10px] tn-text-muted text-center mt-3">격주 발행 · 언제든 구독 취소 가능 · 회원 가입 없이 구독 가능</p>
                    </form>
                )}
            </div>

            {/* 지난 뉴스레터 */}
            <div>
                <h2 className="text-sm font-bold mb-6">지난 뉴스레터</h2>
                <div className="space-y-3">
                    {pastIssues.map(issue => (
                        <div key={issue.id} className="border tn-border tn-surface p-5 hover:border-neutral-400 transition-colors cursor-pointer group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${categoryStyle[issue.category] || "bg-neutral-100 tn-text-sub"}`}>
                                            {issue.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] tn-text-sub">
                                            <Calendar className="h-3 w-3" /> {issue.date}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium group-hover:text-neutral-600 transition-colors">{issue.title}</h3>
                                </div>
                                <ExternalLink className="h-4 w-4 tn-text-muted group-hover:tn-text-sub transition-colors shrink-0 mt-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
