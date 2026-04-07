import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/api-utils';
import { getMembershipTier } from '@/lib/hit/membership-server';

export async function GET() {
  try {
    const { member } = await getAuthenticatedClient();
    const memberId = (member as { id?: string } | null)?.id || null;
    const tier = await getMembershipTier(memberId);
    return NextResponse.json({ tier });
  } catch {
    return NextResponse.json({ tier: 'guest' });
  }
}
