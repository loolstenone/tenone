"use client";

import { Briefcase, Factory } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { INDUSTRIES, JOB_FUNCTIONS } from "@/lib/badak-constants";

export default function TaxonomiesStandardPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="산업군 / 직무군 표준"
                description="전 브랜드 공통 분류 상수 · 프로필·지원서·매칭에 사용"
            />

            {/* 경고 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900">
                <strong>주의:</strong> 이 상수는 <code className="font-mono bg-amber-100 px-1 rounded">lib/badak-constants.ts</code>에 정의됩니다.
                Badak · MADLeague · HeRo · Jakka 등 전 브랜드 프로필에 사용되므로, 추가·삭제 시 기존 데이터 영향을 반드시 확인하세요.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 산업군 */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Factory className="h-4 w-4 text-emerald-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">산업군 · INDUSTRIES</h2>
                        <span className="text-[11px] text-neutral-500">({INDUSTRIES.length}개)</span>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex flex-wrap gap-1.5">
                            {INDUSTRIES.map((i) => (
                                <span key={i} className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">{i}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 직무군 */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">직무군 · JOB_FUNCTIONS</h2>
                        <span className="text-[11px] text-neutral-500">({JOB_FUNCTIONS.length}개)</span>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex flex-wrap gap-1.5">
                            {JOB_FUNCTIONS.map((j) => (
                                <span key={j} className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">{j}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 사용 위치 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-neutral-900 mb-2">사용 위치</h3>
                <ul className="text-[11px] text-neutral-700 space-y-1 list-disc ml-4">
                    <li><code className="font-mono">badak_profiles</code> — 바닥장 프로필 (job_function, industry)</li>
                    <li><code className="font-mono">mad_applications</code> — MADLeague 지원서 (interests_industry, interests_job)</li>
                    <li><code className="font-mono">hero_profiles</code> — HeRo 커리어 프로필 (desired_industry)</li>
                    <li><code className="font-mono">members</code> — 공통 프로필 (interests_industry, interests_job)</li>
                </ul>
            </div>
        </div>
    );
}
