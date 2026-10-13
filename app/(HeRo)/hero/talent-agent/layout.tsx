import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '탤런트 에이전시', description: '검사로 나를 알고, AI와 전문가가 갈 길을 함께 정하고, 회사에 나를 보여 줄 준비를 같이 합니다' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
