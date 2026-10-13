import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '기업 허브', description: '기업 회원 — 기업 고민 설문 제출·채용 공고 관리' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
