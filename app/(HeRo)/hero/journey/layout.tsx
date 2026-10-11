import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: 'Journey', description: '나의 성장 여정 — 스테이지·목표·체크인' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
