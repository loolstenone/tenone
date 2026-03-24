'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PipelineRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/sc/dashboard/content'); }, [router]);
  return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-sm text-text-muted">리다이렉트 중...</p></div>;
}
