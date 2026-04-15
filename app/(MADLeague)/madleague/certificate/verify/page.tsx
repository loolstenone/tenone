'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck } from 'lucide-react';

export default function VerifyIndexPage() {
  const [code, setCode] = useState('');

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-[70vh]">
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#FFC000] mb-4">
          <ShieldCheck className="h-4 w-4" /> CERTIFICATE VERIFY
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">인증서 검증</h1>
        <p className="mt-6 text-neutral-400 leading-relaxed">
          MADLeague가 발급한 인증서의 진위를 확인합니다.
          인증서 하단의 10자리 고유 코드를 입력해주세요.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) window.location.href = `/madleague/certificate/verify/${code.trim().toUpperCase()}`;
          }}
          className="mt-10 flex gap-3"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: AB3CD6EF9Z"
            maxLength={16}
            className="flex-1 bg-black border border-neutral-800 px-4 py-4 text-white text-lg font-mono tracking-widest focus:border-[#FFC000] focus:outline-none"
          />
          <button type="submit" className="bg-[#FFC000] hover:bg-[#e5ad00] text-black font-bold px-6 py-4 inline-flex items-center gap-2">
            <Search className="h-4 w-4" /> 검증
          </button>
        </form>

        <div className="mt-12 text-sm text-neutral-500">
          <Link href="/madleague" className="hover:text-white">← MADLeague 홈</Link>
        </div>
      </section>
    </div>
  );
}
