'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import HitProgressBar from './HitProgressBar';
import LikertScale from './LikertScale';
import HitInterestSelector from './HitInterestSelector';
import HitErrorRetry from './HitErrorRetry';

/** HIT C "진입" 검사 UI (2026-10-12): 트랙 선택 → 취업 준비(readiness) → 첫 직무 적응(onboarding) → 진로 결정(decision) */

type ModuleType = 'readiness' | 'onboarding' | 'career_decision';
interface QuestionItem { module: ModuleType; id: string; text: string; subscale: string; reverse?: boolean }
interface Response { selectedOption: number; optionValue: string }

const MODULE_NAMES: Record<ModuleType, string> = { readiness: '취업 준비 상태', onboarding: '첫 직무 적응', career_decision: '진로 결정 확신' };
const TRANSITIONS: Record<string, string> = {
  'readiness→onboarding': '준비 상태 확인이 끝났습니다. 다음은 첫 직무 적응입니다',
  'onboarding→career_decision': '마지막! 진로 결정 확신을 확인합니다',
};
const AVG_SECONDS = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function HitCTestUI({ sessionToken }: { sessionToken: string }) {
  const router = useRouter();
  // 어느 HIT A 회차를 잇는지 (소개 화면 ?a= → 테스트 URL → 채점) (2026-10-12)
  const hitAResultId = useSearchParams().get('a') || undefined;
  const [track, setTrack] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [transition, setTransition] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);
  const [selReady, setSelReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 이어하기 — 고른 트랙을 이 기기에 기억해 선택 화면을 다시 거치지 않게 (2026-10-12)
  const selKey = `hit_c_sel_${sessionToken}`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(selKey);
      if (saved) { const p = JSON.parse(saved) as { track?: string }; if (p.track) setTrack(p.track); }
    } catch { /* ignore */ }
    setSelReady(true);
  }, [selKey]);

  useEffect(() => {
    if (!track) return;
    setLoaded(false);
    type ApiQ = { id: string; text: string; subscale: string; reverse: boolean };
    const to = (m: ModuleType) => (q: ApiQ): QuestionItem => ({ module: m, id: q.id, text: q.text, subscale: q.subscale, reverse: q.reverse });
    fetch(`/api/hit/c/questions?trackId=${encodeURIComponent(track)}`)
      .then(r => { if (!r.ok) throw new Error('questions'); return r.json(); })
      .then(d => setQuestions([
        ...shuffle(((d.readiness ?? []) as ApiQ[]).map(to('readiness'))),
        ...shuffle(((d.onboarding ?? []) as ApiQ[]).map(to('onboarding'))),
        ...shuffle(((d.decision ?? []) as ApiQ[]).map(to('career_decision'))),
      ]))
      .catch(() => setQuestions([]))
      .finally(() => setLoaded(true));
  }, [track, loadTick]);

  useEffect(() => {
    if (!loaded || questions.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/hit/c/session/${sessionToken}`);
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d.responses) && !cancelled) {
            const m = new Map<string, Response>();
            for (const x of d.responses) m.set(x.question_id, { selectedOption: x.selected_option, optionValue: x.option_value });
            setResponses(m);
            const first = questions.findIndex(q => !m.has(q.id));
            if (first >= 0) setIdx(first);
          }
        }
      } catch { /* fresh */ } finally { if (!cancelled) setRestored(true); }
    })();
    return () => { cancelled = true; };
  }, [sessionToken, loaded, questions]);

  const total = questions.length;
  const q = questions[idx];

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await fetch('/api/hit/c/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken, trackId: track, hitAResultId }) });
      if (r.ok) { const d = await r.json(); router.push(`/hero/hit/c/result/${d.resultId}`); }
      else {
        const err = await r.json().catch(() => ({}));
        setSubmitError(err?.error || '결과 생성에 실패했습니다. 다시 시도해 주세요.');
        setSubmitting(false);
      }
    } catch { setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.'); setSubmitting(false); }
  }, [sessionToken, track, hitAResultId, router]);

  const select = useCallback((v: number) => {
    if (!q || transition || submitting) return;
    const optionValue = `${q.subscale}:${v}${q.reverse ? ':r' : ''}`;
    setResponses(prev => { const n = new Map(prev); n.set(q.id, { selectedOption: v - 1, optionValue }); return n; });
    fetch('/api/hit/c/response', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken, questionId: q.id, module: q.module, questionIndex: idx, selectedOption: v - 1, optionValue }) }).catch(() => {});
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = idx + 1;
      if (next >= total) { submit(); return; }
      const key = `${q.module}→${questions[next].module}`;
      if (q.module !== questions[next].module && TRANSITIONS[key]) {
        setTransition(TRANSITIONS[key]);
        setTimeout(() => { setTransition(null); setIdx(next); }, 2000);
      } else setIdx(next);
    }, 400);
  }, [q, idx, total, questions, transition, submitting, sessionToken, submit]);

  const back = useCallback(() => { if (idx > 0) { if (timer.current) clearTimeout(timer.current); setIdx(i => i - 1); } }, [idx]);

  useEffect(() => {
    if (!track || transition || submitting || submitError) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') back(); const n = parseInt(e.key, 10); if (n >= 1 && n <= 7) select(n); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [track, transition, submitting, submitError, back, select]);

  if (!selReady) return <div className="flex items-center justify-center min-h-screen"><div className="w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" /></div>;
  if (!track) {
    const choose = (t: string) => { try { localStorage.setItem(selKey, JSON.stringify({ track: t })); } catch { /* ignore */ } setTrack(t); };
    // 맞는 트랙이 없으면 '스타트업 종합' 트랙 (선택 화면에서 그렇게 안내함)
    return <div className="min-h-screen bg-white"><HitInterestSelector onSelect={(_i, _j, trackId) => choose(trackId ?? 'startup_general')} onSkip={() => choose('startup_general')} /></div>;
  }
  if (!loaded || (total > 0 && !restored)) return <div className="flex items-center justify-center min-h-screen"><div className="w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" /></div>;
  if (total === 0) return <div className="min-h-[60vh] flex items-center justify-center px-6"><HitErrorRetry message="문항을 불러오지 못했습니다." onRetry={() => { setRestored(false); setLoadTick(n => n + 1); }} /></div>;
  if (submitError && !submitting) return <div className="min-h-[60vh] flex items-center justify-center px-6"><HitErrorRetry message={submitError} onRetry={submit} /></div>;
  if (submitting) return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" /><p className="text-neutral-500 text-sm">진입 리포트를 만들고 있습니다...</p></div>;
  if (transition) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl md:text-2xl font-medium text-neutral-900 animate-pulse text-center px-6">{transition}</p></div>;

  const cur = q ? responses.get(q.id) : undefined;
  const remaining = total - responses.size;
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 pt-4 pb-2"><HitProgressBar current={responses.size} total={total} moduleName={MODULE_NAMES[q?.module ?? 'readiness']} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {idx > 0 && <button type="button" onClick={back} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-6"><ArrowLeft className="w-4 h-4" /> 이전 질문</button>}
          {q && (
            <div>
              <div className="text-center mb-10"><span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-500 font-medium mb-4">Q{idx + 1}</span><p className="text-lg md:text-xl font-medium text-neutral-900 leading-relaxed">{q.text}</p></div>
              <div className="max-w-md mx-auto"><LikertScale value={cur ? cur.selectedOption + 1 : null} onChange={select} disabled={submitting} /></div>
            </div>
          )}
        </div>
      </div>
      <div className="pb-6 text-center"><span className="inline-flex items-center gap-1.5 text-xs text-neutral-400"><Clock className="w-3.5 h-3.5" /> 약 {Math.max(1, Math.ceil((remaining * AVG_SECONDS) / 60))}분 남음</span></div>
    </div>
  );
}
