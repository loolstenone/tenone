import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 하위 라우트(people·tih)가 있어 template 유지
export const metadata: Metadata = {
  title: { default: '써치 라이트', template: '%s | HeRo' },
  description: '기업은 좋은 사람을 찾고, 사람은 좋은 기업을 찾는다',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
