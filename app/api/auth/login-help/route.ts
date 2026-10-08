/**
 * POST /api/auth/login-help — 로그인 도움 (아이디·비밀번호 찾기 통합)
 * Body: { email, captchaToken, site? }
 *
 * 안내는 그 이메일 주인의 메일함으로만 보낸다 — 화면 응답은 계정 유무·가입 방식과 상관없이 항상 같다
 * (화면에서 "Google로 가입한 계정"을 알려주면 남의 이메일로 가입 여부·방식을 캐낼 수 있다)
 *   - 소셜(Google/카카오)로만 가입 → "○○로 가입한 One ID입니다" + 소셜 로그인 안내 + (선택) 이메일 비밀번호 만들기 링크
 *   - 이메일로 가입              → 비밀번호 재설정 링크
 *   - 가입하지 않은 이메일        → 보내지 않음
 * 재설정 링크 = 관리자 generateLink(recovery) hashed_token → 요청한 사이트의 /auth/confirm (브랜드 사이트 안에서 끝남, §1.2.1)
 * 남용 방지: Turnstile 필수 + 같은 이메일 재발송 간격 (인스턴스 메모리 — 서버리스라 완전하지 않음, Turnstile이 1차 방어)
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from "@/lib/turnstile-server";
import { buildFromHeader, DEFAULT_SENDERS } from "@/lib/email/senders";
import { siteConfigs, type SiteIdentifier } from "@/lib/site-config";
import { getAllExternalDomains, isTenoneFamily } from "@/lib/domain-registry";

const resend = new Resend(process.env.RESEND_API_KEY);
const RESEND_INTERVAL_MS = 60_000;
const lastSent = new Map<string, number>();

const PROVIDER_LABEL: Record<string, string> = { google: "Google", kakao: "카카오" };

const ok = () => NextResponse.json({ ok: true, message: "입력한 이메일로 안내를 보냈습니다." });

function esc(s: string): string {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** 링크를 만들 사이트 origin — 등록된 도메인·로컬만, 그 외는 www.tenone.biz */
function siteOrigin(req: NextRequest): string {
    const origin = req.nextUrl.origin;
    const host = req.nextUrl.hostname;
    if (host === "localhost" || isTenoneFamily(host) || getAllExternalDomains().includes(host)) return origin;
    return "https://www.tenone.biz";
}

function mailHtml(opts: { brand: string; heading: string; body: string; ctaLabel: string; ctaHref: string; extra?: string }): string {
    return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;padding:28px 24px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#a3a3a3;">${esc(opts.brand)} · One ID</p>
    <h1 style="margin:0 0 12px;font-size:18px;color:#171717;">${opts.heading}</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#525252;">${opts.body}</p>
    <a href="${esc(opts.ctaHref)}" style="display:inline-block;background:#171717;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px;">${esc(opts.ctaLabel)}</a>
    ${opts.extra ?? ""}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a3a3a3;">직접 요청하지 않으셨다면 이 메일은 무시하셔도 됩니다. 계정은 안전합니다.</p>
  </div>
  <p style="margin:16px 0 0;text-align:center;font-size:11px;color:#a3a3a3;">Ten:One™ Universe One ID — 하나의 아이디로 모든 서비스를 이용합니다</p>
</div></body></html>`;
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({})) as { email?: unknown; captchaToken?: unknown; site?: unknown };
    if (!(await verifyTurnstile(body.captchaToken, req))) {
        return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return NextResponse.json({ error: "이메일 주소를 확인해주세요." }, { status: 400 });
    }

    // 같은 이메일 연속 요청은 조용히 무시 (응답은 동일)
    const now = Date.now();
    if ((lastSent.get(email) ?? 0) > now - RESEND_INTERVAL_MS) return ok();
    lastSent.set(email, now);

    const siteId = typeof body.site === "string" && body.site in siteConfigs ? (body.site as SiteIdentifier) : "tenone";
    const brand = siteConfigs[siteId].name;
    const origin = siteOrigin(req);

    // 계정 확인 + 재설정 토큰 (계정이 없으면 오류 → 아무것도 보내지 않음)
    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "recovery", email });
    const user = data?.user;
    const hashed = data?.properties?.hashed_token;
    if (error || !user || !hashed) return ok();

    const resetUrl = `${origin}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=recovery&next=/reset-password`;
    const providers = ((user.app_metadata?.providers as string[] | undefined) ?? [user.app_metadata?.provider as string])
        .filter(Boolean);
    const social = providers.filter(p => p !== "email").map(p => PROVIDER_LABEL[p] ?? p);
    const hasEmailLogin = providers.includes("email");

    const loginUrl = `${origin}/login`;
    const mail = !hasEmailLogin && social.length > 0
        ? {
            subject: `[${brand}] ${social.join("·")}로 가입한 One ID입니다`,
            html: mailHtml({
                brand,
                heading: `${esc(social.join("·"))}로 가입한 계정입니다`,
                body: `${esc(email)} 계정은 <b>${esc(social.join("·"))}</b> 로그인으로 만들어졌어요. 로그인 화면에서 <b>${esc(social[0])}로 로그인</b> 버튼을 눌러주세요. 비밀번호를 따로 만들지 않았다면 이메일·비밀번호로는 로그인되지 않습니다.`,
                ctaLabel: `${social[0]}로 로그인하러 가기`,
                ctaHref: loginUrl,
                extra: `<p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#737373;">이메일과 비밀번호로도 로그인하고 싶다면 <a href="${esc(resetUrl)}" style="color:#171717;">여기서 비밀번호를 만들 수 있어요</a> (1시간 안에 사용).</p>`,
            }),
        }
        : {
            subject: `[${brand}] 비밀번호 재설정 안내`,
            html: mailHtml({
                brand,
                heading: "비밀번호를 다시 설정하세요",
                body: `${esc(email)} 계정의 비밀번호 재설정을 요청하셨어요. 아래 버튼을 눌러 새 비밀번호를 만들어주세요 (1시간 안에 사용).${social.length ? ` 이 계정은 <b>${esc(social.join("·"))}</b> 로그인도 연결되어 있습니다.` : ""}`,
                ctaLabel: "비밀번호 재설정",
                ctaHref: resetUrl,
            }),
        };

    const { error: sendErr } = await resend.emails.send({
        from: buildFromHeader(DEFAULT_SENDERS.noreply, brand),
        to: email,
        subject: mail.subject,
        html: mail.html,
    });
    if (sendErr) console.error("[login-help] send failed:", sendErr.message);
    return ok();
}
