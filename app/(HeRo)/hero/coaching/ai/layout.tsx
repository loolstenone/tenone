import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: 'AI 상담', description: 'HIT 검사 결과를 이해한 AI 상담사와 강점·성장 방향·커리어 전략을 1:1로' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
