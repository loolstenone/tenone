import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '써치 라이트', description: '기업의 진짜 고민과 원하는 인재상을 정리하는 기업 고민 설문' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
