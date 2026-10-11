import type { Metadata } from 'next';

// 페이지가 'use client'라 metadata를 여기서 — 제목 템플릿은 브랜드 layout (`%s | HeRo`)
// 하위(ai)도 템플릿을 이어받게 default+template
export const metadata: Metadata = { title: { default: '커리어 코칭', template: '%s | HeRo' }, description: '이력서·멘토링·로드맵·브랜딩을 하나의 코칭으로' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
