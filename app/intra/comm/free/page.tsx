"use client";

import { BoardPage } from "@/components/board";

export default function FreeBoardPage() {
    return <BoardPage site="tenone" board="free" title="자유게시판" description="내부 소통 공간" accentColor="#171717" isGuest={false} />;
}
