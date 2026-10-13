import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: 'HeRo 소개', description: 'Human enhancement & Recruit optimization — 사람의 성장을 설계하는 인재 기획사' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
