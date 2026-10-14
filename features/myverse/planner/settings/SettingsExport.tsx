"use client";

import { useState } from "react";
import { Loader2, Download, Check } from "lucide-react";

interface Sub {
    status: string;
    expires: string | null;
    is_pdf_buyer: boolean;
}

interface Props {
    sub: Sub;
    showToast: (text: string, ok?: boolean) => void;
}

export function SettingsExport({ sub, showToast }: Props) {
    const [exporting, setExporting] = useState(false);

    async function exportBackup() {
        setExporting(true);
        try {
            const [settingsRes, dailyRes, weeklyRes, monthlyRes, yearlyRes, identityRes, projectsRes] = await Promise.all([
                fetch("/api/myverse/settings"),
                fetch("/api/myverse/daily"),
                fetch("/api/myverse/weekly"),
                fetch("/api/myverse/monthly"),
                fetch("/api/myverse/yearly"),
                fetch("/api/myverse/identity"),
                fetch("/api/myverse/projects"),
            ]);
            const backup = {
                exported_at: new Date().toISOString(),
                version: "1.0",
                settings: settingsRes.ok ? await settingsRes.json() : null,
                daily: dailyRes.ok ? await dailyRes.json() : null,
                weekly: weeklyRes.ok ? await weeklyRes.json() : null,
                monthly: monthlyRes.ok ? await monthlyRes.json() : null,
                yearly: yearlyRes.ok ? await yearlyRes.json() : null,
                identity: identityRes.ok ? await identityRes.json() : null,
                projects: projectsRes.ok ? await projectsRes.json() : null,
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const d = new Date();
            const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
            a.href = url;
            a.download = `planners-ai-backup-${dateStr}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast("내보내지 못했습니다. 잠시 후 다시 시도해 주세요.", false);
        } finally {
            setExporting(false);
        }
    }

    return (
        <>
            {/* 홈 화면에 추가 — Planner's 앱 전용 설치 파일(매니페스트)이 아직 없어 브라우저 메뉴 안내만 (/myverse/install은 이 도메인에서 404, 2026-10-15 QA) */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-2">홈 화면에 추가</h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                    브라우저 메뉴(⋮ 또는 공유 버튼)에서 &lsquo;홈 화면에 추가&rsquo;를 누르면 플래너&apos;스 AI를 앱처럼 바로 열 수 있습니다.
                    휴대폰·태블릿·PC 모두 같은 기능으로 작동합니다.
                </p>
            </section>

            {/* 데이터 백업 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">데이터 백업</h2>
                <p className="text-xs text-neutral-500 mb-4">
                    설정·일간·주간·월간·연간·정체성·프로젝트 기록을 JSON 파일로 내려받습니다.
                </p>
                <button
                    onClick={exportBackup}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {exporting ? "내보내는 중…" : "JSON으로 내보내기"}
                </button>
            </section>

            {/* 이용 현황 — 지금은 베타 (가격·구매 링크 없음, CLAUDE.md §0.1 유료화는 베타 테스트를 거친다) */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-2">이용 현황</h2>
                {sub.status === "active" ? (
                    <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--pp-accent)]">
                            <Check className="h-4 w-4" /> 베타 테스터 · 인공지능 기능 사용 중
                        </p>
                        {sub.expires && (
                            <p className="text-xs text-neutral-600">
                                베타 기간:{" "}
                                {new Date(sub.expires).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" })}까지
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        플래너는 누구나 그대로 쓸 수 있습니다. 인공지능 기능은 지금 베타 테스터에게 먼저 열고 있습니다.
                        {sub.status === "expired" && " 베타 기간이 끝났습니다."}
                    </p>
                )}
            </section>
        </>
    );
}
