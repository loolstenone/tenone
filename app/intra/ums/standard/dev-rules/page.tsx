"use client";

import { BookOpen, AlertTriangle, CheckSquare, GitMerge } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const PRINCIPLES = [
    { n: 1, rule: "구독 테이블은 `wio_subscription_plans` 하나만 쓴다", violation: "브랜드마다 구독 테이블 → 관리 불가" },
    { n: 2, rule: "Intra 전용 운영 테이블을 새로 만들지 않는다 (WIO 사용)", violation: "Intra·WIO 기능 이중 구현" },
    { n: 3, rule: "브랜드 사이트는 Supabase만 바라본다 (Intra API 직접 호출 금지)", violation: "브랜드 간 의존성" },
    { n: 4, rule: "SmarComm WS = WIO MKT-* 위의 어플리케이션 (이중 구현 금지)", violation: "마케팅 기능 중복" },
    { n: 5, rule: "에이전트는 사람과 같은 API를 쓴다", violation: "에이전트 전용 API → UI 동기화 깨짐" },
    { n: 6, rule: "모든 테이블에 `brand_id` 또는 `tenant_id`가 있다", violation: "RLS 격리 불가" },
    { n: 7, rule: "`site_configs.site_id`와 각 브랜드 layout 식별자가 일치해야 한다", violation: "SEO·테마 연동 깨짐" },
    { n: 8, rule: "맞춤 서비스 개발 기술은 WIO 코어에 환류한다 (Tech Flywheel)", violation: "기술 자산 사장" },
];

const TABLE_CHECKLIST = [
    "WIO 기존 테이블로 해결 안 되는가?",
    "brand_id 또는 tenant_id 컬럼이 있는가?",
    "RLS 정책이 brand_id/tenant_id 기반인가?",
    "외부 기업이 써도 작동하는가?",
    "맞춤 서비스에서 나온 기능이라면, 규격 서비스로 환류 가능한가?",
];

const BRAND_CHECKLIST = [
    "`lib/site-config.ts` → `siteConfigs` 추가 + `SiteIdentifier` 타입에 추가",
    "`domainMap`에 도메인 매핑 (독립 도메인일 경우)",
    "`lib/site-context.tsx` → `pathSiteMap`에 경로 매핑 추가",
    "`lib/domain-registry.ts` → 서브도메인/외부 도메인 등록",
    "`lib/intra-nav.ts` → 사이드바 브랜드 목록에 추가 (알파벳순)",
    "DB: `ums_sites` 테이블에 INSERT",
    "DB: `brand_capabilities`에 최소 `community` row INSERT",
    "`app/(BrandName)/layout.tsx` → `generateMetadata()` + `getSiteConfigServer()` 필수",
    "`app/(BrandName)/CLAUDE.md` → 템플릿 기반 브랜드 가이드 생성",
    "`app/(BrandName)/brandname/page.tsx` → 전용 랜딩 또는 `UnderConstruction`",
    "`app/(BrandName)/brandname/my/page.tsx` → `<MyProfileCard>` 적용",
    "Vercel 프로젝트에 도메인 연결 + env 동일하게 설정",
    "Supabase Auth > Allowed Redirect URLs에 `https://새도메인/**` 추가",
];

export default function DevRulesStandardPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="개발 규칙 8원칙"
                description="CLAUDE.md §1.10 · 이중 구현·격리 깨짐·자산 사장을 방지하는 개발 SSOT 룰"
            />

            {/* 8 Principles */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-neutral-500" />
                    8원칙
                </h2>
                <div className="space-y-2">
                    {PRINCIPLES.map(p => (
                        <div key={p.n} className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-4">
                            <div className="shrink-0 h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                                {p.n}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-neutral-900 mb-1">{p.rule}</p>
                                <p className="text-[10px] text-rose-700 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> 위반 시: {p.violation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Table Checklist */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    새 테이블 생성 전 체크리스트
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <ul className="space-y-2">
                        {TABLE_CHECKLIST.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                                <input type="checkbox" className="mt-0.5" disabled />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* New Brand Checklist */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-blue-500" />
                    새 브랜드 추가 체크리스트 (CLAUDE.md §2.4)
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <ul className="space-y-2">
                        {BRAND_CHECKLIST.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                                <input type="checkbox" className="mt-0.5" disabled />
                                <span dangerouslySetInnerHTML={{ __html: item.replace(/`([^`]+)`/g, '<code class="font-mono bg-neutral-100 px-1 rounded text-[10px]">$1</code>') }} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-rose-900 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    절대 하지 말 것 (부록 A)
                </p>
                <ul className="text-[11px] text-rose-800 space-y-1 list-disc ml-5">
                    <li><code className="font-mono bg-rose-100 px-1 rounded">vercel deploy</code> / <code className="font-mono bg-rose-100 px-1 rounded">npm run deploy:*</code> 직접 실행 (중복 빌드)</li>
                    <li>작업 중간 push (크레딧 소진)</li>
                    <li>master 외 브랜치에서 작업</li>
                    <li><code className="font-mono bg-rose-100 px-1 rounded">auth.users</code> 테이블 UPDATE/DELETE (Dashboard에서 사용자가 직접)</li>
                    <li>RLS disabled 테이블 생성</li>
                    <li>`tenant_id` / `brand_id` 없는 신규 테이블</li>
                    <li>프론트엔드에 `service_role` 키 노출</li>
                    <li>레이아웃에 <code className="font-mono bg-rose-100 px-1 rounded">export const metadata</code> (정적) 사용</li>
                </ul>
            </div>
        </div>
    );
}
