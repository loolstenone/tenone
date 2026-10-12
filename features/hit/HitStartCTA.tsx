'use client';

import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import HitErrorRetry from './HitErrorRetry';
import { RESTART_CONFIRM, type HitResume } from './useHitResume';

/**
 * 검사 소개 화면 시작 버튼 공용 — 진행 중이면 "이어서 하기 + 처음부터 다시", 실패하면 메시지 + 다시 시도 (2026-10-12)
 * onStart(true)는 기존 진행분을 버리고 새로 시작하므로 확인을 거친다.
 */
export default function HitStartCTA({ label, resume, total, starting, error, onStart, onResume }: {
  label: string;
  resume: HitResume | null;
  total: number;
  starting: boolean;
  error: string | null;
  onStart: (restart: boolean) => void;
  onResume: () => void;
}) {
  const restart = () => { if (window.confirm(RESTART_CONFIRM)) onStart(true); };
  return (
    <div className="flex flex-col items-center gap-4">
      {error && <HitErrorRetry message={error} onRetry={() => onStart(false)} />}
      {resume ? (
        <>
          <button onClick={onResume} className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl">
            이어서 하기 <span className="text-sm font-medium opacity-80">({resume.answered}/{total} 답변)</span> <ArrowRight className="h-5 w-5" />
          </button>
          <button onClick={restart} disabled={starting} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50">
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} 처음부터 다시 하기
          </button>
        </>
      ) : (
        <button onClick={() => onStart(false)} disabled={starting} className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl disabled:opacity-50">
          {starting ? <><Loader2 className="h-5 w-5 animate-spin" /> 시작하는 중...</> : <>{label} <ArrowRight className="h-5 w-5" /></>}
        </button>
      )}
    </div>
  );
}
