import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: { default: 'HIT 검사', template: '%s | HeRo' }, description: 'HeRo Integrated Test — 기저요인·성격·행동·인성·적성으로 나를 아는 검사와 직무별 심화 검사' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
