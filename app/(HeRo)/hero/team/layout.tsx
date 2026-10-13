import type { Metadata } from "next";

// 페이지가 'use client'라 metadata를 여기서 — 하위 라우트(참여·리포트)가 있어 template 유지
export const metadata: Metadata = {
    title: { default: "팀 진단", template: "%s | HeRo" },
    description: "팀원들의 HIT 기본 성향 검사로 팀의 역할 분포와 빈자리를 자동 리포트로 보여 줍니다",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
