'use client';

import { Suspense } from 'react';
import SmarCommHeader from '@/components/SmarCommHeader';

function ScanContent() {
  return (
    <>
      <SmarCommHeader />
      <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-14">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 text-xl font-bold text-text">사이트 분석 기능</h1>
          <p className="mb-8 text-sm text-text-muted">
            이 기능은 API 연동 후 활성화됩니다.<br />
            대시보드에서 사이트 진단을 이용해주세요.
          </p>
          <a href="/sc/dashboard/scan" className="inline-block rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
            대시보드 진단으로 이동
          </a>
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
