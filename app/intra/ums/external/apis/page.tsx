"use client";

import { useEffect, useState } from "react";
import { Key, ExternalLink, CheckCircle2, XCircle, Clock, Loader2, Shield } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface GmailToken {
    email: string;
    is_active: boolean;
    expiry_date: number | null;
    updated_at: string;
}

type Status = "active" | "partial" | "unused" | "planned";

const APIS: {
    category: string;
    providers: {
        name: string;
        purpose: string;
        env: string;
        url: string;
        docs: string;
        status: Status;
    }[];
}[] = [
    {
        category: "AI · LLM",
        providers: [
            { name: "Anthropic Claude", purpose: "Agent Hub · 트렌드 분석 · 콘텐츠 생성 · Deutbot", env: "ANTHROPIC_API_KEY",
              url: "https://console.anthropic.com", docs: "claude-sonnet-4-6 / opus-4-6 / haiku-4-5", status: "active" },
            { name: "OpenAI", purpose: "(미채택) GPT 대안", env: "OPENAI_API_KEY", url: "https://platform.openai.com", docs: "전면 Anthropic 선택", status: "unused" },
            { name: "Google Gemini", purpose: "(미채택) Multi-modal 대안", env: "GEMINI_API_KEY", url: "https://aistudio.google.com", docs: "-", status: "unused" },
            { name: "Perplexity", purpose: "(미채택) 검색 증강", env: "PERPLEXITY_API_KEY", url: "https://perplexity.ai", docs: "-", status: "unused" },
        ],
    },
    {
        category: "이메일 · 발송",
        providers: [
            { name: "Resend", purpose: "유니버스 SMTP · Transactional + Newsletter", env: "RESEND_API_KEY",
              url: "https://resend.com", docs: "tenone.biz DKIM/SPF 인증", status: "active" },
            { name: "Resend Webhook", purpose: "open/click/bounce/complaint 이벤트", env: "RESEND_WEBHOOK_SECRET",
              url: "https://resend.com/webhooks", docs: "/api/webhooks/resend (Svix)", status: "active" },
            { name: "SolAPI (쿨SMS)", purpose: "(미연결) SMS/알림톡 발송 대안", env: "-", url: "https://solapi.com", docs: "카카오 알림톡 대안", status: "planned" },
        ],
    },
    {
        category: "소셜 로그인 · OAuth",
        providers: [
            { name: "Google OAuth (로그인)", purpose: "Supabase Auth Provider 통합", env: "Supabase Dashboard",
              url: "https://supabase.com/dashboard/project/ziotlxkdctlhiwkgmmsh/auth/providers", docs: "33개 도메인 redirect URL 등록", status: "active" },
            { name: "Google OAuth (Gmail API)", purpose: "Whole See 뉴스레터 수신 · gmail.readonly", env: "GMAIL_OAUTH_CLIENT_ID + SECRET",
              url: "https://console.cloud.google.com", docs: "deepdirectdrill@gmail.com 연결", status: "active" },
            { name: "Kakao OAuth (로그인)", purpose: "카카오 소셜 로그인", env: "Supabase Dashboard 또는 KAKAO_REST_API_KEY",
              url: "https://developers.kakao.com", docs: "lib/integrations/kakao.ts 구현됨 · 키 미설정", status: "partial" },
            { name: "Naver OAuth (로그인)", purpose: "네이버 소셜 로그인", env: "NAVER_CLIENT_ID + SECRET",
              url: "https://developers.naver.com/apps", docs: "미구현 · 국내 사용자용 검토", status: "planned" },
            { name: "Apple Sign In", purpose: "iOS/Safari 대응 · Supabase Auth", env: "Supabase Dashboard",
              url: "https://developer.apple.com/sign-in-with-apple", docs: "iOS 앱 출시 시 필수", status: "planned" },
        ],
    },
    {
        category: "메시징 플랫폼",
        providers: [
            { name: "KakaoTalk 메시지 API", purpose: "CRM 알림 · 친구 메시지 · 채널 메시지", env: "KAKAO_REST_API_KEY, KAKAO_ADMIN_KEY",
              url: "https://developers.kakao.com/docs/latest/ko/message/common", docs: "lib/integrations/kakao.ts · /api/integrations/kakao/message", status: "partial" },
            { name: "KakaoTalk 알림톡 (비즈)", purpose: "이용자 동의 없이 발송 가능한 공식 메시지", env: "-",
              url: "https://business.kakao.com/info/bizmessage/", docs: "SolAPI 등 중계 서비스 경유", status: "planned" },
            { name: "Slack", purpose: "인트라 알림 Webhook · 팀 채널 발송", env: "SLACK_WEBHOOK_URL, SLACK_CLIENT_ID/SECRET/SIGNING_SECRET",
              url: "https://api.slack.com/apps", docs: "lib/integrations/slack.ts · /api/integrations/slack/*", status: "partial" },
            { name: "Discord 봇", purpose: "에이전트 브리핑 채널 · 외부 커뮤니티", env: "DISCORD_BOT_TOKEN",
              url: "https://discord.com/developers/applications", docs: "bots/discord/bot.js (독립 프로세스)", status: "partial" },
            { name: "Telegram Bot", purpose: "(미연결) 해외 사용자 알림 채널", env: "TELEGRAM_BOT_TOKEN",
              url: "https://core.telegram.org/bots", docs: "-", status: "planned" },
        ],
    },
    {
        category: "분석 · 측정 · 트래킹",
        providers: [
            { name: "Google Analytics 4", purpose: "유니버스 전체 웹 분석", env: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
              url: "https://analytics.google.com", docs: "/intra/analytics 집계 연결", status: "active" },
            { name: "Google Tag Manager", purpose: "태그 통합 관리", env: "NEXT_PUBLIC_GTM_ID",
              url: "https://tagmanager.google.com", docs: "GA4 이벤트 + 광고 픽셀", status: "active" },
            { name: "Microsoft Clarity", purpose: "히트맵 · 세션 녹화 · 사용자 행동 분석", env: "NEXT_PUBLIC_CLARITY_ID",
              url: "https://clarity.microsoft.com", docs: "무료 · 프라이버시 준거", status: "active" },
            { name: "Vercel Analytics", purpose: "빌트인 웹 바이탈 · Speed Insight", env: "Vercel 내장",
              url: "https://vercel.com/loolstenone/tenone/analytics", docs: "Pro 플랜 포함", status: "active" },
            { name: "Naver Search Advisor", purpose: "(미연결) 네이버 검색 반영", env: "사이트 소유 확인 메타 태그",
              url: "https://searchadvisor.naver.com", docs: "tenone.biz 등록 필요", status: "planned" },
            { name: "Plausible / Posthog", purpose: "(미채택) 프라이버시 우선 분석 대안", env: "-", url: "-", docs: "GA4로 충분", status: "unused" },
        ],
    },
    {
        category: "소셜 · 콘텐츠 플랫폼",
        providers: [
            { name: "X (Twitter) 공유", purpose: "intent URL 공유 (API 호출 없음)", env: "-",
              url: "https://twitter.com/intent/tweet", docs: "Jakka 작품 공유 등", status: "active" },
            { name: "Threads 공유", purpose: "intent URL 공유", env: "-",
              url: "https://threads.net", docs: "intent URL 방식", status: "active" },
            { name: "KakaoTalk 공유 (Link)", purpose: "JS SDK 공유 버튼", env: "NEXT_PUBLIC_KAKAO_JS_KEY",
              url: "https://developers.kakao.com/docs/latest/ko/message/js-link", docs: "Kakao SDK 로드 필요", status: "planned" },
            { name: "Instagram Graph API", purpose: "(미연결) 모임·포트폴리오 자동 포스팅", env: "IG_ACCESS_TOKEN",
              url: "https://developers.facebook.com/docs/instagram-api", docs: "Facebook 비즈니스 계정 필요", status: "planned" },
            { name: "YouTube Data API", purpose: "(미연결) 영상 메타 수집", env: "YOUTUBE_API_KEY",
              url: "https://developers.google.com/youtube/v3", docs: "-", status: "planned" },
            { name: "Naver Blog / Cafe API", purpose: "(미연결) 포스팅 자동화 · 공식 API 제한적", env: "NAVER_CLIENT_ID + SECRET",
              url: "https://developers.naver.com", docs: "쓰기 API 제한 · 대부분 읽기만", status: "planned" },
        ],
    },
    {
        category: "지도 · 위치",
        providers: [
            { name: "Kakao Map", purpose: "지도 표시 · 지오코딩 (Seoul360 · Badak 모임)", env: "NEXT_PUBLIC_KAKAO_JS_KEY",
              url: "https://apis.map.kakao.com", docs: "국내 서비스 표준 선택", status: "planned" },
            { name: "Naver Map", purpose: "(대안) 길찾기 우수 · 지도 표시", env: "NCP_CLIENT_ID",
              url: "https://www.ncloud.com/product/applicationService/maps", docs: "유료 · 카카오 선호", status: "planned" },
            { name: "Google Maps", purpose: "(해외용) 글로벌 지도", env: "GOOGLE_MAPS_API_KEY",
              url: "https://console.cloud.google.com/google/maps-apis", docs: "해외 진출 시", status: "planned" },
        ],
    },
    {
        category: "결제 (Jakka · HeRo · Planner's 등)",
        providers: [
            { name: "Toss Payments", purpose: "카드·계좌이체·간편결제 통합", env: "TOSS_SECRET_KEY + CLIENT_KEY",
              url: "https://docs.tosspayments.com", docs: "Jakka 마켓 실결제 검토 중", status: "planned" },
            { name: "PortOne (아임포트)", purpose: "(대안) 복수 PG 통합 라우팅", env: "PORTONE_API_KEY + SECRET",
              url: "https://portone.io", docs: "Toss와 대안 비교", status: "planned" },
            { name: "Kakao Pay", purpose: "카카오페이 단독 (토스 경유 가능)", env: "-",
              url: "https://developers.kakaopay.com", docs: "Toss/PortOne 중계로 커버", status: "planned" },
            { name: "Naver Pay", purpose: "네이버페이 단독", env: "-",
              url: "https://developer.pay.naver.com", docs: "Toss/PortOne 중계로 커버", status: "planned" },
            { name: "Stripe", purpose: "해외 결제 · 구독", env: "STRIPE_SECRET_KEY + PUBLISHABLE_KEY",
              url: "https://dashboard.stripe.com", docs: "해외 진출 시 · 구독 결제 표준", status: "planned" },
            { name: "PayPal", purpose: "해외 결제 대안", env: "PAYPAL_CLIENT_ID + SECRET",
              url: "https://developer.paypal.com", docs: "Stripe 우선", status: "unused" },
        ],
    },
    {
        category: "생산성 · 일정",
        providers: [
            { name: "Google Calendar", purpose: "WIO Orbi 일정 동기화 · 에이전트 스케줄", env: "GOOGLE_CALENDAR_CLIENT_ID + SECRET",
              url: "https://developers.google.com/calendar", docs: "lib/integrations/google-calendar.ts 구현됨", status: "partial" },
            { name: "Notion API", purpose: "(미연결) 위키 · 문서 연동", env: "NOTION_API_KEY",
              url: "https://developers.notion.com", docs: "-", status: "planned" },
            { name: "Linear API", purpose: "(미연결) 이슈 트래킹 연동", env: "LINEAR_API_KEY",
              url: "https://developers.linear.app", docs: "-", status: "planned" },
        ],
    },
    {
        category: "관측 · 에러 모니터링",
        providers: [
            { name: "Sentry", purpose: "(미연결) 에러 추적 · 성능 모니터링", env: "SENTRY_DSN",
              url: "https://sentry.io", docs: "에러 많아지면 도입 권장", status: "planned" },
            { name: "Vercel Speed Insights", purpose: "성능 측정 빌트인", env: "Vercel 내장",
              url: "https://vercel.com/docs/speed-insights", docs: "Pro 포함", status: "active" },
        ],
    },
    {
        category: "인프라 · 관리 API",
        providers: [
            { name: "Supabase Management API", purpose: "SQL 실행 · 마이그레이션 · Edge Function 배포", env: "SUPABASE_ACCESS_TOKEN",
              url: "https://api.supabase.com", docs: "Claude가 scripts/run-sql.js로 사용", status: "active" },
            { name: "Vercel API", purpose: "(미연결) 배포 상태 조회 · Deploy Hook", env: "VERCEL_TOKEN",
              url: "https://vercel.com/docs/rest-api", docs: "Deploy Hook 미설정", status: "planned" },
            { name: "GitHub API", purpose: "(미연결) 커밋 현황 · 자동화", env: "GITHUB_TOKEN",
              url: "https://docs.github.com/rest", docs: "PR/Issue 트래킹 시", status: "planned" },
        ],
    },
];

const STATUS_META: Record<Status, { label: string; color: string }> = {
    active: { label: "활성", color: "bg-emerald-100 text-emerald-700" },
    partial: { label: "코드만", color: "bg-amber-100 text-amber-700" },
    planned: { label: "계획", color: "bg-blue-100 text-blue-700" },
    unused: { label: "미채택", color: "bg-neutral-100 text-neutral-500" },
};

export default function ApisPage() {
    const [loading, setLoading] = useState(true);
    const [gmail, setGmail] = useState<GmailToken[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("gmail_oauth_tokens").select("email, is_active, expiry_date, updated_at");
            setGmail(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    // 전체 통계
    const allProviders = APIS.flatMap(c => c.providers);
    const counts = {
        active: allProviders.filter(p => p.status === "active").length,
        partial: allProviders.filter(p => p.status === "partial").length,
        planned: allProviders.filter(p => p.status === "planned").length,
        unused: allProviders.filter(p => p.status === "unused").length,
        total: allProviders.length,
    };

    return (
        <div className="space-y-6">
            <PageHeader title="외부 API" description={`유니버스가 호출하거나 호출할 외부 서비스 전체 카탈로그 · ${counts.total}건`} />

            {/* 상태 요약 */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">활성</span>
                    </div>
                    <p className="text-xl font-bold">{counts.active}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="text-[11px] text-neutral-500">코드만 (키 미설정)</span>
                    </div>
                    <p className="text-xl font-bold">{counts.partial}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] text-neutral-500">계획</span>
                    </div>
                    <p className="text-xl font-bold">{counts.planned}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-neutral-400" />
                        <span className="text-[11px] text-neutral-500">미채택</span>
                    </div>
                    <p className="text-xl font-bold">{counts.unused}</p>
                </div>
            </div>

            {/* Category별 API 테이블 */}
            {APIS.map((cat) => (
                <div key={cat.category}>
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                        <Key className="h-4 w-4 text-neutral-500" />
                        {cat.category}
                        <span className="text-[11px] text-neutral-500 font-normal">({cat.providers.length})</span>
                    </h2>
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">Provider</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">용도</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">Key / ENV</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">노트</th>
                                    <th className="text-center px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-center px-3 py-2 font-semibold text-neutral-600">콘솔</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cat.providers.map((p) => {
                                    const sm = STATUS_META[p.status];
                                    return (
                                        <tr key={p.name} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                            <td className="px-3 py-1.5 font-medium text-neutral-900">{p.name}</td>
                                            <td className="px-3 py-1.5 text-neutral-600">{p.purpose}</td>
                                            <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-700">{p.env}</td>
                                            <td className="px-3 py-1.5 text-[10px] text-neutral-500 truncate max-w-[240px]">{p.docs}</td>
                                            <td className="px-3 py-1.5 text-center">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${sm.color}`}>
                                                    {sm.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-center">
                                                {p.url && p.url !== "-" ? (
                                                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900">
                                                        <ExternalLink className="h-3 w-3 inline" />
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-200">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* OAuth Token 실상태 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    OAuth 토큰 현황 (실데이터)
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : gmail.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        연결된 OAuth 계정 없음.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">Provider</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이메일</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">토큰 만료</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gmail.map((g, i) => (
                                    <tr key={i} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 text-neutral-900">Gmail OAuth</td>
                                        <td className="px-3 py-2 font-mono text-[10px]">{g.email}</td>
                                        <td className="px-3 py-2">
                                            {g.is_active ? (
                                                <span className="text-[10px] text-emerald-700 font-semibold">활성</span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-400">비활성</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right text-neutral-500">
                                            {g.expiry_date ? new Date(g.expiry_date).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 검수 노트 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-700 leading-relaxed">
                <p className="font-semibold mb-1">전수 검수 방법</p>
                <ul className="list-disc ml-4 space-y-0.5">
                    <li><code className="font-mono bg-neutral-100 px-1 rounded">package.json</code> 의존성 + <code className="font-mono bg-neutral-100 px-1 rounded">lib/integrations/*</code> 파일</li>
                    <li><code className="font-mono bg-neutral-100 px-1 rounded">.env.local</code> 키 + <code className="font-mono bg-neutral-100 px-1 rounded">NEXT_PUBLIC_*</code> 환경변수</li>
                    <li>Supabase Auth Providers · Vercel 내장 서비스</li>
                    <li>bots/ 하위 독립 프로세스 (Discord, 크롤러)</li>
                </ul>
            </div>
        </div>
    );
}
