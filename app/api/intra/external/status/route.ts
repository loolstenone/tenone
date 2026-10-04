/**
 * 외부 리소스 실시간 현황 — GET /api/intra/external/status
 * 인트라 > UMS > 외부 리소스 페이지가 하드코딩 대신 이 값을 쓴다 (변동 자동 반영).
 *
 * 보안: /api/intra/* = middleware 직원 게이트 + 핸들러 requireStaff 이중 확인.
 *       환경변수는 "설정 여부"만 반환하고 값은 절대 내보내지 않는다.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import vercelConfig from "@/vercel.json";

export const dynamic = "force-dynamic";

type EnvScope = "public" | "server-only";
const ENV_REGISTRY: { key: string; purpose: string; scope: EnvScope; required: boolean }[] = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", purpose: "Supabase API 엔드포인트", scope: "public", required: true },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", purpose: "Supabase 공개 키 (RLS 적용)", scope: "public", required: true },
    { key: "SUPABASE_SERVICE_ROLE_KEY", purpose: "Supabase 관리자 키 (RLS 우회 — 서버 전용)", scope: "server-only", required: true },
    { key: "ADMIN_API_KEY", purpose: "서버 내부 호출 인증", scope: "server-only", required: true },
    { key: "CRON_SECRET", purpose: "Vercel Cron 호출 인증", scope: "server-only", required: true },
    { key: "ANTHROPIC_API_KEY", purpose: "Claude API (에이전트·챗봇)", scope: "server-only", required: true },
    { key: "RESEND_API_KEY", purpose: "이메일 발송", scope: "server-only", required: true },
    { key: "RESEND_WEBHOOK_SECRET", purpose: "Resend Webhook 서명 검증", scope: "server-only", required: true },
    { key: "NEXT_PUBLIC_TURNSTILE_SITE_KEY", purpose: "Cloudflare Turnstile (로봇 확인)", scope: "public", required: true },
    { key: "GMAIL_CLIENT_ID", purpose: "Gmail API OAuth (Whole See 뉴스레터 수집)", scope: "server-only", required: false },
    { key: "GMAIL_CLIENT_SECRET", purpose: "Gmail API OAuth", scope: "server-only", required: false },
    { key: "GA4_PROPERTY_ID", purpose: "GA4 데이터 동기화", scope: "server-only", required: false },
    { key: "GA4_SERVICE_ACCOUNT_JSON", purpose: "GA4 서비스 계정", scope: "server-only", required: false },
    { key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", purpose: "Google Analytics 4", scope: "public", required: false },
    { key: "NEXT_PUBLIC_GTM_ID", purpose: "Google Tag Manager", scope: "public", required: false },
    { key: "NEXT_PUBLIC_CLARITY_ID", purpose: "Microsoft Clarity", scope: "public", required: false },
    { key: "VAPID_PUBLIC_KEY", purpose: "웹 푸시", scope: "server-only", required: false },
    { key: "VAPID_PRIVATE_KEY", purpose: "웹 푸시", scope: "server-only", required: false },
    { key: "SLACK_WEBHOOK_URL", purpose: "Slack 알림", scope: "server-only", required: false },
    { key: "KAKAO_REST_API_KEY", purpose: "카카오 API", scope: "server-only", required: false },
    { key: "STRIPE_SECRET_KEY", purpose: "Stripe 결제 (미출시)", scope: "server-only", required: false },
    { key: "TOSS_SECRET_KEY", purpose: "Toss 결제 (미출시)", scope: "server-only", required: false },
];

/** 있어서는 안 되는 변수 — 설정돼 있으면 경고 (브라우저 노출·평문 보관) */
const FORBIDDEN_ENV = [
    { key: "NEXT_PUBLIC_ADMIN_API_KEY", reason: "관리자 키가 브라우저에 노출됨" },
    { key: "NEXT_PUBLIC_ADMIN_KEY", reason: "관리자 키가 브라우저에 노출됨" },
    { key: "SUPABASE_ACCESS_TOKEN", reason: "DB 전체 권한 PAT 평문 보관 금지 (MCP 사용)" },
];

function cronLabel(schedule: string): string {
    const [min, hour, dom, mon, dow] = schedule.split(" ");
    if (min.startsWith("*/")) return `${min.slice(2)}분마다`;
    if (hour === "*") return `매시 ${min}분`;
    const kst = (Number(hour) + 9) % 24;
    const time = `KST ${String(kst).padStart(2, "0")}:${min.padStart(2, "0")}`;
    if (dow !== "*") return `매주 ${["일", "월", "화", "수", "목", "금", "토"][Number(dow)]} ${time}`;
    if (dom !== "*" && mon !== "*") return `매년 ${mon}/${dom} ${time}`;
    return `매일 ${time}`;
}

export async function GET(request: NextRequest) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;

    const admin = createAdminClient();
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [agentsRes, msgsRes, gmailRes, sourcesRes] = await Promise.all([
        admin.from("agent_profiles").select("name, display_name, layer, agent_type, model_id, is_active").order("layer"),
        admin.from("agent_messages").select("from_agent, to_agent, created_at").gte("created_at", since30).limit(5000),
        admin.from("gmail_oauth_tokens").select("email, is_active, expiry_date, updated_at"),
        admin.from("mindle_sources").select("is_active, last_crawled_at"),
    ]);

    const activity = new Map<string, { count30: number; last: string | null }>();
    for (const m of msgsRes.data ?? []) {
        for (const name of [m.from_agent, m.to_agent]) {
            if (!name) continue;
            const a = activity.get(name) ?? { count30: 0, last: null };
            a.count30 += 1;
            if (!a.last || m.created_at > a.last) a.last = m.created_at;
            activity.set(name, a);
        }
    }

    const agents = (agentsRes.data ?? []).map(a => ({
        ...a,
        count30: activity.get(a.name)?.count30 ?? 0,
        lastActivity: activity.get(a.name)?.last ?? null,
    }));

    const sources = sourcesRes.data ?? [];
    const lastCrawl = sources.reduce<string | null>((max, s) =>
        s.last_crawled_at && (!max || s.last_crawled_at > max) ? s.last_crawled_at : max, null);

    const env = ENV_REGISTRY.map(e => ({ ...e, set: !!process.env[e.key] }));

    return NextResponse.json({
        generatedAt: new Date().toISOString(),
        deployment: {
            env: process.env.VERCEL_ENV ?? "local",
            commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
            commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE?.split("\n")[0] ?? null,
            branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
            region: process.env.VERCEL_REGION ?? null,
        },
        env,
        envMissingRequired: env.filter(e => e.required && !e.set).map(e => e.key),
        envForbiddenSet: FORBIDDEN_ENV.filter(f => !!process.env[f.key]),
        crons: (vercelConfig.crons ?? []).map(c => ({ path: c.path, schedule: c.schedule, label: cronLabel(c.schedule) })),
        agents,
        models: [...new Set(agents.filter(a => a.is_active).map(a => a.model_id).filter(Boolean))],
        gmail: (gmailRes.data ?? []).map(g => ({
            email: g.email,
            is_active: g.is_active,
            expiresAt: g.expiry_date ? new Date(g.expiry_date).toISOString() : null,
            updated_at: g.updated_at,
        })),
        sources: { total: sources.length, active: sources.filter(s => s.is_active).length, lastCrawl },
    });
}
