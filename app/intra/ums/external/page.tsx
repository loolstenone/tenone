"use client";

import Link from "next/link";
import {
    Share2, Cloud, Key, Radio, ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const CATEGORIES = [
    { key: "dev-env", title: "개발 환경", icon: Cloud, color: "text-blue-600", bg: "bg-blue-50",
      desc: "Vercel · Supabase · GitHub · Resend · Cron 스케줄 · 환경변수",
      items: ["Vercel Pro", "Supabase (ziotlxkdctlhiwkgmmsh)", "GitHub (loolstenone/tenone)", "Resend SMTP", "Vercel Cron"],
      href: "/intra/ums/external/dev-env" },
    { key: "apis", title: "외부 API", icon: Key, color: "text-purple-600", bg: "bg-purple-50",
      desc: "Anthropic Claude · OpenAI · Google OAuth · 소셜 미디어 API",
      items: ["Anthropic", "Google OAuth (Gmail)", "Resend API", "Supabase API"],
      href: "/intra/ums/external/apis" },
    { key: "sources", title: "크롤링 · RSS · 뉴스레터", icon: Radio, color: "text-amber-600", bg: "bg-amber-50",
      desc: "Whole See가 유니버스로 들여오는 외부 정보 소스",
      items: ["RSS 소스 (mindle_sources)", "Gmail 뉴스레터 수신", "웹 크롤러"],
      href: "/intra/ums/external/sources" },
];

export default function ExternalResourcesHub() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="외부 리소스"
                description="유니버스 경계 밖에 연결된 모든 시스템·API·데이터 원천 카탈로그"
            />

            {/* Philosophy */}
            <div className="bg-gradient-to-r from-neutral-900 to-slate-700 text-white rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/10 rounded">
                        <Share2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-slate-300 mb-1">External Universe Boundary</p>
                        <p className="text-sm text-white leading-relaxed">
                            Standard 관리가 <strong>내부</strong> 공통 표준이라면, 외부 리소스는 <strong>유니버스 바깥</strong>의
                            신뢰 의존 대상이다. 비용·SLA·토큰 갱신·보안 감사 포인트.
                        </p>
                    </div>
                </div>
            </div>

            {/* 3 Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATEGORIES.map((c) => (
                    <Link key={c.key} href={c.href}
                        className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-900 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 ${c.bg} rounded`}>
                                <c.icon className={`h-4 w-4 ${c.color}`} />
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900">{c.title}</h3>
                        </div>
                        <p className="text-[11px] text-neutral-600 mb-3 leading-relaxed">{c.desc}</p>
                        <div className="space-y-1 mb-3">
                            {c.items.map((it) => (
                                <div key={it} className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                                    <span className="h-1 w-1 bg-neutral-400 rounded-full" />
                                    <span>{it}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-900 font-semibold">
                            상세 보기 <ArrowRight className="h-3 w-3" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 leading-relaxed">
                <strong>보안 원칙:</strong> API 키·토큰은 모두 Vercel 환경변수에 저장. 코드나 DB에 평문 보관 금지.
                토큰 만료·바운스·에러율은 각 카테고리 페이지에서 모니터링.
            </div>
        </div>
    );
}
