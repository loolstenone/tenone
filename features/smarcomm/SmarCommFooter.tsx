'use client';

import { UniverseFooter } from '@/components/UniverseFooter';

export default function SmarCommFooter() {
  return (
    <UniverseFooter
      brandName="SmarComm"
      tagline="AI 기반 올인원 마케팅 커뮤니케이션 플랫폼"
      accentColor="#171717"
      linkColumns={[
        {
          title: 'Menu',
          links: [
            { label: '서비스', href: '/#process' },
            { label: '블로그', href: '/blog' },
            { label: '요금제', href: '/pricing' },
          ],
        },
        {
          title: 'Account',
          links: [
            { label: '회원가입', href: '/signup' },
          ],
        },
      ]}
    />
  );
}
