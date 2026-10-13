import type { Metadata } from "next";

// 페이지가 'use client'라 metadata를 여기서
export const metadata: Metadata = {
    title: "좋은 사람 찾기",
    description: "원하는 인재상에 맞는 HeRo 인재가 몇 명인지, 어떤 사람들인지 확인하고 면접·인터뷰를 제안합니다",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
