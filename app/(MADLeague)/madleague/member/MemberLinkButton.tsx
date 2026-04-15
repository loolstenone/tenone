'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';

export function MemberLinkButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function link() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/madleague/member/link', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setResult('연동 성공! 페이지를 새로고침합니다.');
        setTimeout(() => window.location.reload(), 900);
      } else if (data.reason === 'NO_MATCH') {
        setResult('이메일에 해당하는 승인된 매드리거 기록이 없습니다.');
      } else {
        setResult('연동 실패: ' + (data.error ?? '알 수 없는 오류'));
      }
    } catch {
      setResult('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={link}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold px-8 py-4 transition"
      >
        <Link2 className="h-4 w-4" /> {loading ? '연동 중...' : '내 기록 연동 시도'}
      </button>
      {result && <div className="w-full mt-3 text-sm text-neutral-400">{result}</div>}
    </>
  );
}
