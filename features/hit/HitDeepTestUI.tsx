'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { chDeepQuestions } from '@/lib/hit/data/ch-deep-questions';
import { apDeepQuestions } from '@/lib/hit/data/ap-deep-questions';

interface DeepQuestion {
  id: string;
  module: 'character_deep' | 'aptitude_deep';
  text: string;
}

interface Props {
  hitAResultId: string;
}

export function HitDeepTestUI({ hitAResultId }: Props) {
  const router = useRouter();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allQuestions: DeepQuestion[] = useMemo(() => [
    ...chDeepQuestions.map(q => ({ id: q.id, module: 'character_deep' as const, text: q.text })),
    ...apDeepQuestions.map(q => ({ id: q.id, module: 'aptitude_deep' as const, text: q.text })),
  ], []);

  // 세션 생성
  useEffect(() => {
    const storageKey = `hit_a_deep_${hitAResultId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sessionToken) setSessionToken(parsed.sessionToken);
        if (parsed.responses) setResponses(parsed.responses);
        if (typeof parsed.currentIdx === 'number') setCurrentIdx(parsed.currentIdx);
        setLoading(false);
        return;
      } catch {}
    }

    fetch('/api/hit/a/deep/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hitAResultId }),
    })
      .then(r => r.json())
      .then(data => {
        const token = data.data?.sessionToken || data.sessionToken;
        if (token) {
          setSessionToken(token);
          localStorage.setItem(storageKey, JSON.stringify({ sessionToken: token, responses: {}, currentIdx: 0 }));
        } else {
          setError(data.message || data.error || '세션 생성 실패');
        }
      })
      .catch(() => setError('세션 생성 실패'))
      .finally(() => setLoading(false));
  }, [hitAResultId]);

  // 로컬 저장
  useEffect(() => {
    if (!sessionToken) return;
    const storageKey = `hit_a_deep_${hitAResultId}`;
    localStorage.setItem(storageKey, JSON.stringify({ sessionToken, responses, currentIdx }));
  }, [sessionToken, responses, currentIdx, hitAResultId]);

  const currentQ = allQuestions[currentIdx];
  const progress = Math.round((currentIdx / allQuestions.length) * 100);

  const handleAnswer = useCallback(async (value: number) => {
    if (!sessionToken || !currentQ) return;
    setResponses(prev => ({ ...prev, [currentQ.id]: value }));

    fetch('/api/hit/a/deep/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        questionId: currentQ.id,
        module: currentQ.module,
        questionIndex: currentIdx,
        selectedOption: value,
        optionValue: String(value),
      }),
    }).catch(() => {});

    if (currentIdx < allQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch('/api/hit/a/deep/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, hitAResultId }),
        });
        const data = await res.json();
        if (data.data?.resultId || data.resultId || data.data?.success || data.success) {
          localStorage.removeItem(`hit_a_deep_${hitAResultId}`);
          router.push(`/hero/hit/a/deep/result/${hitAResultId}`);
        } else {
          setError(data.message || data.error || '채점 실패');
          setSubmitting(false);
        }
      } catch {
        setError('채점 요청 실패');
        setSubmitting(false);
      }
    }
  }, [sessionToken, currentQ, currentIdx, allQuestions.length, hitAResultId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-pulse text-neutral-400">준비 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center max-w-md px-6">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/hero/hit/a/deep" className="text-[#F5C518] hover:underline">돌아가기</a>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full mb-4"></div>
          <p className="text-neutral-400">심화 결과 생성 중...</p>
        </div>
      </div>
    );
  }

  const moduleLabel = currentQ?.module === 'character_deep' ? '인성 심화' : '적성 심화';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm text-neutral-400">
            <span>{moduleLabel}</span>
            <span>{currentIdx + 1} / {allQuestions.length}</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5C518] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-medium leading-relaxed">
            {currentQ?.text}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map(v => (
            <button
              key={v}
              onClick={() => handleAnswer(v)}
              className="aspect-square rounded-lg border border-neutral-700 hover:border-[#F5C518] hover:bg-[#F5C518]/10 transition-colors text-lg font-medium"
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-neutral-500">
          <span>전혀 그렇지 않다</span>
          <span>매우 그렇다</span>
        </div>

        {currentIdx > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
            >
              ← 이전 문항
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
