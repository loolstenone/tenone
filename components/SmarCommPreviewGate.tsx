'use client';

import { useState } from 'react';

export function SmarCommPreviewGate({ previewKey }: { previewKey: string }) {
  const [showInput, setShowInput] = useState(false);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (key === previewKey) {
      document.cookie = `sc_preview=${previewKey}; path=/; max-age=${60 * 60 * 24 * 30}`;
      window.location.reload();
    } else {
      setError('올바르지 않은 코드입니다');
      setKey('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* 로고 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Smar<span className="text-neutral-400">Comm</span>.
          </h1>
        </div>

        {/* 메인 메시지 */}
        <div className="mb-8">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            서비스 준비 중입니다
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            AI 기반 마케팅 커뮤니케이션 솔루션<br />
            SmarComm이 곧 새로운 모습으로 찾아옵니다.
          </p>
        </div>

        {/* 구분선 */}
        <div className="w-12 h-px bg-neutral-200 mx-auto mb-8" />

        {/* Coming Soon */}
        <p className="text-xs text-neutral-400 tracking-widest uppercase mb-6">
          Coming Soon
        </p>

        {/* 관리자 접근 */}
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors"
          >
            ·
          </button>
        ) : (
          <div className="mt-4">
            <div className="flex items-center gap-2 max-w-[200px] mx-auto">
              <input
                type="password"
                value={key}
                onChange={e => { setKey(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                placeholder="Access Code"
                className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 focus:border-neutral-900 focus:outline-none text-center"
                autoFocus
              />
              <button
                onClick={handleUnlock}
                className="px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
              >
                →
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-neutral-300">
          © 2026 Ten:One™ Universe
        </p>
      </div>
    </div>
  );
}
