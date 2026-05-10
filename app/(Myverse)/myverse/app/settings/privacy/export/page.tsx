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
        <div className="max-w-2xl mx-auto px-6 py-8">
            <Link href="/myverse/app/settings/privacy" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 mb-3">
                <ArrowLeft className="h-3 w-3" /> 개인정보 설정으로
            </Link>
            <h1 className="text-xl font-serif text-neutral-900 mb-1">내 데이터 다운로드</h1>
            <p className="text-xs text-neutral-500 mb-6">
                Myverse가 보관 중인 내 데이터 전체를 JSON 한 파일로 받습니다 (GDPR 데이터 이동권).
            </p>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
                <div>
                    <p className="text-sm font-medium text-neutral-900 mb-2">포함되는 데이터</p>
                    <ul className="text-xs text-neutral-600 leading-relaxed space-y-1">
                        <li>• 프로필 (이름·이메일·핸들·소개)</li>
                        <li>• 모든 흔적 / 일과 / 장소 / 건강 기록</li>
                        <li>• 프로젝트 / 캔버스 / 노트 / 작업</li>
                        <li>• 커뮤니티 글·댓글·반응</li>
                        <li>• 1:1 메시지 (DM)</li>
                        <li>• 팔로우 관계 / 차단 목록</li>
                        <li>• AI 브리핑·인사이트·주간 리포트</li>
                        <li>• 결제·구독 이력</li>
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
                <Link href="/myverse/app/settings/privacy" className="underline hover:text-neutral-700">개인정보 설정</Link>에서 계정 삭제를 요청해 주세요.
            </div>
        </div>
    );
}
