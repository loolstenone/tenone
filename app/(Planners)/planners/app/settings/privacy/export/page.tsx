"use client";

// 데이터 다운로드 — GDPR 권리 (데이터 이동권)
// JSON 한 파일로 모든 사용자 데이터를 받음.

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Check } from "lucide-react";

export default function ExportPage() {
    const [downloading, setDownloading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function startDownload() {
        setDownloading(true);
        setError(null);
        setDone(false);
        try {
            const res = await fetch("/api/myverse/data-export");
            if (!res.ok) {
                setError("데이터 수집 실패. 잠시 후 다시 시도해 주세요.");
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `myverse-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setDone(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12"><div className="max-w-2xl">
            <Link href="/planners/app/settings/privacy" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 mb-3">
                <ArrowLeft className="h-3 w-3" /> 사생활 설정으로
            </Link>
            <h1 className="text-[28px] sm:text-[32px] font-medium tracking-tight text-neutral-900 mb-2">내 데이터 내려받기</h1>
            <p className="text-xs text-neutral-500 mb-6">
                내 계정에 저장된 기록 전체를 한 파일(JSON)로 받습니다. 다른 서비스로 옮기거나 보관할 때 쓰세요.
            </p>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
                <div>
                    <p className="text-sm font-medium text-neutral-900 mb-2">포함되는 데이터</p>
                    <ul className="text-xs text-neutral-600 leading-relaxed space-y-1">
                        <li>• 프로필 (이름·이메일)</li>
                        <li>• 하루 기록: 할 일 · 노트 · 하루 결과 · Top 3 · 저녁 회고</li>
                        <li>• 일정 · 프로젝트 · 마일스톤 · 캔버스 · 템플릿</li>
                        <li>• 정체성 · 주간 회고</li>
                        <li>• 예전에 MyVerse를 함께 썼다면 그 기록도 포함됩니다</li>
                    </ul>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                        <span className="font-medium text-neutral-700">미디어 파일</span> (사진·영상)은 URL만 포함됩니다.
                        실제 파일은 해당 URL을 직접 열어 별도로 받으세요.
                    </p>
                </div>

                <button
                    onClick={startDownload}
                    disabled={downloading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                    {downloading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> 데이터 모으는 중…</>
                    ) : done ? (
                        <><Check className="h-4 w-4" /> 다운로드 완료</>
                    ) : (
                        <><Download className="h-4 w-4" /> 데이터 다운로드</>
                    )}
                </button>

                {error && (
                    <p className="text-xs text-rose-500">{error}</p>
                )}
            </div>

            <div className="mt-4 text-[11px] text-neutral-400 leading-relaxed">
                다운로드 시점의 스냅샷입니다. 이후 데이터 변경 사항은 포함되지 않습니다.
                삭제 권리(잊혀질 권리)를 행사하려면{" "}
                <Link href="/planners/app/settings/privacy" className="underline hover:text-neutral-700">개인정보 설정</Link>에서 계정 삭제를 요청해 주세요.
            </div>
        </div></div>
    );
}
