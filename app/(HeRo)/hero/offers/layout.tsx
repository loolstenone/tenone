import type { Metadata } from "next";

// 페이지가 'use client'라 metadata를 여기서 — 하위 라우트가 있어 template 유지
export const metadata: Metadata = {
    title: { default: "받은 제안", template: "%s | HeRo" },
    description: "기업의 면접·인터뷰 제안을 확인하고 응합니다",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
