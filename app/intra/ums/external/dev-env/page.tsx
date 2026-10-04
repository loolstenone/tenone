"use client";

import { Cloud, Github, Database, Mail, Clock, ExternalLink, AlertCircle, Globe, Server } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { useExternalStatus, formatKst } from "@/lib/intra/use-external-status";

const INFRA = [
    {
        name: "Vercel",
        icon: Cloud,
        color: "text-neutral-900",
        plan: "Pro ($20/월)",
        project: "tenone (production)",
        url: "https://vercel.com/dashboard",
        details: [
            { k: "On-Demand 상한", v: "$100" },
            { k: "프리뷰 배포", v: "차단됨 (dev/feature-* 비활성화)" },
            { k: "배포 트리거", v: "git push origin master (유일)" },
        ],
    },
    {
        name: "Supabase",
        icon: Database,
        color: "text-emerald-600",
        plan: "Free · 단일 프로젝트 (자동 백업 없음)",
        project: "ziotlxkdctlhiwkgmmsh",
        url: "https://supabase.com/dashboard/project/ziotlxkdctlhiwkgmmsh",
        details: [
            { k: "DB", v: "PostgreSQL + RLS" },
            { k: "Auth", v: "Email+OTP · Google OAuth" },
            { k: "Storage", v: "avatars · site-branding 버킷" },
            { k: "Edge Functions", v: "Supabase MCP로 배포" },
            { k: "SQL 실행", v: "Supabase MCP (PAT 평문 보관 금지)" },
        ],
    },
    {
        name: "GitHub",
        icon: Github,
        color: "text-neutral-900",
        plan: "Private Repository",
        project: "loolstenone/tenone",
        url: "https://github.com/loolstenone/tenone",
        details: [
            { k: "브랜치", v: "master (단일)" },
            { k: "CI/CD", v: "Vercel 자동 배포 on push" },
            { k: "원격", v: "git@github.com:loolstenone/tenone.git" },
        ],
    },
    {
        name: "Resend",
        icon: Mail,
        color: "text-amber-600",
        plan: "Free (100/일) · Pro 업그레이드 대기",
        project: "Ten:One™ Universe SMTP",
        url: "https://resend.com/emails",
        details: [
            { k: "도메인", v: "tenone.biz (DKIM/SPF 인증)" },
            { k: "발신 이메일", v: "noreply · news · hello · ceo @ tenone.biz" },
            { k: "Webhook", v: "/api/webhooks/resend (Svix 서명)" },
            { k: "Secret", v: "RESEND_WEBHOOK_SECRET (Vercel env)" },
        ],
    },
    {
        name: "Google Cloud Platform (GCP)",
        icon: Server,
        color: "text-red-600",
        plan: "Free Tier + Pay-as-you-go",
        project: "Ten:One OAuth · Gmail · Calendar APIs",
        url: "https://console.cloud.google.com",
        details: [
            { k: "OAuth 2.0 Client", v: "GMAIL_OAUTH_CLIENT_ID + SECRET (Whole See Gmail 수집용)" },
            { k: "Gmail API", v: "scope: gmail.readonly — deepdirectdrill@gmail.com 연결" },
            { k: "Google Calendar API", v: "lib/integrations/google-calendar.ts (WIO Orbi 일정 동기화)" },
            { k: "Google Sign-In", v: "Supabase Auth Provider와 통합 (Client는 Supabase 측에서 관리)" },
            { k: "승인 도메인", v: "tenone.biz + Vercel 배포 도메인 전체 (33개)" },
            { k: "할당량", v: "Gmail 250 quota units/user/second, Calendar 1M requests/day" },
            { k: "계획", v: "Google Maps API (Kakao Map 실패 시 대안)" },
        ],
    },
    {
        name: "Domain Registrar · DNS",
        icon: Globe,
        color: "text-teal-600",
        plan: "연간 등록",
        project: "29 도메인 DNS 관리",
        url: "#",
        details: [
            { k: "주요 도메인", v: "tenone.biz · madleague.net · madleap.co.kr · badak.biz · rook.co.kr 등" },
            { k: "DNS 관리", v: "Vercel DNS (자동) 또는 Gabia/GoDaddy (수동 A/CNAME)" },
            { k: "서브도메인", v: "*.tenone.biz — Vercel에 와일드카드 매핑" },
            { k: "SSL", v: "Vercel 자동 발급 (Let's Encrypt)" },
            { k: "확인 경로", v: "UMS > Standard 관리 > 사이트·도메인" },
        ],
    },
];


export default function DevEnvPage() {
    const { data, error } = useExternalStatus();
    return (
        <div className="space-y-6">
            <PageHeader title="개발 환경" description="Vercel · Supabase · GitHub · Resend · GCP · Domain + Cron·환경변수 실시간 현황" />

            {/* Infra Cards */}
            <div className="space-y-4">
                {INFRA.map((i) => (
                    <div key={i.name} className="bg-white border border-neutral-200 rounded-lg p-5">
                        <div className="flex items-start gap-4 mb-3">
                            <div className="shrink-0 h-10 w-10 bg-neutral-50 rounded flex items-center justify-center">
                                <i.icon className={`h-5 w-5 ${i.color}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-neutral-900">{i.name}</h3>
                                    <span className="text-[10px] text-neutral-500">{i.plan}</span>
                                </div>
                                <p className="text-[11px] text-neutral-600 font-mono">{i.project}</p>
                            </div>
                            <a href={i.url} target="_blank" rel="noopener noreferrer"
                                className="shrink-0 text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
                                대시보드 <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {i.details.map((d) => (
                                <div key={d.k} className="bg-neutral-50 rounded p-2 text-[11px]">
                                    <p className="text-neutral-500 text-[10px]">{d.k}</p>
                                    <p className="text-neutral-900">{d.v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cron — vercel.json에서 자동 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-violet-600" /> Vercel Cron <span className="text-[10px] font-normal text-neutral-500">vercel.json 자동 반영</span>
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {(data?.crons ?? []).map(c => (
                        <div key={c.path} className="flex items-center justify-between text-[11px] bg-neutral-50 rounded px-2 py-1">
                            <span className="font-mono text-neutral-800 truncate">{c.path}</span>
                            <span className="text-neutral-500 shrink-0 ml-2">{c.label}</span>
                        </div>
                    ))}
                    {!data && <p className="text-[11px] text-neutral-500">{error ?? "불러오는 중..."}</p>}
                </div>
            </div>

            {/* Env Vars — 실제 배포 환경의 설정 여부 (값은 절대 표시하지 않음) */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                    환경 변수 <span className="text-[10px] font-normal text-neutral-500">
                        {data ? `${data.deployment.env} · ${data.deployment.commit ?? "—"} · ${formatKst(data.generatedAt)} 확인` : ""}
                    </span>
                </h2>
                {data && data.envForbiddenSet.length > 0 && (
                    <div className="mb-2 bg-rose-50 border border-rose-200 rounded p-2 text-[11px] text-rose-900">
                        {data.envForbiddenSet.map(f => <p key={f.key}>⚠ 금지 변수 설정됨: <span className="font-mono">{f.key}</span> — {f.reason}. Vercel에서 삭제하세요.</p>)}
                    </div>
                )}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">키</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">용도</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">범위</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.env ?? []).map((e) => (
                                <tr key={e.key} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-900">{e.key}</td>
                                    <td className="px-3 py-1.5 text-neutral-600">{e.purpose}</td>
                                    <td className="px-3 py-1.5">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                            e.scope === "public" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                        }`}>{e.scope}</span>
                                    </td>
                                    <td className="px-3 py-1.5 text-[10px]">
                                        {e.set ? <span className="text-emerald-700">● 설정됨</span>
                                            : e.required ? <span className="text-rose-700 font-semibold">● 필수 미설정</span>
                                            : <span className="text-neutral-400">○ 미설정</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!data && <p className="px-3 py-2 text-[11px] text-neutral-500">{error ?? "불러오는 중..."}</p>}
                </div>
            </div>

            {/* Critical Warning */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-900 leading-relaxed">
                    <strong>운영 규칙:</strong> push = 유일한 배포 경로 · <code className="font-mono bg-rose-100 px-1 rounded">vercel deploy</code> 직접 실행 금지 · 환경변수는 <strong>Vercel Dashboard</strong>에서만 수정 · service_role 키를 프론트엔드에 노출 금지.
                </p>
            </div>
        </div>
    );
}
