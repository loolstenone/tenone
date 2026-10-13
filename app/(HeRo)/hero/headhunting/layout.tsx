import type { Metadata } from "next";

// 페이지가 'use client'(아이콘 컴포넌트를 틀에 넘김)라 metadata를 여기서
export const metadata: Metadata = { title: "헤드헌팅", description: "HeRo가 직접 후보를 찾아 추천하고 면접을 조율합니다" };

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
