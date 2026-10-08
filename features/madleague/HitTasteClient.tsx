'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { CrossSiteLink } from '@/components/CrossSiteLink';

export type TasteLikert = { id: string; text: string; direction: 'E' | 'I' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P'; reverse: boolean };
export type TasteDisc = { id: string; text: string; options: { value: string; label: string }[] };
export type TasteType = { name: string; label: string; overview: string; strengths: string[] };

const GOLD = '#FFC000';
const SCALE = [1, 2, 3, 4, 5];
const SCALE_LABEL: Record<number, string> = { 1: '전혀 아니다', 3: '보통', 5: '매우 그렇다' };
const AXES: [string, string][] = [['E', 'I'], ['N', 'S'], ['T', 'F'], ['J', 'P']];

/** HIT 미니 화면 — 문항 하나씩 → 결과 카드. 저장·전송 없음 (상태는 이 컴포넌트 안에만) */
export function HitTasteClient({ likert, disc, types }: { likert: TasteLikert[]; disc: TasteDisc[]; types: Record<string, TasteType> }) {
  const total = likert.length + disc.length;
  const [step, setStep] = useState(-1); // -1 = 시작 전
  const [likertAns, setLikertAns] = useState<Record<string, number>>({});
  const [discAns, setDiscAns] = useState<Record<string, string>>({});

  const result = useMemo(() => {
    if (step < total) return null;
    // 성격유형: 축마다 양쪽 방향 점수 합을 비교 (역문항은 6-값). 동점이면 앞 글자
    const score: Record<string, number> = {};
    for (const q of likert) {
      const v = likertAns[q.id] ?? 3;
      score[q.direction] = (score[q.direction] ?? 0) + (q.reverse ? 6 - v : v);
    }
    const mbti = AXES.map(([a, b]) => ((score[a] ?? 0) >= (score[b] ?? 0) ? a : b)).join('');
    // 행동유형: 가장 많이 고른 값. 동점이면 마지막 상황에서 고른 값
    const count: Record<string, number> = {};
    disc.forEach((q) => { const v = discAns[q.id]; if (v) count[v] = (count[v] ?? 0) + 1; });
    const max = Math.max(...Object.values(count));
    const tied = Object.keys(count).filter((k) => count[k] === max);
    const last = discAns[disc[disc.length - 1].id];
    const primary = tied.includes(last) ? last : tied[0];
    const code = `${primary}-${mbti}`;
    return { code, type: types[code] };
  }, [step, total, likert, disc, likertAns, discAns, types]);

  function reset() { setStep(-1); setLikertAns({}); setDiscAns({}); }

  // 시작 전
  if (step === -1) {
    return (
      <div className="border border-neutral-800 bg-black p-10 sm:p-14">
        <div className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>HIT MINI · {total}문항 · 약 3분</div>
        <h3 className="mt-4 text-3xl sm:text-4xl font-black leading-tight">나는 어떤 영웅일까?</h3>
        <p className="mt-6 max-w-2xl text-lg text-neutral-400 leading-relaxed">
          HeRo의 정식 진단 HIT에서 {total}문항만 뽑았다. 끝까지 답하면 64가지 영웅 유형 중 나와 가까운 유형을 미리 볼 수 있다.
        </p>
        <p className="mt-3 text-sm text-neutral-500">답변과 결과는 이 화면에서만 계산되고 어디에도 저장되지 않습니다.</p>
        <button onClick={() => setStep(0)} className="mt-10 inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-black transition hover:opacity-90" style={{ backgroundColor: GOLD }}>
          시작하기 <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // 결과
  if (result) {
    return (
      <div className="border bg-black p-10 sm:p-14" style={{ borderColor: GOLD }}>
        <div className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>HIT MINI 결과 · {result.code}</div>
        {result.type ? (
          <>
            <h3 className="mt-4 text-4xl sm:text-5xl font-black">{result.type.name}</h3>
            <p className="mt-3 text-xl font-bold" style={{ color: GOLD }}>{result.type.label}</p>
            <p className="mt-8 max-w-3xl text-lg text-neutral-300 leading-relaxed">{result.type.overview}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {result.type.strengths.map((s) => (
                <span key={s} className="border border-neutral-800 px-4 py-2 text-sm text-neutral-200">{s}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-6 text-lg text-neutral-300">유형을 찾지 못했다. 다시 해 보거나 정식 진단으로 확인해 보자.</p>
        )}
        <div className="mt-10 border-t border-neutral-900 pt-8">
          <p className="text-neutral-400 leading-relaxed">
            맛보기는 {total}문항짜리라 정식 결과와 다를 수 있다. 강점·주의점·맞는 일·커리어 방향까지 담긴 풀 리포트는 HeRo 정식 HIT에서.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CrossSiteLink href="/hero/hit/a" className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-black transition hover:opacity-90" style={{ backgroundColor: GOLD }}>
              정식 HIT 진단 받기 <ArrowRight className="h-5 w-5" />
            </CrossSiteLink>
            <button onClick={reset} className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-4 font-bold text-neutral-300 transition hover:border-white hover:text-white">
              <RotateCcw className="h-4 w-4" /> 다시 하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 문항
  const isLikert = step < likert.length;
  const progress = Math.round((step / total) * 100);
  const next = () => setStep((s) => s + 1);

  return (
    <div className="border border-neutral-800 bg-black p-8 sm:p-12">
      <div className="flex items-center justify-between text-xs font-bold tracking-widest text-neutral-500">
        <span>{step + 1} / {total}</span>
        {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="hover:text-white transition">이전</button>}
      </div>
      <div className="mt-3 h-1 bg-neutral-900"><div className="h-1 transition-all" style={{ width: `${progress}%`, backgroundColor: GOLD }} /></div>

      {isLikert ? (() => {
        const q = likert[step];
        return (
          <div className="mt-10">
            <p className="text-2xl sm:text-3xl font-black leading-snug">{q.text}</p>
            <div className="mt-10 grid grid-cols-5 gap-2 max-w-xl">
              {SCALE.map((v) => (
                <button key={v} onClick={() => { setLikertAns((a) => ({ ...a, [q.id]: v })); next(); }}
                  className={`h-14 border text-lg font-black transition ${likertAns[q.id] === v ? 'border-[#FFC000] bg-[#FFC000] text-black' : 'border-neutral-700 hover:border-[#FFC000] hover:bg-[#FFC000] hover:text-black'}`}>
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 max-w-xl text-xs text-neutral-500">
              {SCALE.map((v) => <span key={v} className="text-center">{SCALE_LABEL[v] ?? ''}</span>)}
            </div>
          </div>
        );
      })() : (() => {
        const q = disc[step - likert.length];
        return (
          <div className="mt-10">
            <p className="text-2xl sm:text-3xl font-black leading-snug">{q.text}</p>
            <div className="mt-8 space-y-3">
              {q.options.map((o) => (
                <button key={o.value} onClick={() => { setDiscAns((a) => ({ ...a, [q.id]: o.value })); next(); }}
                  className="block w-full border p-5 text-left text-lg leading-relaxed transition hover:border-[#FFC000] hover:text-white"
                  style={discAns[q.id] === o.value ? { borderColor: GOLD, color: '#fff' } : { borderColor: '#262626', color: '#d4d4d4' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
