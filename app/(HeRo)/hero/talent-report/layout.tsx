import type { Metadata } from "next";

// 페이지가 'use client'(아이콘 컴포넌트를 틀에 넘김)라 metadata를 여기서
export const metadata: Metadata = { title: "인재 풀 리포트", description: "직무별 HeRo 인재의 성향·역량·희망 조건 분포를 익명 통계로 정리한 리포트" };

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
