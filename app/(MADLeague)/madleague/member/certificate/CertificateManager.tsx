'use client';

import { useEffect, useState, useCallback } from 'react';
import { Award, Trophy, FileBadge, Download, CheckCircle2, Loader2 } from 'lucide-react';

interface Eligible {
  cert_type: 'activity' | 'competition' | 'award' | 'crown';
  cert_title: string;
  cert_details: Record<string, unknown>;
  already_issued: boolean;
}
interface Issued {
  id: string;
  type: string;
  title: string;
  details: Record<string, unknown>;
  verification_code: string;
  issued_at: string;
}

const TYPE_ICON: Record<string, typeof Award> = {
  activity: FileBadge,
  competition: Award,
  award: Award,
  crown: Trophy,
};

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  activity: { label: '활동', color: 'bg-neutral-800 text-neutral-300' },
  competition: { label: '참여', color: 'bg-blue-900 text-blue-200' },
  award: { label: '수상', color: 'bg-[#EC1D25] text-white' },
  crown: { label: 'MAD CROWN', color: 'bg-[#FFC000] text-black' },
};

export function CertificateManager({ memberName }: { memberName: string }) {
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [issued, setIssued] = useState<Issued[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/madleague/certificates');
      const data = await res.json();
      setEligible(data.eligible ?? []);
      setIssued(data.issued ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function issue(e: Eligible) {
    const key = e.cert_type + JSON.stringify(e.cert_details);
    setProcessing(key);
    try {
      const res = await fetch('/api/madleague/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: e.cert_type, title: e.cert_title, details: e.cert_details }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert('발급 실패: ' + (d.error ?? 'UNKNOWN'));
        return;
      }
      await load();
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-neutral-500" /></div>;
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-black mb-4">발급 가능 ({eligible.filter(e => !e.already_issued).length})</h2>
        {eligible.filter(e => !e.already_issued).length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 p-8 text-center text-neutral-500 text-sm">
            현재 발급 가능한 인증서가 없습니다. 활동 연도와 수상 기록이 추가되면 자동으로 표시됩니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eligible.filter(e => !e.already_issued).map((e) => {
              const Icon = TYPE_ICON[e.cert_type] ?? Award;
              const badge = TYPE_BADGE[e.cert_type] ?? TYPE_BADGE.activity;
              const key = e.cert_type + JSON.stringify(e.cert_details);
              return (
                <div key={key} className="bg-neutral-950 border border-neutral-900 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon className="h-6 w-6 text-[#FFC000] shrink-0" />
                    <div className="flex-1">
                      <span className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 ${badge.color}`}>{badge.label}</span>
                      <h3 className="mt-2 font-bold text-white">{e.cert_title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => issue(e)}
                    disabled={processing === key}
                    className="w-full bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold py-2.5 text-sm transition"
                  >
                    {processing === key ? '발급 중...' : '발급하기'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-black mb-4">발급된 인증서 ({issued.length})</h2>
        {issued.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 p-8 text-center text-neutral-500 text-sm">
            아직 발급한 인증서가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {issued.map((c) => {
              const Icon = TYPE_ICON[c.type] ?? Award;
              const badge = TYPE_BADGE[c.type] ?? TYPE_BADGE.activity;
              return (
                <div key={c.id} className="bg-neutral-950 border border-neutral-900 p-6 flex items-center gap-4">
                  <Icon className="h-8 w-8 text-[#FFC000] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 ${badge.color}`}>{badge.label}</span>
                      <span className="text-xs text-neutral-500">
                        {new Date(c.issued_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="font-bold text-white truncate">{c.title}</div>
                    <div className="text-xs text-neutral-500 mt-1 font-mono">
                      코드: {c.verification_code}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/madleague/certificate/verify/${c.verification_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold border border-neutral-700 hover:border-white px-3 py-2 text-white transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> 검증 페이지
                    </a>
                    <a
                      href={`/madleague/certificate/print/${c.verification_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-neutral-200 px-3 py-2 text-black transition"
                    >
                      <Download className="h-3.5 w-3.5" /> 인쇄/PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-xs text-neutral-500 leading-relaxed border-t border-neutral-900 pt-6">
        발급자: <span className="text-neutral-300">{memberName}</span><br />
        인증서 원본 파일은 &quot;인쇄/PDF&quot; 버튼을 누르면 인쇄 화면이 열립니다. 브라우저 인쇄 대화상자에서 &quot;PDF로 저장&quot;을 선택하세요.
      </div>
    </div>
  );
}
