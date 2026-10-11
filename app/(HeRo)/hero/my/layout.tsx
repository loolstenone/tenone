import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '마이페이지', description: 'HeRo 활동 현황' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
