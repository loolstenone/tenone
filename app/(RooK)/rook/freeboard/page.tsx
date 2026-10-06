"use client";

import { BoardPage } from "@/components/board";

export default function RooKFreeBoardPage() {
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
