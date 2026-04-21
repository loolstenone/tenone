"use client";

/**
 * Standard 관리 — 유니버스 공통 표준 허브
 * 26+ 브랜드가 공유하는 스키마·정책·상수 정의
 */

import Link from "next/link";
import {
    Shield, Users, Coins, Briefcase, Mail, Layers, KeyRound, FileLock2, ArrowRight,
    Globe, ShieldCheck, Package, Building2, BookOpen, FileCode,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const STANDARDS = [
    { key: "members", title: "회원", icon: Users, color: "text-violet-600", bg: "bg-violet-50",
      desc: "3계층 프로필 체계 (auth.users / members / 서비스별)", source: "members 테이블", href: "/intra/ums/standard/members" },
    { key: "uc", title: "Universe Coin", icon: Coins, color: "text-amber-600", bg: "bg-amber-50",
      desc: "1 UC = 1 KRW · 기여 기반 지급 · 월별 상한", source: "uc_earn_rules", href: "/intra/ums/standard/uc" },
    { key: "taxonomies", title: "산업군 / 직무군", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50",
      desc: "전 브랜드 공통 분류 상수 (INDUSTRIES · JOB_FUNCTIONS)", source: "lib/badak-constants.ts", href: "/intra/ums/standard/taxonomies" },
    { key: "newsletter", title: "News Letter", icon: Mail, color: "text-cyan-600", bg: "bg-cyan-50",
      desc: "발송 기반 · 발신자 레지스트리 · 한도", source: "email_senders · newsletter_*", href: "/intra/ums/standard/newsletter" },
    { key: "capabilities", title: "Capability 정의", icon: Layers, color: "text-blue-600", bg: "bg-blue-50",
      desc: "9개 기능 모듈 · 브랜드 × capability 매트릭스", source: "capabilities · brand_capabilities", href: "/intra/ums/standard/capabilities" },
    { key: "roles", title: "권한 체계", icon: KeyRound, color: "text-purple-600", bg: "bg-purple-50",
      desc: "role × context 기반 — 전 시스템 권한 SSOT", source: "member_roles", href: "/intra/ums/standard/roles" },
    { key: "privacy", title: "약관 · 개인정보", icon: FileLock2, color: "text-rose-600", bg: "bg-rose-50",
      desc: "탈퇴 처리 · 동의 · 개인정보 정책", source: "privacy_deletion_requests · consent", href: "/intra/ums/standard/privacy" },
    { key: "sites", title: "사이트 · 도메인", icon: Globe, color: "text-blue-600", bg: "bg-blue-50",
      desc: "29 도메인 매핑 · SEO 기본값 · OG 이미지 · favicon 정책", source: "ums_sites · site-config.ts", href: "/intra/ums/standard/sites" },
    { key: "access-model", title: "접근 모델 (6종)", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50",
      desc: "오픈·구독·구매·멤버십·직원·내부 — 가입 경로 SSOT", source: "CLAUDE.md §1.4 + ums_sites.access_model", href: "/intra/ums/standard/access-model" },
    { key: "wio-plans", title: "WIO 요금제 · 기능", icon: Package, color: "text-slate-600", bg: "bg-slate-50",
      desc: "11 플랜 × 76 기능 플래그 매트릭스", source: "wio_subscription_plans · wio_feature_flags", href: "/intra/ums/standard/wio-plans" },
    { key: "tenants", title: "테넌트 레지스트리", icon: Building2, color: "text-stone-600", bg: "bg-stone-50",
      desc: "tenant_id 격리 · 내부(tenone) + 외부 고객", source: "wio_tenants · wio_tenant_configs", href: "/intra/ums/standard/tenants" },
    { key: "dev-rules", title: "개발 규칙 8원칙", icon: BookOpen, color: "text-neutral-900", bg: "bg-neutral-100",
      desc: "이중 구현·격리 깨짐·자산 사장을 방지하는 개발 SSOT 룰", source: "CLAUDE.md §1.10 + 부록 A", href: "/intra/ums/standard/dev-rules" },
    { key: "mail-templates", title: "이메일 템플릿", icon: FileCode, color: "text-sky-600", bg: "bg-sky-50",
      desc: "공통 메일 브랜딩 · 변수 치환 · 수신거부 필수 요소", source: "lib/email/*-template · mail_templates", href: "/intra/ums/standard/mail-templates" },
];

export default function StandardManagementHub() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Standard 관리"
                description="26+ 브랜드가 공유하는 유니버스 공통 표준 · 스키마 · 정책"
            />

            {/* Philosophy */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/10 rounded">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1">Universe Standards</p>
                        <p className="text-sm text-white leading-relaxed">
                            브랜드별로 따로 관리하지 않고, 유니버스 레벨에서 단일 진실 소스(SSOT)로 관리하는 항목들.
                            변경 시 모든 브랜드에 즉시 반영되므로 신중히 편집할 것.
                        </p>
                    </div>
                </div>
            </div>

            {/* 7 Standard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STANDARDS.map((s) => (
                    <Link key={s.key} href={s.href}
                        className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-900 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 ${s.bg} rounded`}>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
                        </div>
                        <p className="text-[11px] text-neutral-600 mb-3 leading-relaxed">{s.desc}</p>
                        <p className="text-[10px] text-neutral-400 mb-3 font-mono">{s.source}</p>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-900 font-semibold">
                            관리 <ArrowRight className="h-3 w-3" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
