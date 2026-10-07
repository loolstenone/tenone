"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BoardPage } from "@/components/board";

export default function RooKFreeBoardPage() {
    const router = useRouter();
    const idx = useSearchParams().get("idx");

    // 옛 아임웹 주소 www.rook.co.kr/freeboard/?idx=N&bmode=view → 이전 글 rk-N ([id] 라우트가 실제 글로 연결)
    useEffect(() => {
        if (idx && /^\d+$/.test(idx)) router.replace(`/rook/freeboard/rk-${idx}`);
    }, [idx, router]);

    return (
        <BoardPage
            site="rook"
            board="freeboard"
            title="Free board"
            description="자신의 작품을 자유롭게 자랑해 보세요, 게시판 취지에 맞지 않는 내용은 임의로 삭제할 수 있습니다."
            accentColor="#00d255"
            showWriteButton={true}
        />
    );
}
