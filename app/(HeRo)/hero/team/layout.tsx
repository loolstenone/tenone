import type { Metadata } from "next";

// 페이지가 'use client'(아이콘 컴포넌트를 틀에 넘김)라 metadata를 여기서
export const metadata: Metadata = { title: "팀 진단", description: "팀원 기본 성향 검사로 팀의 성향·역할 구성과 빈자리를 분석합니다" };

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
