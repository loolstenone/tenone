'use client';
import { useEffect, useState } from 'react';
import type { MembershipTier, HitFeature } from './membership';
import { canAccess } from './membership';

export function useMembership() {
  const [tier, setTier] = useState<MembershipTier>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/hit/membership')
      .then(r => r.json())
      .then(d => {
        if (!cancelled) setTier((d?.tier as MembershipTier) || 'guest');
      })
      .catch(() => {
        if (!cancelled) setTier('guest');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    tier,
    loading,
    can: (feature: HitFeature) => canAccess(tier, feature),
  };
}
