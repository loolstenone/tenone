import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '나의 성장 기록', description: '단계·목표·체크인으로 보는 나의 성장 기록' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
