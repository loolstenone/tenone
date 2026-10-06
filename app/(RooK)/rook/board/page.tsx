import { redirect } from "next/navigation";

/** 옛 경로 — 자유게시판은 /rook/freeboard (원본 rook.co.kr/freeboard와 동일) */
export default function RooKBoardRedirect() {
    redirect("/rook/freeboard");
}
