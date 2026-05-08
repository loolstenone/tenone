"use client";

import { useRef, useState } from "react";
import { Loader2, Download, Check, ExternalLink, Archive } from "lucide-react";
import Link from "next/link";
import { InstallButton } from "@/features/myverse/planner/InstallButton";

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
    const [importing, setImporting] = useState(false);
    const zipRef = useRef<HTMLInputElement | null>(null);

    async function importMetaZip(file: File) {
        setImporting(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/myverse/moments/import-meta", { method: "POST", body: form });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast(`백업 가져오기 실패: ${json.error || res.status}${json.hint ? " · " + json.hint : ""}`, false);
                return;
            }
            showToast(`가져옴 ${json.imported ?? 0}건 · 건너뜀 ${json.skipped ?? 0}건 · 총 ${json.total ?? 0}건`);
        } catch (e) {
            showToast(`오류: ${(e as Error).message}`, false);
        } finally {
            setImporting(false);
        }
    }

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
            a.download = `myverse-backup-${dateStr}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    }

    return (
        <>
            {/* 앱 설치 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-2">앱 설치</h2>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                    사용하고 계신 브라우저의 삼점 메뉴(⋮)를 통해{" "}
                    <span className="font-medium text-neutral-700">마이버스</span>를 홈 화면에 추가하시면 일반 앱처럼 사용하실 수 있습니다.
                    Android · iPhone · iPad · PC 모두 지원하며, 모든 기능은 웹과 동일하게 작동합니다.
                </p>
                <InstallButton
                    hideWhenInstalled={false}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5] transition-colors"
                >
                    <Download className="h-3.5 w-3.5" />
                    앱 설치 상세
                </InstallButton>
            </section>

            {/* 데이터 백업 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">데이터 백업</h2>
                <p className="text-xs text-neutral-500 mb-4">
                    설정·일별·주별·월별·연간·퍼스널·프로젝트 데이터를 JSON 파일로 내보냅니다.
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

            {/* SNS 백업 가져오기 — Instagram / Facebook 미디어 자동 임포트 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">SNS 백업 가져오기</h2>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                    Instagram·Facebook의 GDPR 백업 ZIP을 그대로 업로드하면, 사진·동영상이 촬영 일자와 캡션과 함께 자동으로 "오늘의 한 장면"에 등록됩니다.
                    <br />
                    <span className="text-neutral-400">
                        ※ Instagram: 설정 → 정보 다운로드 → JSON 형식 / Facebook: 설정 → 정보 다운로드 → JSON
                    </span>
                </p>
                <input
                    ref={zipRef}
                    type="file"
                    accept=".zip,application/zip"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) importMetaZip(file);
                        e.target.value = "";
                    }}
                    className="hidden"
                />
                <button
                    onClick={() => zipRef.current?.click()}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                    {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                    {importing ? "가져오는 중…" : "ZIP 선택"}
                </button>
            </section>

            {/* 구독 현황 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">구독 현황</h2>

                {sub.status === "active" ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#6366F1]" />
                            <span className="text-sm font-semibold text-[#6366F1]">활성 구독</span>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400">이용 중</p>
                            <p className="text-sm font-medium text-neutral-900">Myverse AI · 무제한</p>
                            <p className="text-[11px] text-neutral-600">능동 AI 비서 · 모든 템플릿 · Calendar/Notion/Slack 연동</p>
                        </div>
                        {sub.expires && (
                            <p className="text-xs text-neutral-600">
                                만료:{" "}
                                {new Date(sub.expires).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        )}
                        <Link
                            href="/myverse/purchase"
                            className="inline-flex items-center gap-1.5 text-xs text-[#6366F1] hover:underline"
                        >
                            구독 연장 <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-neutral-500">
                            {sub.status === "expired" ? "구독이 만료되었습니다." : "아직 구독하지 않으셨습니다."}
                        </p>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                                런칭 프로모션
                            </p>
                            <p className="text-sm font-semibold text-neutral-900 mb-2">첫 1년 19,000원</p>
                            <ul className="text-[11px] text-neutral-600 space-y-0.5 mb-3">
                                <li>• 능동 AI 비서 · 매일 아침 브리핑</li>
                                <li>• 59종 시각 템플릿 무제한</li>
                                <li>• Google Calendar / Notion / Slack 연동</li>
                            </ul>
                            <Link
                                href="/myverse/purchase"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm hover:bg-[#4F46E5] transition-colors"
                            >
                                구독 시작
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
