"use client";

/**
 * 외부 리소스 운영 기준 — 코드 밖에서 설정하는 SaaS·플랫폼 (CLAUDE.md 부록 G)
 * 실시간 상태·키 목록은 통합 관리 > 외부 리소스(/intra/ums/external)
 */
import Link from "next/link";
import { ArrowRight, KeyRound, Server, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const RULES = [
    { title: "비밀은 금고에만", desc: "키·토큰은 Vercel 환경변수 또는 Supabase Vault에만 둔다. 코드·.env.local·DB 명령문(pg_cron)·문서에 평문 금지. 개인 접근 토큰(PAT)은 보관하지 않는다 (부록 D)" },
    { title: "외부에서 부를 수 있는 것은 전부 인증", desc: "Edge Function = x-edge-secret(Vault) · 크론 API = isInternalRequest(ADMIN_API_KEY·CRON_SECRET 16자 이상, 미설정 키는 절대 통과 안 함) · 공개 폼 = Turnstile fail-closed" },
    { title: "돈이 나가는 호출은 잠그고 나서 충전", desc: "Claude API·메일 발송처럼 호출마다 비용이 드는 경로는 인증을 먼저 확인한 뒤 크레딧·한도를 연다" },
    { title: "예약 작업은 결과로 확인", desc: "pg_cron 'succeeded'는 요청을 보냈다는 뜻일 뿐. 실제 결과는 net._http_response(status_code·content), Vercel 크론은 런타임 로그로 본다" },
    { title: "배포 경로는 하나", desc: "코드 배포 = git push origin master만 (작업 종료·명시적 요청 시 1회). vercel deploy 직접 실행 금지 (§4.3 비용)" },
    { title: "새 외부 서비스는 법적 검토 포함", desc: "개인정보를 보내면 처리위탁·국외이전 고지 대상 (개인정보처리방침 갱신, 헌법 §0.1 법적 검토)" },
];

const SERVICES = [
    { name: "Vercel", role: "Next.js 호스팅 · 크론 · 도메인", notes: ["리전 icn1 · On-Demand 상한 $100", "크론 = vercel.json (무거운 크롤은 KST 02~06시)", "환경변수: 전 도메인 동일 Supabase URL·anon 키"] },
    { name: "Supabase", role: "DB·Auth·Storage·Edge Function·pg_cron (프로젝트 ziotlxkdctlhiwkgmmsh, 서울)", notes: ["SQL = MCP apply_migration (파일 → 롤백 시뮬레이션 → 승인 → 적용 → anon REST 검증)", "Vault: edge_function_secret — Edge Function 호출 인증 (edge_function_secret() service_role 전용)", "Edge Function 11개 x-edge-secret 필수 · pg_cron 4개 (trend-crawl·trend-to-draft 매시간, daily-vrief 10:01, mindle-weak-signal)", "Storage: avatars · site-branding · board-assets · contact-attachments(비공개)"] },
    { name: "Anthropic API", role: "에이전트·트렌드 분석·브리핑 (Claude)", notes: ["서버용 선불 크레딧 — Claude 구독과 별개 결제 계정", "주 사용처: trend-crawl(매시간 Haiku·Sonnet) · daily-vrief · 챗봇 · Gravity 분석", "잔액 0이면 해당 기능 전부 500 ('credit balance is too low') — 콘솔에서 충전"] },
    { name: "Resend", role: "메일 발송 (Auth SMTP · 뉴스레터 · 알림)", notes: ["발신 noreply@tenone.biz (tenone.biz 검증)", "외부 입력이 들어가는 메일 본문은 escapeHtml 필수 (피싱 HTML 방지)", "뉴스레터 발송 스위치 NEWSLETTER_DISPATCH_ENABLED"] },
    { name: "Cloudflare Turnstile", role: "공개 폼·가입 봇 차단", notes: ["서버 검증 verifyTurnstile — 키 없으면 실패(fail-closed)", "문의·지원·구독·캐스팅 제안 등 공개 폼 전부 적용"] },
    { name: "Google Tag Manager · GA4", role: "방문 분석", notes: ["GTM-564KNJ9S · G-6N89DJMB7C", "SPA page_view = Analytics.tsx dataLayer → CE - page_view 트리거 (brand_id 포함)"] },
    { name: "Naver Search API", role: "Brand Gravity 리뷰 수집 (pain-collect)", notes: ["NAVER_CLIENT_ID·SECRET = Edge Function 환경변수"] },
];

export default function ExternalStandardPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="외부 리소스 운영 기준" description="코드 밖 SaaS·플랫폼의 운영 원칙 — 상태·키 목록은 통합 관리 › 외부 리소스" >
                <Link href="/intra/ums/external" className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1">외부 리소스 현황 <ArrowRight className="h-3 w-3" /></Link>
            </PageHeader>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />운영 원칙</h2>
                <div className="space-y-2">
                    {RULES.map((r, i) => (
                        <div key={r.title} className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-3">
                            <span className="h-6 w-6 shrink-0 rounded bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <div>
                                <p className="text-sm font-semibold text-neutral-900">{r.title}</p>
                                <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">{r.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><Server className="h-4 w-4" />서비스별 기준</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SERVICES.map(s => (
                        <div key={s.name} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{s.role}</p>
                            <ul className="mt-2 space-y-0.5">
                                {s.notes.map(n => <li key={n} className="text-[11px] text-neutral-600 flex gap-1.5"><KeyRound className="h-3 w-3 mt-0.5 shrink-0 text-neutral-300" />{n}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
