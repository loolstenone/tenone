import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: '탤런트 에이전시', description: '검사로 본질을 이해하고, AI와 전문가가 경로를 그리고, 기업 앞에 설 무대를 함께 준비합니다' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
