import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

const DISC_COLORS: Record<string, string> = {
  D: '#E53935',
  I: '#FFB300',
  S: '#43A047',
  C: '#1E88E5',
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tenone.biz');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('hit_a_results')
      .select('type_code, type_name_ko, type_nickname, disc_primary')
      .eq('id', id)
      .maybeSingle();

    if (!data) {
      return {
        title: 'HIT 검사 결과',
        description: 'HeRo 영웅 유형 검사 결과를 확인하세요.',
      };
    }

    const { type_code, type_name_ko, type_nickname, disc_primary } = data;
    const title = `${type_code} - ${type_name_ko}`;
    const description = type_nickname
      ? `나의 영웅 유형: ${type_code} "${type_nickname}" (${type_name_ko}). HeRo Talent Agency HIT 검사 결과`
      : `나의 영웅 유형: ${type_code} (${type_name_ko}). HeRo Talent Agency HIT 검사 결과`;

    const ogImageUrl = `${BASE_URL}/api/og/hit?type=${encodeURIComponent(type_code || '')}&name=${encodeURIComponent(type_name_ko || '')}&nick=${encodeURIComponent(type_nickname || '')}`;

    return {
      title,
      description,
      openGraph: {
        title: `나의 영웅 유형: ${title}`,
        description,
        type: 'website',
        siteName: 'HeRo Talent Agency',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `HIT 결과: ${type_code}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `나의 영웅 유형: ${title}`,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: 'HIT 검사 결과',
      description: 'HeRo 영웅 유형 검사 결과를 확인하세요.',
    };
  }
}

export default function HitResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
