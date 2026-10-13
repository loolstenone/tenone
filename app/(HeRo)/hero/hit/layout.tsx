import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
export const metadata: Metadata = { title: { default: 'HIT 검사', template: '%s | HeRo' }, description: 'HeRo 통합 검사 — 나를 아는 공통 검사(A·B)와 생애주기별 검사(C~F), 경력 공백·복귀 모듈' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
