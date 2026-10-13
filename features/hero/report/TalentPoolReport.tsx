/**
 * 써치 라이트 — 인재 풀 리포트 (기업에게 보이는 자동 묶음 통계, 2026-10-13)
 * 원천: POST /api/hero/talent-pool → report. 개인 단위 값 없음, 5명 미만 칸은 '5명 미만'
 * ⛔ 개인 HIT 결과는 본인만 — 성향은 '원하는 성향의 사람이 어느 정도 있나'(어림값·많고 적음)만 보여 준다
 */
import clsx from "clsx";
import { DISC_ROLES, INTERESTS, WORK_AXES, type TraitWish } from "@/lib/hero/group-stats";
import { ReportCard, ShareBars } from "@/features/hero/report/StatBars";

type Cell = { label: string; pct: number; hidden: boolean };

export interface TalentPoolReportData {
    careers: Cell[];
    workModes: Cell[];
    locations: Cell[];
    industries: Cell[];
    traits: { available: true; base: string; label: string; level: string } | { available: false; base: string } | null;
}

export function TalentPoolReport({ report }: { report: TalentPoolReportData }) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-bold text-[#E53935]">인재 풀 리포트</p>
                <p className="text-xs text-neutral-500 mt-1 break-keep">
                    조건에 맞는 인재들이 적어 둔 희망 조건의 비율입니다. 5명 미만인 항목은 숫자를 가립니다.
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
        </div>
    );
}

/** 원하는 성향 고르기 + '어느 정도 있나' 결과 */
export function TraitWishCard({ value, onChange, result }: {
    value: TraitWish;
    onChange: (v: TraitWish) => void;
    result: TalentPoolReportData["traits"] | undefined;
}) {
    const toggle = (k: "roles" | "interests", key: string) =>
        onChange({ ...value, [k]: value[k].includes(key) ? value[k].filter(x => x !== key) : [...value[k], key] });
    const setAxis = (key: keyof TraitWish["work"], side: "left" | "right") => {
        const work = { ...value.work };
        if (work[key] === side) delete work[key]; else work[key] = side;
        onChange({ ...value, work });
    };
    const chip = (on: boolean) => clsx("px-3 py-1.5 rounded-none text-xs border transition-colors",
        on ? "bg-red-50 border-[#E53935] text-[#E53935] font-bold" : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400");

    return (
        <ReportCard title="원하는 성향의 인재가 어느 정도 있나요" desc="HIT 검사 결과는 본인만 봅니다. 성향 통계에 따로 동의한 인재만 세고, 대략적인 인원과 많고 적음만 보여 드립니다.">
            <div className="space-y-5">
                <div>
                    <p className="text-xs font-bold text-neutral-500 mb-2">팀에서 맡을 역할 (하나라도 맞으면)</p>
                    <div className="flex flex-wrap gap-2">
                        {DISC_ROLES.map(d => (
                            <button key={d.key} type="button" onClick={() => toggle("roles", d.key)} className={chip(value.roles.includes(d.key))} title={d.desc}>{d.role}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-neutral-500 mb-2">일하는 방식 (원하는 쪽만)</p>
                    <div className="space-y-2">
                        {WORK_AXES.map(a => (
                            <div key={a.key} className="flex items-center gap-2">
                                <button type="button" onClick={() => setAxis(a.key, "left")} className={chip(value.work[a.key] === "left")} title={a.leftDesc}>{a.left}</button>
                                <span className="text-neutral-300 text-xs">·</span>
                                <button type="button" onClick={() => setAxis(a.key, "right")} className={chip(value.work[a.key] === "right")} title={a.rightDesc}>{a.right}</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-neutral-500 mb-2">끌리는 일 (하나라도 맞으면)</p>
                    <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(i => (
                            <button key={i.key} type="button" onClick={() => toggle("interests", i.key)} className={chip(value.interests.includes(i.key))} title={i.desc}>{i.label}</button>
                        ))}
                    </div>
                </div>

                {result && (
                    <div className="rounded-xs bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm break-keep">
                        {result.available ? (
                            <p>성향 통계에 동의한 인재 {result.base} 중 원하는 성향에 맞는 사람은 <b>{result.label}</b>, <b>{result.level}</b>입니다.</p>
                        ) : (
                            <p className="text-neutral-600">성향 통계에 동의한 인재가 아직 적어(현재 {result.base}) 보여 드리지 않습니다. 조건을 넓혀 보세요.</p>
                        )}
                    </div>
                )}
                <p className="text-xs text-neutral-500 break-keep">성향은 인원 확인에만 쓰입니다. 제안은 위 조건에 맞는 인재 전원에게 가고, 응한 인재의 검사 결과는 전달되지 않습니다.</p>
            </div>
        </ReportCard>
    );
}
