import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '희망 직무', description: '희망 직무를 등록하고 관리합니다' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
