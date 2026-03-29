"use client";

import { BoardPage } from "@/components/board";

export default function RooKBoardPage() {
    return (
        <BoardPage
            site="rook"
            board="free"
            title="Free Board"
            description="누구나 작성할 수 있는 자랑게시판입니다. 성공작도 망작도 괜찮습니다."
            accentColor="#00d255"
            showWriteButton={true}
        />
    );
}
