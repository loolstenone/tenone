'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace('/smarcomm/dashboard/geo/prompts'); }, [router]);
  return null;
}
