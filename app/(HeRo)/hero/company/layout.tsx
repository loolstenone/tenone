import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '인재 찾기', description: '원하는 인재상을 고르면 조건에 맞는 HeRo 인재 수를 보고 면접을 제안합니다' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
