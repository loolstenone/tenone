import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '기업 회원', description: '기업을 등록하고 써치 라이트로 좋은 사람을 찾고, 팀 진단으로 팀을 이해합니다' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
