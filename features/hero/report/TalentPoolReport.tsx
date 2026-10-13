/**
 * 써치 라이트 — 인재 풀 리포트 (기업에게 보이는 자동 묶음 통계, 2026-10-13)
 * 원천: POST /api/hero/talent-pool → report. 개인 단위 값 없음, 5명 미만 칸은 '5명 미만'
 */
import { BalanceBars, ReportCard, ShareBars } from "@/features/hero/report/StatBars";

type Cell = { label: string; pct: number; hidden: boolean };

export interface TalentPoolReportData {
    careers: Cell[];
    workModes: Cell[];
    locations: Cell[];
    industries: Cell[];
    hitRate: number;
    roles: { role: string; desc: string; pct: number; hidden: boolean }[] | null;
    axes: { left: string; right: string; leftDesc: string; rightDesc: string; leftPct: number }[] | null;
    interests: { label: string; desc: string; pct: number; hidden: boolean }[] | null;
}

export function TalentPoolReport({ report }: { report: TalentPoolReportData }) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-bold text-[#E53935]">인재 풀 리포트</p>
                <p className="text-xs text-neutral-500 mt-1 break-keep">
                    조건에 맞는 인재 전체의 비율입니다. 개인의 검사 결과·이름은 보이지 않으며, 5명 미만인 항목은 숫자를 가립니다.
                </p>
            </div>

            <ReportCard title="희망 조건" desc="경력 단계와 원하는 근무 방식·지역">
                <div className="grid md:grid-cols-2 gap-6">
                    <ShareBars items={report.careers} />
                    <ShareBars items={report.workModes} />
                </div>
                {report.locations.length > 0 && <div className="mt-6"><ShareBars items={report.locations.slice(0, 6)} /></div>}
            </ReportCard>

            {report.industries.length > 0 && (
                <ReportCard title="관심 산업" desc="많이 고른 산업 (중복 선택)">
                    <ShareBars items={report.industries} />
                </ReportCard>
            )}

            {report.roles && report.axes ? (
                <>
                    <ReportCard title="행동 유형" desc={`HIT 기본 성향 검사를 마친 인재(${report.hitRate}%) 기준 — 팀에서 주로 맡는 역할`}>
                        <ShareBars items={report.roles.map(r => ({ label: r.role, sub: r.desc, pct: r.pct, hidden: r.hidden }))} />
                    </ReportCard>
                    <ReportCard title="일하는 방식" desc="양쪽 성향의 평균">
                        <BalanceBars items={report.axes} />
                    </ReportCard>
                    {report.interests && report.interests.length > 0 && (
                        <ReportCard title="흥미 유형" desc="가장 끌리는 일의 종류">
                            <ShareBars items={report.interests.map(i => ({ label: i.label, sub: i.desc, pct: i.pct, hidden: i.hidden }))} />
                        </ReportCard>
                    )}
                </>
            ) : (
                <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 break-keep">
                    성향 통계는 HIT 검사를 마친 인재가 5명 이상일 때 보여 드립니다.
                </p>
            )}
        </div>
    );
}
