'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Globe, Settings, FileText, Bot, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import SmarCommHeader from '@/components/SmarCommHeader';
import { saveScanUrl } from '@/lib/smarcomm/auth';

const STEPS = [
  { label: '사이트 접속 중...', icon: Globe },
  { label: '기술 SEO 분석 중...', icon: Settings },
  { label: '콘텐츠 SEO 분석 중...', icon: FileText },
  { label: 'AI 검색 노출 확인 중...', icon: Bot },
  { label: '점수 산출 중...', icon: Calculator },
];

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || '';

  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const scanStarted = useRef(false);

  useEffect(() => {
    if (!url || scanStarted.current) return;
    scanStarted.current = true;

    // 프로그레스 애니메이션 (API 호출과 병렬)
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(iv); return 90; }
        return p + 1;
      });
    }, 100);

    // 실제 API 호출
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        clearInterval(iv);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || '분석 실패');
        }
        return res.json();
      })
      .then((result) => {
        const scanId = Date.now().toString(36);
        sessionStorage.setItem(`scan_${scanId}`, JSON.stringify(result));
        saveScanUrl(result.url, result.totalScore);

        setProgress(100);
        setStep(4);
        setTimeout(() => {
          router.push(`/sc/report/${scanId}`);
        }, 500);
      })
      .catch((err) => {
        clearInterval(iv);
        setError(err.message || '분석 중 오류가 발생했습니다');
      });

    return () => clearInterval(iv);
  }, [url, router]);

  useEffect(() => {
    setStep(Math.min(Math.floor(progress / 20), 4));
  }, [progress]);

  const StepIcon = STEPS[step].icon;

  if (!url) {
    return (
      <>
        <SmarCommHeader />
        <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-14">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-2 text-xl font-bold text-text">URL이 필요합니다</h1>
            <p className="mb-6 text-sm text-text-muted">분석할 사이트 URL을 입력해주세요.</p>
            <button onClick={() => router.push('/sc')} className="rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
              홈으로 돌아가기
            </button>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SmarCommHeader />
        <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-14">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
              <AlertCircle size={32} className="text-danger" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-text">분석 실패</h1>
            <p className="mb-6 text-sm text-text-sub">{error}</p>
            <button onClick={() => router.push('/sc')} className="rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-white">
              다시 시도
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SmarCommHeader />
      <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-14">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface">
            <StepIcon size={36} className="text-text" />
          </div>

          <h1 className="mb-2 text-xl font-bold text-text">
            {STEPS[step].label}
          </h1>
          <p className="mb-8 text-sm text-text-muted">
            {url.replace(/^https?:\/\//, '')} 실제 분석 중
          </p>

          <div className="mb-3 h-2 overflow-hidden rounded-full bg-border-light">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3B82F6, #10B981)',
              }}
            />
          </div>
          <div className="mb-10 text-2xl font-extrabold text-text">{progress}%</div>

          <div className="space-y-3 text-left">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    done
                      ? 'border-success/30 bg-success/5'
                      : active
                        ? 'border-border bg-surface'
                        : 'border-border bg-border-light opacity-40'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      done ? 'bg-success/20' : active ? 'bg-surface' : 'bg-border'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : (
                      <Icon size={16} className={active ? 'text-text' : 'text-text-muted'} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${done ? 'text-success' : active ? 'text-text' : 'text-text-muted'}`}>
                    {s.label.replace('...', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export default function SCScanPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-text-muted">로딩 중...</div>}>
      <ScanContent />
    </Suspense>
  );
}
