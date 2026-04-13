"use client";

import { useState } from "react";
import { PageHeader } from "@/components/intra/IntraUI";
import { RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface SyncResult {
  brand_id: string;
  status: "ok" | "error";
  rows?: number;
  error?: string;
}

export default function AnalyticsSyncPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SyncResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  async function runSync() {
    setRunning(true);
    setResults([]);
    setError(null);

    try {
      const res = await fetch(`/api/analytics/sync?days=${days}`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "동기화 실패");
      } else {
        setResults(json.results || []);
      }
    } catch (e) {
      setError("네트워크 오류");
    } finally {
      setRunning(false);
    }
  }

  const ok = results.filter((r) => r.status === "ok");
  const errs = results.filter((r) => r.status === "error");

  return (
    <div className="space-y-6">
      <PageHeader title="GA4 동기화" description="Google Analytics 4 데이터를 Supabase로 가져옵니다" />

      {/* 설정 안내 */}
      <div className="border border-blue-200 bg-blue-50 p-5 flex gap-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs text-blue-800">
          <p className="font-medium">GA4 서비스 계정 설정 필요</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Google Cloud Console → IAM → 서비스 계정 생성</li>
            <li>GA4 속성 → 설정 → 계정 액세스 관리 → 서비스 계정 이메일 추가 (뷰어 권한)</li>
            <li>서비스 계정 JSON 키 다운로드</li>
            <li>
              Vercel 환경변수 설정:{" "}
              <code className="bg-blue-100 px-1 rounded">GA4_PROPERTY_ID</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">GA4_SERVICE_ACCOUNT_JSON</code>
            </li>
          </ol>
        </div>
      </div>

      {/* 동기화 실행 */}
      <div className="border border-neutral-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold">수동 동기화</h3>

        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">기간</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-sm border border-neutral-200 rounded px-3 py-1.5 bg-white"
            >
              <option value={1}>어제 (1일)</option>
              <option value={7}>최근 7일</option>
              <option value={30}>최근 30일</option>
              <option value={90}>최근 90일</option>
            </select>
          </div>

          <button
            onClick={runSync}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-5"
          >
            <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
            {running ? "동기화 중..." : "동기화 실행"}
          </button>
        </div>

        <p className="text-[11px] text-neutral-400">
          자동 동기화: 매일 새벽 3시 (Supabase Edge Function Cron)
        </p>
      </div>

      {/* 오류 */}
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 flex gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* 결과 */}
      {results.length > 0 && (
        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-4 text-sm mb-4">
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {ok.length}개 성공
            </span>
            {errs.length > 0 && (
              <span className="flex items-center gap-1.5 text-red-500">
                <AlertCircle className="h-4 w-4" />
                {errs.length}개 실패
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {results.map((r) => (
              <div key={r.brand_id} className="flex items-center gap-3 text-xs">
                {r.status === "ok" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                )}
                <span className="w-24 text-neutral-700 font-medium">{r.brand_id}</span>
                <span className="text-neutral-500">
                  {r.status === "ok" ? `${r.rows}행 저장` : r.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 자동 동기화 일정 */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="text-sm font-semibold mb-4">자동 동기화 설정</h3>
        <div className="space-y-2 text-xs text-neutral-600">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span>일별 동기화</span>
            <span className="text-neutral-400">매일 03:00 KST</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span>대상 브랜드</span>
            <span className="text-neutral-400">24개 전체</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>데이터 보존</span>
            <span className="text-neutral-400">무기한 (Supabase)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
